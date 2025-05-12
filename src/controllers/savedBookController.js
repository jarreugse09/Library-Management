const SavedBook = require('../models/savedBookModel');
const Book = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');

const getAllUserSavedBook = catchAsync(async (req, res, next) => {
  const savedBooks = await SavedBook.find({ userId: req.user.id }).populate(
    'bookId'
  );

  const books = savedBooks.map(entry => entry.bookId); // already populated

  res.status(200).json({
    status: 'success',
    books: books,
  });
});

const savedBook = catchAsync(async (req, res, next) => {
  const { bookId } = req.body;
  if (!bookId) return next(new AppError('Invalid Empty fields', 400));

  const exist = await SavedBook.find({ userId: req.user.id, bookId: bookId });
  if (exist.length > 0)
    return res.status(200).json({
      message: 'Book is already added to library',
    });

  const book = await Book.findById(bookId);
  if (!book) return next(new AppError('Book not found', 404));

  const saveBook = await SavedBook.create({
    userId: req.user.id,
    bookId: book._id,
  });

  res.status(201).json({
    status: 'success',
    message: 'Book Added to library',
    books: saveBook,
  });
});

const removeBook = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  if (!id) return next(new AppError('Invalid Empty fields', 400));

  const book = await Book.findByIdAndDelete(id);
  if (!book) return next(new AppError('Book not found', 404));

  res.status(201).json({
    status: 'success',
    message: 'Book is removed to library',
  });
});

module.exports = {
  getAllUserSavedBook,
  savedBook,
  removeBook,
};
