const mongoose = require('mongoose');
const Book = require('./bookModel');
const User = require('./userModel');

const savedBookSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // use ObjectId, not String
    ref: User, // use the model name as a string
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId, // use ObjectId, not String
    ref: Book,
    required: true,
  },
});

const SavedBook = mongoose.model('SavedBook', savedBookSchema);

module.exports = SavedBook;
