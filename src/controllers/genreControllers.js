const Genre = require('../models/genreModel');

const getAllGenre = async (req, res) => {
  try {
    const genres = await Genre.find();

    res.status(200).json(genres);
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({ message: 'Failed to retrieve genres' });
  }
};

const createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Genre name is required.' });
    }

    // Check if genre already exists (case-insensitive)
    const existing = await Genre.findOne({
      name: { $regex: `^${name}$`, $options: 'i' },
    });
    if (existing) {
      return res.status(409).json({ message: 'Genre already exists.' });
    }

    const newGenre = new Genre({ name: name.trim() });
    await newGenre.save();

    res
      .status(201)
      .json({ message: 'Genre created successfully.', genre: newGenre });
  } catch (error) {
    console.error('Error creating genre:', error);
    res.status(500).json({ message: 'Failed to create genre.' });
  }
};

module.exports = {
  getAllGenre,
  createGenre,
};
