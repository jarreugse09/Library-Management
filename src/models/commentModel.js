const mongoose = require('mongoose');
const book = require('./bookModel');
const user = require('./userModel');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'book',
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  commentedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Comment', commentSchema);
