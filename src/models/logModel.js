const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['DONATION', 'BORROW', 'ENCODED BY CLERK'],
    required: true,
  },
  refId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'bookType', // Dynamically reference either "Donation" or "Borrow"
  },
  action: {
    type: String,
    enum: ['approved', 'done', 'rejected', 'approve and encode'],
    required: true,
  },
  role: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Log = mongoose.model('Log', LogSchema);

module.exports = Log;
