const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  donorName: { type: String, required: true },
  title: { type: String, required: true },
  authors: [{ type: String, required: true }],
  description: { type: String },
  publishedYear: { type: Number },
  genre: { type: String, required: true },
  bookType: { type: String, enum: ['physical', 'ebook'], required: true },
  quantity: { type: Number }, // only for physical
  ebookFileUrl: { type: String }, // only for ebook
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);
