const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  sendOtp,
  verifyOtp,
  requestEmailChange,
  verifyOldEmail,
  confirmNewEmail
} = require('../controllers/auth');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);

// Email change routes
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-old-email', protect, verifyOldEmail);
router.post('/confirm-new-email', protect, confirmNewEmail);

module.exports = router;
