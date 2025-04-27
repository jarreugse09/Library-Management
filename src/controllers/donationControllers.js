const multer = require('multer');
const path = require('path');
const book = require('../models/bookModel');
const Log = require('../models/logModel');

// Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/ebooks')); // Store in /uploads/ebooks
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/epub+zip'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or ePub files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Create donation
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      title,
      authors,
      description,
      publishedYear,
      genre,
      bookType,
      quantity,
    } = req.body;

    if (!description)
      return res
        .status(400)
        .json({ error: 'Description is required for  books' });
    let ebookFileUrl = null;

    if (bookType === 'ebook' && req.file) {
      ebookFileUrl = `/uploads/ebooks/${req.file.filename}`;
    }

    if (bookType === 'physical' && (!quantity || quantity <= 0)) {
      return res
        .status(400)
        .json({ error: 'Quantity is required for physical books' });
    }

    if (bookType === 'ebook' && !ebookFileUrl) {
      return res.status(400).json({ error: 'eBook file is required' });
    }

    const donation = new book({
      donorName,
      title,
      authors,
      description,
      publishedYear,
      genre,
      bookType,
      maxQuantity: bookType === 'physical' ? quantity : undefined,
      quantity: bookType === 'physical' ? quantity : undefined,
      ebookFileUrl: bookType === 'ebook' ? ebookFileUrl : undefined,
    });

    await donation.save();

    res
      .status(201)
      .json({ message: 'Donation submitted successfully', donation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create donation' });
  }
};

// View eBook file
const getPending = async (req, res) => {
  try {
    const pendingDonations = await book
      .find({ isApprove: false, isDone: false })
      .select('donorName title authors bookType publishedYear');
    console.log(pendingDonations);

    res.json(pendingDonations);
  } catch (error) {
    console.error('Error retrieving pending donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// View eBook file
const getApprove = async (req, res) => {
  try {
    const pendingDonations = await book
      .find({
        isApprove: true,
        isDone: false,
      })
      .select('donorName title authors bookType publishedYear'); // Only include these fields

    console.log(pendingDonations);

    res.json(pendingDonations);
  } catch (error) {
    console.error('Error retrieving pending donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDonationStatus = async (req, res) => {
  const { id, action } = req.params;

  const validActions = ['approve', 'reject', 'rejected', 'done'];

  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  try {
    console.log('Request Headers:', req.headers); // Add this to check headers
    const { role } = req.body;
    console.log('Request Body:', req.body); // Log req.body to confirm data

    if (!role) {
      return res.status(400).json({ message: 'Role is required' });
    }

    // Finding the donation by id
    let donStat, donation;

    donation = await book.findOne({ _id: id });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updateMap = {
      approve: { update: { isApprove: true }, status: 'approved' },
      done: { update: { isDone: true }, status: 'done' },
      reject: { update: { isApprove: false }, status: 'rejected' },
      rejected: { update: { isDone: false }, status: 'rejected' },
    };

    const { update, status } = updateMap[action] || {
      update: {},
      status: undefined,
    };
    donStat = status;

    // Updating the donation status
    donation = await book.findOneAndUpdate({ _id: id }, update, { new: true });

    // Log action based on the donor
    const actionLog = new Log({
      type: donation.donorName === 'clerk' ? 'ENCODED BY CLERK' : 'DONATION',
      refId: id,
      action: donStat,
      role: role,
    });

    await actionLog.save();

    // If donation status is 'done' and donor is not 'clerk', save a new book
    if (donation.donorName !== 'clerk' && donStat === 'done') {
      const donations = new book({
        donorName: donation.donorName,
        title: donation.title,
        authors: donation.authors,
        description: donation.description,
        publishedYear: donation.publishedYear,
        genre: donation.genre,
        bookType: donation.bookType,
        quantity: donation.quantity,
        ebookFileUrl: donation.ebookFileUrl,
      });

      await donations.save();
    }

    res.status(200).json({
      status: 'Success',
      message: `Donation ${action}d successfully`,
      data: donation,
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: 'fail', message: 'Server error', error: error });
  }
};

module.exports = {
  upload,
  createDonation,
  getPending,
  getApprove,
  updateDonationStatus,
};
