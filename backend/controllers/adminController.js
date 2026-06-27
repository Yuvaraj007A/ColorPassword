const User = require('../models/User');
const LoginHistory = require('../models/LoginHistory');

/**
 * Fetch all users (excluding sensitive colorHash)
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-colorHash').sort({ createdAt: -1 });
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Fetch all login history sorted by latest attempts first
 */
const getLoginHistory = async (req, res) => {
  try {
    const history = await LoginHistory.find().sort({ loginTime: -1 }).limit(100);
    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching login history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Unlock a specific user account
 */
const unlockUser = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.failedAttempts = 0;
    user.lockedUntil = null;
    await user.save();

    return res.status(200).json({ message: `User account '${user.username}' successfully unlocked.` });
  } catch (error) {
    console.error('Error unlocking user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get dashboard security statistics
 */
const getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    
    // Currently locked accounts
    const currentlyLocked = await User.countDocuments({
      lockedUntil: { $gt: new Date() }
    });

    // History stats
    const totalAttempts = await LoginHistory.countDocuments();
    const successfulLogins = await LoginHistory.countDocuments({ status: 'success' });
    const failedLogins = await LoginHistory.countDocuments({ status: 'failed' });
    const lockedAttempts = await LoginHistory.countDocuments({ status: 'locked' });

    // Calculate percentages
    const successRate = totalAttempts > 0 ? ((successfulLogins / totalAttempts) * 100).toFixed(1) : 0;
    const failureRate = totalAttempts > 0 ? (((failedLogins + lockedAttempts) / totalAttempts) * 100).toFixed(1) : 0;

    return res.status(200).json({
      totalUsers,
      currentlyLocked,
      totalAttempts,
      successfulLogins,
      failedLogins,
      lockedAttempts,
      successRate,
      failureRate,
    });
  } catch (error) {
    console.error('Error compiling security stats:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getUsers,
  getLoginHistory,
  unlockUser,
  getStats,
};
