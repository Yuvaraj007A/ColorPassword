const express = require('express');
const router = express.Router();
const { getUsers, getLoginHistory, unlockUser, getStats } = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/auth');

router.get('/users', verifyAdmin, getUsers);
router.get('/history', verifyAdmin, getLoginHistory);
router.post('/unlock', verifyAdmin, unlockUser);
router.get('/stats', verifyAdmin, getStats);

module.exports = router;
