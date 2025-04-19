const mongoose = require('mongoose');

const physicalBookSchema = new mongoose.Schema({
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  bookType: {
    type: String,
    default: 'physical',
  },
  quantity: {
    type: Number,
    default: 1,
  },
  shelfLocation: {
    type: String,
    default: 'To be shelved',
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
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const PhysicalBook = mongoose.model('PhysicalBook', physicalBookSchema);

module.exports = PhysicalBook;
