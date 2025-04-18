const multer = require('multer');
const path = require('path');
const Donation = require('../models/donationModel');

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/ebooks'); // Directory to store eBook files
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// Filter for valid eBook file types (pdf, epub, etc.)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/epub+zip'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF or ePub files are allowed'), false);
  }
};

// Initialize multer upload middleware
const upload = multer({ storage, fileFilter });

// Create a new donation (handle file upload)
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      title,
      authors,
      publishedYear,
      genre,
      bookType,
      quantity,
    } = req.body;

    let ebookFileUrl = null;

    // Handle eBook file path if uploaded
    if (bookType === 'ebook' && req.file) {
      ebookFileUrl = `/uploads/ebooks/${req.file.filename}`; // Make path usable in frontend
    }

    // Validation
    if (bookType === 'physical' && (!quantity || quantity <= 0)) {
      return res
        .status(400)
        .json({ error: 'Quantity is required for physical books' });
    }

    if (bookType === 'ebook' && !ebookFileUrl) {
      return res.status(400).json({ error: 'eBook file is required' });
    }

    // Create donation document
    const donation = new Donation({
      donorName,
      title,
      authors,
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

// Export
module.exports = {
  upload, // multer middleware
  createDonation,
};
