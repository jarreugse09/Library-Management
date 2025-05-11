const express = require('express');
const verifyToken = require('../middlewares/authMiddleware');
const authorizeRoles = require('../middlewares/authorizeRoles');
const User = require('../models/userModel');
const authController = require('../controllers/authControllers');
const userController = require('../controllers/userController');

const router = express.Router();

// ✅ Get all users (Admin Only)
router.get('/', userController.getAllUser);

// ✅ Admin can update user roles
router.patch(
  '/:id',
  // authController.restrictTo('admin'),
  userController.updateUser
);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

module.exports = router;
