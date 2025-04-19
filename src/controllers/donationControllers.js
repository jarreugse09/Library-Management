const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mime = require('mime');
const Donation = require('../models/donationModel');

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

    const donation = new Donation({
      donorName,
      title,
      authors,
      description,
      publishedYear,
      genre,
      bookType,
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
const getEbook = async (req, res) => {
  try {
    const pendingDonations = await Donation.find({ status: 'pending' }).select(
      'donorName title authors bookType publishedYear'
    ); // Only include these fields

    if (!pendingDonations || pendingDonations.length === 0) {
      return res.status(404).json({ message: 'No pending donations found' });
    }

    console.log(pendingDonations);

    res.json(pendingDonations);
  } catch (error) {
    console.error('Error retrieving pending donations:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateDonationStatus = async (req, res) => {
  const { donationId, action } = req.params;
  const validActions = ['approve', 'reject'];

  if (!validActions.includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }

  try {
    const donation = await Donation.findByIdAndUpdate(
      donationId,
      { status: action === 'approve' ? 'approved' : 'rejected' },
      { new: true }
    );

    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    res.json({ message: `Donation ${action}d successfully` });
  } catch (error) {
    console.error(`Error updating donation:`, error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  upload,
  createDonation,
  getEbook,
  updateDonationStatus,
};
