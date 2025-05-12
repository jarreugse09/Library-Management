const mongoose = require('mongoose');
const book = require('./bookModel');
const user = require('./userModel');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: user,
    required: true,
  },
  bookId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: book,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Rating', ratingSchema);
