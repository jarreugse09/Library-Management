const mongoose = require('mongoose');
const { generateDonationId } = require('../utils/generateId'); // update path as needed

const donationSchema = new mongoose.Schema({
  donationId: {
    type: String,
    unique: true,
    default: () => generateDonationId(),
  },
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
    enum: ['pending', 'approved', 'rejected', 'done'],
    default: 'pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Donation', donationSchema);
