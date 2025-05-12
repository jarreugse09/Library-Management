const multer = require('multer');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const book = require('../models/bookModel');
const Log = require('../models/logModel');
const Genre = require('../models/genreModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const app = express();

// 1. Use body-parser for non-file data
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

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

const createDonation = async (req, res) => {
  try {
    const {
      title,
      authors,
      description,
      publishedYear,
      shelfLocation,
      genre,
      bookType,
      quantity,
    } = req.body;
    console.log(req.body);

    console.log('Body:', req.body);
    console.log('Files:', req.files);

    // Validate required fields

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    if (!authors || (Array.isArray(authors) && authors.length === 0)) {
      return res.status(400).json({ error: 'Authors are required' });
    }

    if (!description) {
      return res
        .status(400)
        .json({ error: 'Description is required for books' });
    }

    if (!genre || (Array.isArray(genre) && genre.length === 0)) {
      return res.status(400).json({ error: 'Genre is required' });
    }

    // Handle file upload paths
    let ebookFileUrl;
    let coverImageUrl;

    if (bookType === 'physical') {
      if (!quantity || Number(quantity) <= 0) {
        return res
          .status(400)
          .json({ error: 'Quantity must be greater than 0' });
      }
      req.files = {};
    }

    if (bookType === 'ebook') {
      if (!req.files?.ebookFile?.[0] || !req.files?.coverImage?.[0]) {
        return res
          .status(400)
          .json({ error: 'eBook file and cover image are required' });
      }

      ebookFileUrl = `/uploads/ebooks/${req.files.ebookFile[0].filename}`;
      coverImageUrl = `/uploads/covers/${req.files.coverImage[0].filename}`;
    }

    const isApprove = req.user.role === 'clerk';

    const donationData = {
      donorId: req.user.id,
      title,
      authors,
      description,
      publishedYear,
      genre: genre.map(g => g.toLowerCase()),
      bookType,
      isApprove,
      averageRating:
        bookType === 'physical' || bookType === 'copy' ? undefined : 0,
      ratingCount:
        bookType === 'physical' || bookType === 'copy' ? undefined : 0,
      maxQuantity:
        bookType === 'physical' || bookType === 'copy' ? quantity : undefined,
      quantity:
        bookType === 'physical' || bookType === 'copy' ? quantity : undefined,
      ebookFileUrl,
      coverImageUrl,
    };

    if (
      (bookType === 'physical' || bookType === 'copy') &&
      shelfLocation &&
      shelfLocation.trim() !== ''
    ) {
      donationData.shelfLocation = shelfLocation;
    }

    const donation = new book(donationData);
    if (req.user.role === 'admin') {
      donation.isApprove = true;
      donation.isDone = true;
    }
    await donation.save(); // Don't forget to actually save it

    const actionLog = new Log({
      type:
        req.user.role === 'clerk'
          ? 'ENCODED BY CLERK'
          : req.user.role === 'admin'
          ? 'DONATED BY ADMIN'
          : 'DONATION',
      refId: donation._id,
      action:
        req.user.role === 'clerk'
          ? 'approve and encode'
          : req.user.role === 'admin'
          ? 'donated by admin'
          : 'approved',
      role: req.user.role,
    });

    await actionLog.save().catch(err => {
      console.error('Failed to save action log:', err.message);
    });

    return res.status(201).json({
      message: 'Donation created successfully',
      data: donation,
    });
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

      .select('title authors bookType publishedYear')
      .populate('donorId', 'username');
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
      .select('title authors bookType publishedYear')
      .populate('donorId', 'username'); // Only include these fields

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
    let donation = await book.findOne({ _id: id });
    if (!donation) {
      return res.status(404).json({ message: 'Donation not found' });
    }

    const updateMap = {
      approve: { update: { isApprove: true }, status: 'approved' },
      done: { update: { isDone: true }, status: 'done' },
      reject: { update: { isApprove: false }, status: 'rejected' },
      rejected: { update: { isDone: false }, status: 'rejected' },
    };

    const { update, status: donStat } = updateMap[action];
    donation = await book.findOneAndUpdate(
      { _id: id },
      { $set: update },
      { new: true }
    );

    const actionLog = new Log({
      type: req.user.role === 'clerk' ? 'ENCODED BY CLERK' : 'DONATION',
      refId: id,
      action: donStat,
      role: req.user.role,
    });
    await actionLog.save();

    let newBookEntry;

    // Genre handling — if both isDone and isApprove are true
    if (donation.isDone === true && donation.isApprove === true) {
      const existingGenres = await Genre.find();
      const allowedGenres = existingGenres.map(g => g.name.toLowerCase());

      const invalidGenres = donation.genre.filter(
        g => !allowedGenres.includes(g.toLowerCase())
      );

      if (invalidGenres.length > 0) {
        const newGenres = invalidGenres.map(g => ({ name: g.toLowerCase() }));
        await Genre.insertMany(newGenres);
      }
    }

    return res.status(200).json({
      status: 'Success',
      message: `Donation ${action}d successfully`,
      data: donation,
    });
  } catch (error) {
    console.error('Error updating donation:', error);
    return res
      .status(500)
      .json({ status: 'fail', message: 'Server error', error });
  }
};

const getAllUserDonated = catchAsync(async (req, res, next) => {
  const books = await book.find({ donorId: req.user.id });

  res.status(200).json({
    status: 'Success',
    message: `Books retrieved successfully`,
    books: books,
  });
});

module.exports = {
  upload,
  createDonation,
  getPending,
  getApprove,
  updateDonationStatus,
  getAllUserDonated,
};
