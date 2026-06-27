const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');
const { hashColorPattern, verifyColorPattern } = require('../utils/colorAuth');
const jwt = require('jsonwebtoken');
const useragent = require('useragent');

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-12345';

// Helper to extract device info
const getDeviceInfo = (req) => {
  const agent = useragent.parse(req.headers['user-agent']);
  return {
    ip: req.ip || req.connection.remoteAddress || '127.0.0.1',
    browser: agent.toAgent(),
    os: agent.os.toString(),
  };
};

/**
 * Stage 1: Verify if the username exists
 */
const verifyUsername = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'Username not found' });
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return res.status(403).json({
        error: `Account is locked. Try again in ${remainingTime} minutes.`,
        locked: true,
        lockedUntil: user.lockedUntil,
      });
    }

    return res.status(200).json({
      message: 'Username verified',
      email: user.email,
      requireCaptcha: user.failedAttempts >= 5,
    });
  } catch (error) {
    console.error('Error in verifyUsername:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, colors } = req.body;

    if (!username || !email || !colors) {
      return res.status(400).json({ error: 'Username, email, and color password are required' });
    }

    if (!Array.isArray(colors) || colors.length !== 5) {
      return res.status(400).json({ error: 'Color password must contain exactly 5 colors' });
    }

    const normalizedUsername = username.toLowerCase().trim();
    const normalizedEmail = email.toLowerCase().trim();

    // Check duplicates
    const existingUser = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      if (existingUser.username === normalizedUsername) {
        return res.status(400).json({ error: 'Username is already taken' });
      }
      return res.status(400).json({ error: 'Email is already registered' });
    }

    // Hash the color pattern
    const colorHash = await hashColorPattern(colors);

    // Create user
    const newUser = new User({
      username: normalizedUsername,
      email: normalizedEmail,
      colorHash,
    });

    await newUser.save();

    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in register:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login a user
 */
const login = async (req, res) => {
  try {
    const { username, colors, captchaSolved } = req.body;
    const deviceInfo = getDeviceInfo(req);

    if (!username || !colors) {
      return res.status(400).json({ error: 'Username and colors are required' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check account lock
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      const remainingTime = Math.ceil((user.lockedUntil - new Date()) / 1000 / 60);
      return res.status(403).json({
        error: `Account is locked. Try again in ${remainingTime} minutes.`,
        locked: true,
      });
    }

    // Captcha validation if failed attempts >= 5
    if (user.failedAttempts >= 5 && !captchaSolved) {
      return res.status(400).json({
        error: 'CAPTCHA verification is required.',
        requireCaptcha: true,
      });
    }

    // Verify color password
    const isMatch = await verifyColorPattern(user.colorHash, colors);

    if (isMatch) {
      // Reset lock and login attempts
      user.failedAttempts = 0;
      user.lockedUntil = null;
      await user.save();

      // Log successful login
      const history = new LoginHistory({
        userId: user._id,
        username: user.username,
        ip: deviceInfo.ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        status: 'success',
      });
      await history.save();

      // Sign JWT
      const token = jwt.sign(
        { id: user._id, username: user.username, isAdmin: user.isAdmin },
        JWT_SECRET,
        { expiresIn: '2h' }
      );

      return res.status(200).json({
        message: 'Login successful',
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      // Login failed
      user.failedAttempts += 1;

      let responseMsg = `Invalid color pattern. Attempt ${user.failedAttempts} of 5.`;

      // Lock account after 5 consecutive failures
      if (user.failedAttempts >= 5) {
        user.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins lock
        responseMsg = 'Too many failed attempts. Account locked for 15 minutes.';
      }

      await user.save();

      // Log failed login
      const history = new LoginHistory({
        userId: user._id,
        username: user.username,
        ip: deviceInfo.ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        status: user.failedAttempts >= 5 ? 'locked' : 'failed',
      });
      await history.save();

      return res.status(401).json({
        error: responseMsg,
        failedAttempts: user.failedAttempts,
        requireCaptcha: user.failedAttempts >= 5,
        locked: user.failedAttempts >= 5,
      });
    }
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  verifyUsername,
  register,
  login,
};
