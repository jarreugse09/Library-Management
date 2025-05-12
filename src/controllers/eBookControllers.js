const path = require('path');
const fs = require('fs');
const book = require('../models/bookModel');
const Rating = require('../models/ratingModel');
const multer = require('multer');
const catchAsync = require('../utils/catchAsync');

// Ensure upload directories exist
const uploadDirectory = directory => {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
};

uploadDirectory(path.join(__dirname, '../uploads/ebooks'));
uploadDirectory(path.join(__dirname, '../uploads/covers'));

// Multer storage configuration
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'ebookEditFileUrl') {
        cb(null, path.join(__dirname, '../uploads/ebooks'));
      } else if (file.fieldname === 'ebookEditCoverImage') {
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
    if (file.fieldname === 'ebookEditFileUrl') {
      const allowedTypes = ['application/pdf', 'application/epub+zip'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF or ePub files are allowed for ebooks'));
      }
    } else if (file.fieldname === 'ebookEditCoverImage') {
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

const getAllEbook = async (req, res) => {
  try {
    const search = (req.query.search || '').toLowerCase();
    const sortField = req.query.sort || 'title'; // default sort
    const sortOrder = req.query.order === 'desc' ? 'desc' : 'asc'; // default asc
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || ''; // Filter by status

    // Build search filters
    let query = {
      bookType: 'ebook', // Can change this as needed
      status: { $ne: 'deleted' },
      isApprove: true,
      isDone: true,
    };

    if (status) {
      query.status = status; // Add status filter if provided
    }

    // Fetch books from DB
    let books = await book.find(query); // Get all books based on the filters

    // Search - modified to match beginning of the string (prefix search)
    if (search) {
      books = books.filter(book => {
        const title = (book.title || '').toLowerCase();
        const authors = book.authors.map(author => author.toLowerCase()); // authors is an array
        return (
          title.startsWith(search) ||
          authors.some(author => author.startsWith(search))
        ); // Match any author
      });
    }

    // Sort
    books.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalBooks = books.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBooks = books.slice(start, end);

    res.json({
      books: paginatedBooks,
      total: totalBooks,
      page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getMyBook = catchAsync(async (req, res, next) => {
  const myBook = await book.find({
    donorId: req.user.id,
    isApprove: true,
    isDone: true,
    status: { $ne: 'deleted' },
  });

  res.status(200).json({
    status: 'success',
    results: myBook.length,
    books: myBook,
  });
});

const getAllEbookAdmin = async (req, res) => {
  try {
    const search = (req.query.search || '').toLowerCase();
    const sortField = req.query.sort || 'title'; // default sort
    const sortOrder = req.query.order === 'desc' ? 'desc' : 'asc'; // default asc
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || ''; // Filter by status

    // Build search filters
    let query = {
      bookType: 'ebook', // Can change this as needed
      isApprove: true,
      isDone: true,
    };

    if (status) {
      query.status = status; // Add status filter if provided
    }

    // Fetch books from DB
    let books = await book.find(query); // Get all books based on the filters

    // Search - modified to match beginning of the string (prefix search)
    if (search) {
      books = books.filter(book => {
        const title = (book.title || '').toLowerCase();
        const authors = book.authors.map(author => author.toLowerCase()); // authors is an array
        return (
          title.startsWith(search) ||
          authors.some(author => author.startsWith(search))
        ); // Match any author
      });
    }

    // Sort
    books.sort((a, b) => {
      const valA = (a[sortField] || '').toString().toLowerCase();
      const valB = (b[sortField] || '').toString().toLowerCase();

      if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    // Aggregate ratings for each book
    const ratingsAggregation = await Rating.aggregate([
      {
        $match: {
          bookId: { $in: books.map(book => book._id) }, // Match books by their IDs
        },
      },
      {
        $group: {
          _id: '$bookId',
          averageRating: { $avg: '$rating' },
          ratingCount: { $sum: 1 },
        },
      },
    ]);

    // Attach ratings to books
    books = books.map(book => {
      const bookRating = ratingsAggregation.find(
        rating => rating._id.toString() === book._id.toString()
      );
      book.averageRating = bookRating ? bookRating.averageRating : 0;
      book.ratingCount = bookRating ? bookRating.ratingCount : 0;
      return book;
    });

    // Pagination
    const totalBooks = books.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedBooks = books.slice(start, end);

    res.json({
      books: paginatedBooks,
      total: totalBooks,
      page,
      totalPages: Math.ceil(totalBooks / limit),
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const updateEbook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, authors, status } = req.body;

    // Fetch the current book details
    const currentBook = await book.findById({ _id: id });
    if (!currentBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Ebook not found' });
    }

    const updateFields = {
      title,
      description,
      authors: authors ? authors.split(',').map(author => author.trim()) : [],
      status,
    };

    // Handle uploaded files and delete old ones
    if (req.files['ebookEditCoverImage']) {
      // If there's an old cover image, delete it
      if (currentBook.coverImageUrl) {
        const oldCoverImagePath = path.join(
          __dirname,
          '..',
          currentBook.coverImageUrl
        );
        fs.unlink(oldCoverImagePath, err => {
          if (err) console.error('Error deleting old cover image:', err);
        });
      }
      updateFields.coverImageUrl = `/uploads/covers/${req.files['ebookEditCoverImage'][0].filename}`;
    }

    if (req.files['ebookEditFileUrl']) {
      // If there's an old ebook file, delete it
      if (currentBook.ebookFileUrl) {
        const oldEbookFilePath = path.join(
          __dirname,
          '..',
          currentBook.ebookFileUrl
        );
        fs.unlink(oldEbookFilePath, err => {
          if (err) console.error('Error deleting old ebook file:', err);
        });
      }
      updateFields.ebookFileUrl = `/uploads/ebooks/${req.files['ebookEditFileUrl'][0].filename}`;
    }

    // Update the book record in the database
    const updatedBook = await book.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedBook) {
      return res
        .status(404)
        .json({ success: false, message: 'Ebook not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Ebook updated successfully',
      book: updatedBook,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Server Error', error: error.message });
  }
};

const softDelete = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the current book details
    const currentBook = await book.findById({ _id: id });
    if (!currentBook || currentBook.status === 'deleted') {
      return res
        .status(404)
        .json({ success: false, message: 'Ebook not found' });
    }

    const updatedBook = await book.findByIdAndUpdate(
      { _id: id },
      { status: 'deleted' },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Ebook deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Server Error', error: error.message });
  }
};
const recoverEbook = async (req, res) => {
  try {
    const { id } = req.params;
    // Fetch the current book details
    const currentBook = await book.findById({ _id: id });
    if (!currentBook || currentBook.status === 'good') {
      return res
        .status(404)
        .json({ success: false, message: 'Ebook not found' });
    }

    const updatedBook = await book.findByIdAndUpdate(
      { _id: id },
      { status: 'good' },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Ebook recover successfully',
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, message: 'Server Error', error: error.message });
  }
};

const deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to delete the book directly using findByIdAndDelete
    const deletedBook = await book.findByIdAndDelete(id);

    // Check if the book was not found
    if (!deletedBook) {
      return res.status(404).json({
        success: false,
        message: 'Ebook not found',
      });
    }

    // Return success response after successful deletion
    res.status(200).json({
      success: true,
      message: 'Ebook deleted successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

module.exports = {
  getAllEbookAdmin,
  getAllEbook,
  getMyBook,
  upload,
  updateEbook,
  softDelete,
  deleteBook,
  recoverEbook,
};
