const book = require('../models/bookModel');

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const search = (req.query.search || '').toLowerCase();
    const sortField = req.query.sort || 'title'; // default sort
    const sortOrder = req.query.order === 'desc' ? 'desc' : 'asc'; // default asc
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || ''; // Filter by status
    const location = req.query.location || ''; // Filter by location

    // Build search filters
    let query = {
      bookType: { $in: ['physical', 'copy'] }, // Can change this as needed
      status: { $ne: 'deleted' },
      isApprove: true,
      isDone: true,
    };

    if (status) {
      query.status = status; // Add status filter if provided
    }

    if (location) {
      query.shelfLocation = { $regex: location, $options: 'i' }; // Case-insensitive location filter
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

// Get all book titles only
exports.getAllBookTitle = async (req, res) => {
  try {
    const titles = await book.find(
      { bookType: 'physical', isDone: true, isApprove: true },
      { _id: 1, title: 1 } // Use projection object for clarity
    );
    res.json(titles);
  } catch (err) {
    console.error('Error fetching book titles:', err);
    res.status(500).json({ error: 'Failed to fetch book titles' });
  }
};

exports.getAllBookFilter = async (req, res) => {
  const { search, status, location } = req.query;

  let query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { authors: { $regex: search, $options: 'i' } },
      { isbn: { $regex: search, $options: 'i' } },
    ];
  }

  if (status) {
    query.status = status;
  }

  if (location) {
    query.shelfLocation = location;
  }

  // Ensure you're filtering by the 'bookType' field properly
  query.bookType = { $in: ['physical', 'copy'] };

  try {
    const books = await book.find(query); // Fetch books that match the query
    res.json(books);
  } catch (error) {
    console.error('Failed to fetch books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getAllBookBorrowed = async (req, res) => {
  try {
    const borrowedBooks = await book.find({
      bookType: 'physical',
      isDone: true,
      isApprove: true,
      status: 'borrowed',
    });

    res.status(200).json(borrowedBooks);
  } catch (error) {
    console.error('Failed to fetch borrowed physical books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one book by ID
exports.getBookById = async (req, res) => {
  try {
    const { id } = req.params;
    const book = await book.findById({
      _id: id,
      bookType: 'physical' || 'copy',
      isDone: true,
      isApprove: true,
    });

    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    const {
      title,
      authors,
      description,
      publishedYear,
      genre,
      bookType,
      quantity,
      shelfLocation,
      condition,
      status,
      donorName,
    } = req.body;

    if (!req.body)
      return res
        .status(400)
        .json({ message: 'Invalid empty fields. Request is empty' });

    // Validate required fields
    if (
      !title ||
      !authors ||
      !publishedYear ||
      !genre ||
      !bookType ||
      !quantity ||
      !shelfLocation ||
      !condition ||
      !status ||
      !donorName
    ) {
      const missingFields = {};

      // Check for missing fields and add to missingFields object
      if (!title) missingFields.title = 'Title is required';
      if (!authors) missingFields.authors = 'Authors are required';
      if (!publishedYear)
        missingFields.publishedYear = 'Published year is required';
      if (!genre) missingFields.genre = 'Genre is required';
      if (!bookType) missingFields.bookType = 'Book type is required';
      if (!quantity) missingFields.quantity = 'Quantity is required';
      if (!shelfLocation)
        missingFields.shelfLocation = 'Shelf location is required';
      if (!condition) missingFields.condition = 'Condition is required';
      if (!status) missingFields.status = 'Status is required';
      if (!donorName) missingFields.donorName = 'Donor name is required';

      return res.status(400).json({
        message: missingFields,
      });
    }

    // Validate publishedYear to ensure it's a valid number
    const validPublishedYear = parseInt(publishedYear, 10);
    if (isNaN(validPublishedYear)) {
      return res.status(400).json({
        message: 'Invalid published year. Please provide a valid number.',
      });
    }

    // Create the new book
    const newBook = new book({
      title,
      authors,
      publishedYear: validPublishedYear,
      genre,
      description,
      bookType,
      quantity,
      shelfLocation,
      condition,
      status,
      donorName,
      isApprove: true,
    });

    // Save the book
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    console.error('Error creating book:', err);
    res.status(400).json({ error: 'Failed to create book' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      authors,
      publishedYear,
      status,
      condition,
      donorName,
      genre,
      quantity,
      shelfLocation,
    } = req.body;

    if (!id || !req.body)
      res.status(404).json({ message: 'Invalid empty fields' });

    const updated = await book.findByIdAndUpdate(
      { _id: id, bookType: 'physical', isDone: true, isApprove: true },
      {
        title: title,
        authors: authors,
        publishedYear: publishedYear,
        donorName: donorName,
        genre: genre,
        status: status,
        condition: condition,
        quantity: quantity,
        shelfLocation: shelfLocation,
      },
      {
        new: true,
      }
    );

    if (!updated) return res.status(404).json({ error: 'Book not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: 'Failed to update book' });
  }
};

// Delete book
exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) res.status(404).json({ message: 'Invalid empty fields' });

    const deleted = await book.findOneAndUpdate(
      { _id: id, bookType: 'physical', isDone: true, isApprove: true },
      { status: 'deleted' },
      { new: true }
    );
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
};
