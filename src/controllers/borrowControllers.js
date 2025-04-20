const BorrowedBook = require('../models/borrowModel'); // You can create a new model for borrowed books
const book = require('../models/bookModel'); // You can create a new model for borrowed books
const Log = require('../models/logModel'); // You can create a new model for borrowed books

// CREATE a borrow request
const createBorrow = async (req, res) => {
  try {
    const {
      bookTitle,
      borrowerName,
      contactInfo,
      borrowDate,
      returnDate,
      notes,
    } = req.body;

    const newRequest = new BorrowedBook({
      bookTitle,
      borrowerName,
      contactInfo,
      borrowDate,
      returnDate,
      notes,
      status: 'pending', // Default status when a borrow request is created
    });

    await newRequest.save();

    res.status(201).json({
      message: 'Borrow request submitted successfully.',
      data: newRequest,
    });
  } catch (error) {
    console.error('Error creating borrow request:', error);
    res.status(500).json({ error: 'Failed to create borrow request.' });
  }
};

const getBorrowRequest = async (req, res) => {
  try {
    const pendingRequests = await BorrowedBook.find({ status: 'pending' });
    res.status(200).json(pendingRequests); // Return the array directly
  } catch (error) {
    console.error('Error fetching borrow requests:', error);
    res.status(500).json({ error: 'Failed to fetch borrow requests.' });
  }
};

// PATCH: approve or reject borrow request
const updateBorrowStatus = async (req, res) => {
  try {
    const { id, action } = req.params;
    const { role } = req.body;

    console.log(req.body);
    if (!['approve', 'reject'].includes(action)) {
      return res
        .status(400)
        .json({ error: 'Invalid action. Must be "approve" or "reject".' });
    }

    // Find the borrow request to update
    const borrowRequest = await BorrowedBook.findOne({
      _id: id,
      status: 'pending',
    });

    console.log(borrowRequest);

    if (!borrowRequest) {
      return res.status(404).json({ error: 'Borrow request not found.' });
    }
    let stats;
    if (action === 'approve') {
      stats = 'approved';
    } else {
      stats = 'rejected';
    }
    const actionLog = // Creating a new log entry
      new Log({
        type: 'BORROW',
        refId: id,
        action: stats,
        role: role,
      });

    await actionLog.save();

    // If the action is "approve", create a BorrowedBook entry
    if (action === 'approve') {
      const availableCount = await book.countDocuments({
        bookType: 'physical',
        title: borrowRequest.bookTitle,
        condition: 'good',
        status: { $ne: 'borrowed' },
      });

      if (availableCount === 0) {
        return res.status(400).json({
          error: 'No available copies of this book to approve the request.',
        });
      }

      const physicalBook = await book.findOneAndUpdate(
        {
          bookType: 'physical',
          title: borrowRequest.bookTitle,
          condition: 'good',
          status: { $ne: 'borrowed' }, // Optional: ensure you're not double-borrowing
        },
        {
          status: 'borrowed',
        },
        {
          new: true,
        }
      );
    }
    await physicalBook.save();

    // Create a new BorrowedBook entry with status "borrowed"
    const borrowedBook = new BorrowedBook({
      bookTitle: borrowRequest.bookTitle,
      borrowerName: borrowRequest.borrowerName,
      contactInfo: borrowRequest.contactInfo,
      borrowDate: borrowRequest.borrowDate,
      returnDate: borrowRequest.returnDate,
      notes: borrowRequest.notes,
      status: 'borrowed', // Set status as borrowed
    });

    await borrowedBook.save();

    res.status(200).json({
      message: `Request ${action}d successfully.`,
      data: borrowedBook,
    });
  } catch (error) {
    console.error('Error updating borrow status:', error);
    res.status(500).json({ error: 'Failed to update borrow request status.' });
  }
};

module.exports = {
  createBorrow,
  getBorrowRequest,
  updateBorrowStatus,
};
