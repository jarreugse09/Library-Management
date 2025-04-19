const mongoose = require('mongoose');
const { generateDonationId } = require('../utils/generateId'); // update path as needed

const physicalBookSchema = new mongoose.Schema({
  borrowId: {
    type: String,
    unique: true,
    default: () => generateDonationId(),
  },
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
    default: 'physical',
  },
  genre: {
    type: String,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  shelfLocation: {
    type: String,
    default: 'To be shelved',
  },
  status: {
    type: String,
    enum: ['borrowed', 'lost', 'good'],
    default: 'good',
  },
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

const PhysicalBook = mongoose.model('PhysicalBook', physicalBookSchema);

module.exports = PhysicalBook;
