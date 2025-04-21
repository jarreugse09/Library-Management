const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [String],
    required: true,
  },
  publishedYear: {
    type: Number,
  },
  donorName: {
    type: String,
    required: true,
  },
  bookType: {
    type: String,
    enum: ['physical', 'ebook'],
  },
  genre: {
    type: String,
  },
  quantity: {
    type: Number,
    required: false,
  },
  shelfLocation: {
    type: String,
    required: false,
  },
  status: {
    type: String,
    enum: ['borrowed', 'lost', 'good', 'deleted'],
    default: 'good',
  },
  quantity: { type: Number, required: false }, // only for physical
  ebookFileUrl: { type: String, required: false }, //for ebook
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    default: 'good',
  },
  donatedAt: {
    type: Date,
    default: Date.now,
  },
});

const book = mongoose.model('book', BookSchema);

module.exports = book;
