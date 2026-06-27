const mongoose = require('mongoose');

const LoginHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // can be null for login failures where user is not found or not matched
  },
  username: {
    type: String, // store the username used during login attempt
    required: true,
  },
  ip: {
    type: String,
    required: true,
  },
  browser: {
    type: String,
    required: true,
  },
  os: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['success', 'failed', 'locked'],
    required: true,
  },
  loginTime: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('LoginHistory', LoginHistorySchema);
