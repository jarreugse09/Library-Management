const mongoose = require('mongoose');
const book = require('./bookModel');
const user = require('./userModel');

const BookReadSchema = new mongoose.Schema({
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: book,
    required: true,
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: user, required: true },
  pageNumber: {
    type: Number,
    required: true,
  },
});

const bookRead = mongoose.model('readbook', BookReadSchema);

module.exports = bookRead;
