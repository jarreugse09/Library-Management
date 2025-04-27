const Log = require('../models/logModel'); // You can create a new model for borrowed books
const Borrow = require('../models/borrowModel');

const getAllBorrowedLogs = async (req, res) => {
  try {
    const logs = await Log.find({
      type: 'BORROW',
    })
      .populate({
        path: 'refId',
        model: Borrow, // Must match the model name exactly
        select: 'bookTitle borrowerName borrowDate returnDate',
      })
      .sort({ timestamp: -1 });

    const formatted = logs.map(log => ({
      bookTitle: log.refId?.bookTitle || 'N/A',
      borrowerName: log.refId?.borrowerName || 'N/A',
      borrowDate: log.refId?.borrowDate,
      returnDate: log.refId?.returnDate,
    }));

    res.status(200).json(formatted);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to fetch logs', error: error.message });
  }
};

const getAllDonationLogs = async (req, res) => {
  try {
    const logs = await Log.find({
      type: 'DONATION' || 'ENCODED BY CLERK',
    }).sort({ timestamp: -1 });

    res.status(200).json(logs);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Failed to fetch logs', error: error.message });
  }
};

module.exports = { getAllBorrowedLogs, getAllDonationLogs };
