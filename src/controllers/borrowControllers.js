const BorrowedBook = require('../models/borrowModel'); // You can create a new model for borrowed books
const book = require('../models/bookModel'); // You can create a new model for borrowed books
const Log = require('../models/logModel'); // You can create a new model for borrowed books

// CREATE a borrow request
const createBorrow = async (req, res) => {
  try {
    const {
      borrowedBookId,
      borrowerName,
      contactInfo,
      borrowDate,
      returnDate,
      notes,
    } = req.body;
    if (
      !req.body ||
      !borrowedBookId ||
      !borrowerName ||
      !contactInfo ||
      !borrowDate ||
      !returnDate
    )
      return res
        .status(400)
        .json({ status: 'Failed', message: 'Invalid empty fields' });

    const fetchBook = await book.findById(borrowedBookId);
    if (!fetchBook)
      return res
        .status(400)
        .json({ status: 'Failed', message: 'Invalid empty fields' });

    const newRequest = new BorrowedBook({
      borrowedBookId: fetchBook._id,
      bookTitle: fetchBook.title,
      borrowerName: borrowerName,
      contactInfo: contactInfo,
      borrowDate: borrowDate,
      returnDate: returnDate,
      notes: notes || undefined,
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
    console.log(req.params);
    console.log(req.body);
    if (!['approve', 'reject'].includes(action)) {
      return res.status(404).json({ error: 'Invalid action.' });
    }
    if (!req.params | !req.body) {
      return res.status(400).json({ error: 'Invalid empty fields.' });
    }

    // Find the borrow request to update
    const borrowRequest = await BorrowedBook.findOne({
      _id: id,
      status: 'pending',
    });

    if (!borrowRequest)
      return res.status(400).json({ message: 'Request not found' });

    let stats;
    if (action === 'approve') {
      stats = 'approved';
    }
    if (action == 'reject') {
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

    if (action === 'reject') {
      borrowRequest.status = 'rejected';
      console.log('rejected successfully');
      return res
        .status(404)
        .json({ status: 'Failed', message: 'Book cannot be borrowed' });
    }
    // If the action is "approve", create a BorrowedBook entry
    if (action === 'approve') {
      // Find the book by ID
      const availableCount = await book.findById(borrowRequest.borrowedBookId);

      if (!availableCount) {
        return res.status(404).json({
          error: 'Book not found',
        });
      }

      // Check if there are available copies of the book
      if (availableCount.quantity === 0) {
        return res.status(400).json({
          error: 'No available copies of this book to approve the request.',
        });
      }

      // Update the status to 'borrowed' and decrement the quantity
      availableCount.status = 'borrowed';
      availableCount.quantity -= 1; // Decrease the quantity by 1

      // Save the updated book document
      await availableCount.save();

      borrowRequest.status = 'borrowed';

      await borrowRequest.save();

      res.status(200).json({
        message: `Request ${action}d successfully.`,
        data: borrowRequest,
      });
    }
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
