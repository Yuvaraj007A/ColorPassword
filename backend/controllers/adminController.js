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
 * Lock a user account for a specific duration (default 2 hours)
 */
const lockUser = async (req, res) => {
  try {
    const { userId, durationHours } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const hours = durationHours !== undefined ? Number(durationHours) : 2;
    user.lockedUntil = new Date(Date.now() + hours * 60 * 60 * 1000);
    await user.save();

    return res.status(200).json({ message: `User account '${user.username}' locked for ${hours} hours.` });
  } catch (error) {
    console.error('Error locking user account:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Toggle user administrator role (isAdmin status)
 */
const toggleRole = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-demotion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot demote yourself from Administrator status.' });
    }

    user.isAdmin = !user.isAdmin;
    await user.save();

    return res.status(200).json({
      message: `Role updated: '${user.username}' is now a ${user.isAdmin ? 'system administrator' : 'standard user'}.`,
      user
    });
  } catch (error) {
    console.error('Error toggling role:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Delete a user profile and clean up associated events
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent self-deletion
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own Administrator account.' });
    }

    await User.findByIdAndDelete(id);
    await LoginHistory.deleteMany({ userId: id });

    return res.status(200).json({ message: `User account '${user.username}' has been deleted.` });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Clear the security logs history stream
 */
const clearLoginHistory = async (req, res) => {
  try {
    await LoginHistory.deleteMany({});
    return res.status(200).json({ message: 'All security audit logs have been successfully cleared.' });
  } catch (error) {
    console.error('Error clearing history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Generate password reset OTP code directly (avoiding email delivery)
 */
const resetPasswordOtp = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry
    await user.save();

    return res.status(200).json({
      message: `Reset OTP code generated for '${user.username}'.`,
      otp,
      email: user.email
    });
  } catch (error) {
    console.error('Error creating reset OTP:', error);
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

    // Advanced analytics
    const suspiciousIps = await LoginHistory.aggregate([
      { $match: { status: { $in: ['failed', 'locked'] } } },
      { $group: { _id: '$ip', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const browserDistribution = await LoginHistory.aggregate([
      { $group: { _id: '$browser', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const osDistribution = await LoginHistory.aggregate([
      { $group: { _id: '$os', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    return res.status(200).json({
      totalUsers,
      currentlyLocked,
      totalAttempts,
      successfulLogins,
      failedLogins,
      lockedAttempts,
      successRate,
      failureRate,
      suspiciousIps,
      browserDistribution,
      osDistribution,
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
  lockUser,
  toggleRole,
  deleteUser,
  clearLoginHistory,
  resetPasswordOtp,
  getStats,
};
