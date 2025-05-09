const User = require('../models/userModel');
const util = require('util');
const cryto = require('crypto');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto'); // For OTP generation
const { sendEmail, sendEmailReset } = require('../utils/sendEmail');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: 'Username or email already taken.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // expires in 3 minutes

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user', // default
      otp,
      otpExpires,
      isVerified: false,
    });

    console.log('OTP for verification (send via email in real app):', otp);

    sendEmail({
      email,
      subject: 'LibAG OTP',
      otp,
    });

    res.status(201).json({ message: `User registered. Check email for OTP.` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username ${username} not found.` });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: 'Please verify your account before logging in.' });
    }

    const token = signToken(user._id);

    //Replaced by signToken
    // jwt.sign(
    //   { id: user._id, role: user.role, username: user.username },
    //   process.env.JWT_SECRET,
    //   { expiresIn: '1h' }
    // );

    res.status(200).json({ status: 'success', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

const sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.otp = otp;
    user.otpExpires = otpExpires;
    user.isVerified = false; // Mark as not verified
    await user.save();

    res.status(200).json({ message: 'OTP sent to your email!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending OTP.' });
  }
};

// Verify OTP
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ message: 'User already verified.' });
    }

    if (!user.otpExpires || user.otpExpires < new Date()) {
      return res
        .status(400)
        .json({ message: 'OTP has expired. Please request a new one.' });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({ message: 'Invalid OTP.' });
    }

    await User.findByIdAndUpdate(user._id, {
      isVerified: true,
      otp: null,
      otpExpires: null,
    });

    res
      .status(200)
      .json({ message: 'Verification successful. You can now log in.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying OTP.' });
  }
};

// Admin can update roles
const updateUserRole = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res
        .status(403)
        .json({ message: 'Access denied. Only admin can assign roles.' });
    }

    const { username, newRole } = req.body;
    if (!['poster', 'commenter', 'reactor'].includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role assignment.' });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ message: `User with username ${username} not found.` });
    }

    user.role = newRole;
    await user.save();

    res
      .status(200)
      .json({ message: `User ${username} is now assigned as ${newRole}` });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong.' });
  }
};

// Get current logged-in user
const getCurrentUser = async (req, res) => {
  res.json({ username: req.user.username, role: req.user.role });
};

const protect = catchAsync(async (req, res, next) => {
  let token;
  // 1. get token
  if (
    req.headers.authorization &&
    req.headers.authorization.startWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token)
    return next(
      new AppError('You are not logged in! Please log in to get access', 401)
    );

  //2. verify token
  const decoded = await util.promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  //3. if user exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The user belonging to this token does not exist!', 401)
    );

  //4. if user changed password
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  //Grant access
  req.user = freshUser;
  next();
});

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action.', 403)
      );
    }
    next();
  };
};

const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) return next(new AppError('Invalid empty field.', 400));

  const user = await User.findOne({ email: email });
  if (!user) return next(new AppError('No user found.', 404));

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    'host'
  )}/resetPassword?token=${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and password confirm to ${resetUrl}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmailReset({
      email: user.email,
      subject: 'Your password reset token. Valid for 10 min',
      message,
    });

    res.status(200).json({ status: 200, message: 'Token sent to email' });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

const resetPassword = catchAsync(async (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword)
    return next(new AppError('Invalid empty fields.', 400));

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) return next(new AppError('Token is invalid or expires.', 400));

  const hashedPassword = await bcrypt.hash(req.body.password, 10);

  user.password = hashedPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const token = signToken(user._id);
  res.status(200).json({
    status: 'success',
    token,
  });
});

module.exports = {
  register,
  login,
  updateUserRole,
  getCurrentUser,
  sendOtp,
  verifyOtp,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
};
