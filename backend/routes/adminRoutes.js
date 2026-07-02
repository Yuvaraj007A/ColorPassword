const express = require('express');
const router = express.Router();
const {
  getUsers,
  getLoginHistory,
  unlockUser,
  lockUser,
  toggleRole,
  deleteUser,
  clearLoginHistory,
  resetPasswordOtp,
  getStats
} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/users', verifyAdmin, getUsers);
router.get('/history', verifyAdmin, getLoginHistory);
router.post('/unlock', verifyAdmin, unlockUser);
router.post('/lock', verifyAdmin, lockUser);
router.post('/toggle-role', verifyAdmin, toggleRole);
router.delete('/user/:id', verifyAdmin, deleteUser);
router.delete('/history', verifyAdmin, clearLoginHistory);
router.post('/reset-otp', verifyAdmin, resetPasswordOtp);
router.get('/stats', verifyAdmin, getStats);

module.exports = router;
