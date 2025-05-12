const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  sendOtp,
  verifyOtp,
} = require('../controllers/authControllers');
const authControllers = require('../controllers/authControllers');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/send-otp', sendOtp);

// OTP verification route
router.post('/verify-otp', verifyOtp);

router.get('/me', authControllers.protect, authControllers.getCurrentUser);
router.post('/:id/update-password', authControllers.updatePassword);

module.exports = router;
