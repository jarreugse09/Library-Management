const bookRead = require('../models/readBookModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const createBookRead = catchAsync(async (req, res, next) => {
  const { bookId, pageNumber } = req.body;
  const userId = req.user._id;

  if (!userId) return next(new AppError('User Id required', 400));
  if (!bookId || !pageNumber)
    return next(new AppError('Invalid empty fields.', 400));

  const updated = await bookRead.findOneAndUpdate(
    { bookId, userId },
    { pageNumber },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  res
    .status(200)
    .json({ status: 'success', message: 'Log saved', data: updated });
});

const removeBookRead = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError('Invalid empty field.', 400));

  const read = await bookRead.findByIdAndDelete({ _id: id });
  if (!read)
    return next(
      new AppError("Something went wrong. Can't remove the book.", 500)
    );
  res.status(200).json({ status: 'success', message: 'Successfully removed' });
});

const getAllUserRead = catchAsync(async (req, res, next) => {
  const savedBooks = await bookRead
    .find({ userId: req.user.id })
    .populate('bookId');

  const books = savedBooks
    .filter(entry => entry.bookId) // make sure book is populated
    .map(entry => ({
      book: entry.bookId,
      pageNumber: entry.pageNumber,
    }));

  res.status(200).json({
    status: 'success',
    books: books,
  });
});

module.exports = {
  removeBookRead,
  createBookRead,
  getAllUserRead,
};
