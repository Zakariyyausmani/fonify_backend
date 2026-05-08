const express = require('express');
const router = express.Router();
const { 
  register, 
  login, 
  sendOtp, 
  verifyOtp, 
  getProfile, 
  requestEmailChange, 
  verifyOldEmail, 
  confirmNewEmail 
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { registerValidationRules, loginValidationRules, validate } = require('../middleware/validation');

router.post('/register', registerValidationRules(), validate, register);
router.post('/login', loginValidationRules(), validate, login);
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.get('/profile', protect, getProfile);

// Email change routes
router.post('/request-email-change', protect, requestEmailChange);
router.post('/verify-old-email', protect, verifyOldEmail);
router.post('/confirm-new-email', protect, confirmNewEmail);

module.exports = router;
