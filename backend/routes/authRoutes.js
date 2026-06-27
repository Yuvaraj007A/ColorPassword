const express = require('express');
const router = express.Router();
const { verifyUsername, register, login } = require('../controllers/authController');

router.post('/verify-username', verifyUsername);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
