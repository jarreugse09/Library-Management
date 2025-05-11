const Rating = require('../models/ratingModel');
const Book = require('../models/bookModel');

exports.rateBook = async (req, res) => {
  const { userId, bookId, rating } = req.body;

  try {
    // Check if the book exists
    const book = await Book.findById(bookId);
    if (!book) return res.status(404).json({ message: 'Book not found' });

    // Check if user already rated the book
    let existingRating = await Rating.findOne({ user: userId, bookId });

    if (existingRating) {
      // Update existing rating
      const oldRating = existingRating.rating;
      existingRating.rating = rating;
      await existingRating.save();

      // Recalculate average rating
      book.averageRating =
        (book.averageRating * book.ratingCount - oldRating + rating) /
        book.ratingCount;
    } else {
      // Create new rating
      await Rating.create({ user: userId, bookId, rating });

      // Update averageRating and ratingCount
      book.averageRating =
        (book.averageRating * book.ratingCount + rating) /
        (book.ratingCount + 1);
      book.ratingCount += 1;
    }

    await book.save();
    res
      .status(200)
      .json({
        message: 'Rating submitted successfully',
        averageRating: book.averageRating,
      });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
};
