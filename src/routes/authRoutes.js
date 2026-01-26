const express = require("express");
const {
  register,
  login,
  getCurrentUser,
  sendOtp,
  verifyOtp,
  logout,
  forgotPassword,
  resetPassword,
} = require("../controllers/authControllers");
const authControllers = require("../controllers/authControllers");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);

router.post("/send-otp", sendOtp);

// OTP verification route
router.post("/verify-otp", verifyOtp);

// Password reset routes (no auth required - user is not logged in)
router.post("/forgot-password", forgotPassword);
router.patch("/resetPassword/:token", resetPassword);

router.get("/me", authControllers.protect, authControllers.getCurrentUser);
router.post(
  "/:id/update-password",
  authControllers.protect,
  authControllers.updatePassword,
);

module.exports = router;
