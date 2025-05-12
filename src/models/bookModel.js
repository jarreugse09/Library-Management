const mongoose = require('mongoose');
const user = require('./userModel');

const BookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: { type: String },
  authors: {
    type: [String],
    required: true,
  },
  publishedYear: {
    type: Number,
  },
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: user, required: true },
  bookType: {
    type: String,
    enum: ['physical', 'ebook', 'copy'],
  },
  genre: {
    type: [String],
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
  maxQuantity: { type: Number, required: false }, //physical only
  quantity: { type: Number, required: false }, // only for physical
  ebookFileUrl: { type: String, required: false }, //for ebook
  coverImageUrl: { type: String }, //for ebook
  condition: {
    type: String,
    enum: ['new', 'good', 'fair', 'poor'],
    default: 'good',
  },
  isApprove: {
    type: Boolean,
    default: false,
  },
  isDone: {
    type: Boolean,
    default: false,
  },
  donatedAt: {
    type: Date,
    default: Date.now,
  },
  averageRating: {
    type: Number,
  },
  ratingCount: {
    type: Number,
  },
});

const book = mongoose.model('book', BookSchema);

module.exports = book;
