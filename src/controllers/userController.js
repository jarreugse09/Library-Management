const User = require('../models/userModel');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

const getAllUser = catchAsync(async (req, res, next) => {
  const users = await User.find().select('username role status');

  res.status(200).json({
    status: 'success',
    results: users.length,
    users,
  });
});

const updateUser = catchAsync(async (req, res, next) => {
  const { username, role, status } = req.body;
  const { id } = req.params;

  if (!id || !role || !username || !status)
    return next(new AppError('Invalid Empty fields', 400));

  const allowedRoles = ['admin', 'librarian', 'clerk', 'user'];
  const allowedStatuses = ['active', 'deleted'];

  if (!allowedRoles.includes(role)) {
    return next(new AppError('Invalid role assignment', 400));
  }

  if (!allowedStatuses.includes(status)) {
    return next(new AppError('Invalid status assignment', 400));
  }

  const user = await User.findById({ _id: id });
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  user.username = username;
  user.role = role;
  user.status = status;
  await user.save({ validateBeforeSave: false });

  res.status(200).json({ message: 'User updated successfully', user });
});

module.exports = {
  getAllUser,
  updateUser,
};
