const multer = require('multer');
const path = require('path');
const book = require('../models/bookModel');
const Log = require('../models/logModel');

// Multer setup
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'ebookFile') {
        cb(null, path.join(__dirname, '../uploads/ebooks'));
      } else if (file.fieldname === 'coverImage') {
        cb(null, path.join(__dirname, '../uploads/covers'));
      } else {
        cb(new Error('Unknown file field'), null);
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      cb(
        null,
        file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
      );
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'ebookFile') {
      const allowedTypes = ['application/pdf', 'application/epub+zip'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF or ePub files are allowed for ebooks'));
      }
    } else if (file.fieldname === 'coverImage') {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only JPG or PNG files are allowed for covers'));
      }
    } else {
      cb(new Error('Unknown file field'));
    }
  },
});

// Controller
const createDonation = async (req, res) => {
  try {
    const {
      donorName,
      title,
      authors,
      description,
      publishedYear,
      shelfLocation,
      genre,
      bookType,
      quantity,
      role,
    } = req.body;

    if (!description) {
      return res
        .status(400)
        .json({ error: 'Description is required for books' });
    }

    let ebookFileUrl = undefined;
    let coverImageUrl = undefined;

    if (bookType === 'ebook') {
      if (!req.files?.ebookFile?.[0] || !req.files?.coverImage?.[0]) {
        return res
          .status(400)
          .json({ error: 'eBook file and cover image are required' });
      }

      ebookFileUrl = `/uploads/ebooks/${req.files.ebookFile[0].filename}`;
      coverImageUrl = `/uploads/covers/${req.files.coverImage[0].filename}`;
    }

    if (bookType === 'physical') {
      if (!quantity || quantity <= 0) {
        return res
          .status(400)
          .json({ error: 'Quantity must be greater than 0' });
      }
      if (!shelfLocation) {
        return res
          .status(400)
          .json({ error: 'Shelf location is required for physical books' });
      }
    }

    const isApprove = donorName === 'ENCODED BY CLERK' ? true : false;

    const donation = new book({
      donorName: donorName,
      title: title,
      authors: authors,
      description: description,
      publishedYear: publishedYear,
      genre: genre,
      bookType: bookType,
      isApprove: isApprove,
      maxQuantity: bookType === 'physical' ? quantity : undefined,
      quantity: bookType === 'physical' ? quantity : undefined,
      shelfLocation: bookType === 'physical' ? shelfLocation : undefined,
      ebookFileUrl: ebookFileUrl,
      coverImageUrl: coverImageUrl,
    });

    // Save the donation first
    await donation.save();

    // Respond immediately after saving donation
    res
      .status(201)
      .json({ message: 'Donation created successfully', donation });

    // Then handle logs **after response is sent**
    if (isApprove) {
      const actionLog = new Log({
        type: 'ENCODED BY CLERK',
        refId: donation._id,
        action: 'approve and encode',
        role: role || 'clerk',
      });

      // Saving action log in background (no await)
      actionLog.save().catch(err => {
        console.error('Failed to save action log:', err.message);
      });
    }
  } catch (error) {
    console.error('Donation creation failed:', error.message);
    return res.status(500).json({ error: error.message });
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
    donation = await book.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    // Log action based on the donor
    const actionLog = new Log({
      type:
        donation.donorName === 'ENCODED BY CLERK'
          ? 'ENCODED BY CLERK'
          : 'DONATION',
      refId: id,
      action: donStat,
      role: role,
    });

    await actionLog.save();

    // If donation status is 'done' and donor is not 'clerk', save a new book
    if (donation.donorName !== 'ENCODED BY CLERK' && donStat === 'done') {
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
