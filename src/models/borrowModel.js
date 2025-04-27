// models/BorrowRequest.js
const mongoose = require('mongoose');
const book = require('./bookModel');
const borrowSchema = new mongoose.Schema({
  borrowedBookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book',
  },
  bookTitle: {
    type: String,
    required: true,
  },
  borrowerName: {
    type: String,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  borrowDate: {
    type: Date,
    required: true,
  },
  returnDate: {
    type: Date,
    required: true,
  },
  notes: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'lost', 'returned', 'borrowed'],
    default: 'pending',
  },
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

const BorrowedBook = mongoose.model('BorrowedBook', borrowSchema);

module.exports = BorrowedBook;
