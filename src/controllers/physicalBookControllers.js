const PhysicalBook = require('../models/physicalBookModel');

// Get all books
exports.getAllBooks = async (req, res) => {
  try {
    const books = await PhysicalBook.find();
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books' });
  }
};

// Get all book titles only
exports.getAllBookTitle = async (req, res) => {
  try {
    const titles = await PhysicalBook.find({}, 'title'); // Only fetch the "title" field
    res.json(titles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book titles' });
  }
};

exports.getAllBookBorrowed = async (req, res) => {
  try {
    const borrowedBooks = await PhysicalBook.find({ status: 'borrowed' });
    res.json(borrowedBooks);
  } catch (error) {
    console.error('Failed to fetch borrowed physical books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get one book by ID
exports.getBookById = async (req, res) => {
  try {
    const book = await PhysicalBook.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch book' });
  }
};

// Create new book
exports.createBook = async (req, res) => {
  try {
    const newBook = new PhysicalBook(req.body);
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: 'Failed to create book' });
  }
};

// Update book
exports.updateBook = async (req, res) => {
  try {
    const updated = await PhysicalBook.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
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
    const deleted = await PhysicalBook.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete book' });
  }
};
