const express = require('express');
const {
  register,
  login,
  getCurrentUser,
  sendOtp,
  verifyOtp,
} = require('../controllers/authControllers');
const verifyToken = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const authControllers = require('../controllers/authControllers');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.post('/send-otp', sendOtp);

// OTP verification route
router.post('/verify-otp', verifyOtp);

router.get('/me', authControllers.protect, authControllers.getCurrentUser);
router.post(
  '/:id/update-password',
  authControllers.protect,
  authControllers.updatePassword
);

module.exports = router;

// router.get('/me', verifyToken, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('username role');
//     if (!user) return res.status(404).json({ message: 'User not found' });
//     res.json(user);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });
