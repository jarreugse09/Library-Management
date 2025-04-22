const book = require('../models/bookModel');

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await book
      .find({
        bookType: 'Physical',
        status: { $ne: 'deleted' },
        isDone: true,
        isApprove: true,
      })
      .select(
        'title authors publishedYear donorName genre quantity shelfLocation status condition'
      );
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// Get all book titles only
exports.getAllBookTitle = async (req, res) => {
  try {
    const titles = await book.find(
      { bookType: 'physical', isDone: true, isApprove: true },
      'title _id'
    ); // Only fetch the "title" field
    res.json(titles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book titles' });
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
      bookType: 'physical',
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
      publishedYear,
      donorName,
      genre,
      quantity,
      shelfLocation,
    } = req.body;

    if (!req.body)
      return res.status(400).json({ message: 'Invalid empty fields' });
    if (
      !title ||
      !authors ||
      !publishedYear ||
      !donorName ||
      !genre ||
      !quantity ||
      !shelfLocation
    )
      return res.status(404).json({ message: 'Invalid empty fields' });

    const newBook = new book(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
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
        authros: authors,
        publishedYear: publishedYear,
        donorName: donorName,
        genre: genre,
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
