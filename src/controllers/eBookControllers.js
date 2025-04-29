const book = require('../models/bookModel');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer storage for cover image
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/cover');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

// Multer storage for ebook file
const ebookStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, '../uploads/ebooks');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '_' + file.originalname);
  },
});

// Multer file filter to separate files
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'ebookEditCoverImage') {
        cb(null, '../uploads/cover');
      } else if (file.fieldname === 'ebookEditFileUrl') {
        cb(null, '../uploads/ebooks');
      } else {
        cb(new Error('Unknown file field'), null);
      }
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + '_' + file.originalname);
    },
  }),
});

// Upload fields setup
const uploadFields = upload.fields([
  { name: 'ebookEditCoverImage', maxCount: 1 },
  { name: 'ebookEditFileUrl', maxCount: 1 },
]);

exports.getAllEbook = async (req, res) => {
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

exports.getAllEbookAdmin = async (req, res) => {
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

// controllers/ebookController.js

// Update ebook controller
const updateEbook = async (req, res) => {
  const { id } = req.params;
  const { title, authors, publishedYear, genre } = req.body;

  try {
    // Validate required fields
    if (!title || !authors || !publishedYear || !genre) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the existing ebook
    const ebook = await book.findById(id);
    if (!ebook) {
      return res.status(404).json({ message: 'Ebook not found' });
    }

    let coverImageUrl = ebook.coverImageUrl;
    let ebookFileUrl = ebook.ebookFileUrl;

    // Handle uploaded files
    if (req.files) {
      if (req.files.coverImage && req.files.coverImage.length > 0) {
        const coverImage = req.files.coverImage[0];
        const newCoverPath = path.join('uploads/cover', coverImage.filename);

        // Delete old cover image
        if (ebook.coverImageUrl) {
          const oldCoverPath = path.join(__dirname, '..', ebook.coverImageUrl);
          if (fs.existsSync(oldCoverPath)) {
            fs.unlinkSync(oldCoverPath);
          }
        }

        coverImageUrl = `/${newCoverPath}`;
      }

      if (req.files.ebookFile && req.files.ebookFile.length > 0) {
        const ebookFile = req.files.ebookFile[0];
        const newEbookPath = path.join('uploads/ebooks', ebookFile.filename);

        // Delete old ebook file
        if (ebook.ebookFileUrl) {
          const oldEbookPath = path.join(__dirname, '..', ebook.ebookFileUrl);
          if (fs.existsSync(oldEbookPath)) {
            fs.unlinkSync(oldEbookPath);
          }
        }

        ebookFileUrl = `/${newEbookPath}`;
      }
    }

    // Update fields
    ebook.title = title;
    ebook.authors = Array.isArray(authors)
      ? authors
      : authors.split(',').map(a => a.trim());
    ebook.publishedYear = Number(publishedYear);
    ebook.genre = genre;
    ebook.coverImageUrl = coverImageUrl;
    ebook.ebookFileUrl = ebookFileUrl;

    await ebook.save();

    res.status(200).json({ message: 'Ebook updated successfully', ebook });
  } catch (error) {
    console.error('Error updating ebook:', error);
    res
      .status(500)
      .json({ message: 'Failed to update ebook', error: error.message });
  }
};

exports.uploadFields = uploadFields;
exports.updateEbook = updateEbook;
