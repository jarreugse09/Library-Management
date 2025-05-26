const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const book = require('../models/bookModel');
const borrow = require('../models/borrowModel');
const user = require('../models/userModel');

const monthNames = [
  '',
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const getAllGenre = catchAsync(
  async (req, res, next) => {
    const genreStats = await book.aggregate([
      { $unwind: '$genre' }, // Flatten the genre array
      {
        $group: {
          _id: '$genre',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          label: '$_id',
          value: '$count',
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json({
      status: 'success',
      results: genreStats.length,
      books: genreStats,
    });
  }
);

const getBookTotal = catchAsync(
  async (req, res, next) => {
    const totalBooks =
      await book.countDocuments();
    const totalPhysicalBooks =
      await book.countDocuments({
        bookType: 'physical',
      });
    const totalEbooks = await book.countDocuments(
      { bookType: 'ebook' }
    );

    res.status(200).json({
      status: 'success',
      books: {
        totalBooks,
        totalPhysicalBooks,
        totalEbooks,
      },
    });
  }
);

const getPhysicalBooksByCondition = catchAsync(
  async (req, res, next) => {
    const conditionCounts = await book.aggregate([
      {
        $match: { bookType: 'physical' },
      },
      {
        $group: {
          _id: '$condition',
          count: { $sum: 1 },
        },
      },
    ]);

    // Define all possible condition labels
    const allConditions = [
      'new',
      'good',
      'fair',
      'poor',
    ];

    // Format into array of { label, value }
    const result = allConditions.map(
      condition => {
        const match = conditionCounts.find(
          c => c._id === condition
        );
        return {
          label: condition,
          value: match ? match.count : 0,
        };
      }
    );

    res.status(200).json({
      status: 'success',
      books: result,
    });
  }
);

const getMonthlyDonated = catchAsync(
  async (req, res, next) => {
    const monthlyStats = await book.aggregate([
      {
        $match: {
          donatedAt: { $ne: null }, // only books with a donatedAt value
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$donatedAt' },
            month: { $month: '$donatedAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
      {
        $project: {
          _id: 0,
          label: {
            $concat: [
              {
                $arrayElemAt: [
                  [
                    '',
                    'January',
                    'February',
                    'March',
                    'April',
                    'May',
                    'June',
                    'July',
                    'August',
                    'September',
                    'October',
                    'November',
                    'December',
                  ],
                  '$_id.month',
                ],
              },
              ' ',
              { $toString: '$_id.year' },
            ],
          },
          value: '$count',
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      books: monthlyStats, // Format: [{ label: "January 2024", value: 5 }, ...]
    });
  }
);

const getMonthlyBorrowed = catchAsync(
  async (req, res, next) => {
    const stats = await borrow.aggregate([
      {
        $match: {
          borrowDate: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$borrowDate' },
            month: { $month: '$borrowDate' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const formattedStats = stats.map(item => ({
      label: `${monthNames[item._id.month]} ${
        item._id.year
      }`,
      value: item.count,
    }));

    res.status(200).json({
      status: 'success',
      results: formattedStats.length,
      books: formattedStats,
    });
  }
);

const getMonthlyUser = catchAsync(
  async (req, res, next) => {
    const stats = await user.aggregate([
      {
        $match: {
          createdAt: { $ne: null },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    const formattedStats = stats.map(item => ({
      label: `${monthNames[item._id.month]} ${
        item._id.year
      }`,
      value: item.count,
    }));

    res.status(200).json({
      status: 'success',
      results: formattedStats.length,
      books: formattedStats,
    });
  }
);

const getTop20Borrowed = catchAsync(
  async (req, res, next) => {
    const topBooks = await borrow.aggregate([
      {
        $match: {
          status: {
            $in: ['borrowed', 'returned'],
          }, // consider only successful borrows
        },
      },
      {
        $group: {
          _id: '$borrowedBookId',
          borrowCount: { $sum: 1 },
          title: { $first: '$bookTitle' }, // get the first title per group
        },
      },
      {
        $sort: { borrowCount: -1 },
      },
      {
        $limit: 20,
      },
      {
        $project: {
          label: '$title',
          value: '$borrowCount',
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      results: topBooks.length,
      books: topBooks,
    });
  }
);
const getTop20 = catchAsync(
  async (req, res, next) => {
    const topBooks = await book
      .find(
        { averageRating: { $ne: null } } // exclude books with no ratings
      )
      .sort({ averageRating: -1 })
      .limit(20)
      .select('title averageRating') // adjust if you want more fields
      .lean();

    const result = topBooks.map(book => ({
      label: book.title,
      value: book.averageRating,
    }));

    res.status(200).json({
      status: 'success',
      results: result.length,
      books: result,
    });
  }
);

const getRoles = catchAsync(
  async (req, res, next) => {
    const roleStats = await user.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          label: '$_id',
          value: '$count',
        },
      },
      { $sort: { value: -1 } },
    ]);

    res.status(200).json({
      status: 'success',
      results: roleStats.length,
      books: roleStats,
    });
  }
);

module.exports = {
  getAllGenre,
  getBookTotal,
  getPhysicalBooksByCondition,
  getMonthlyDonated,
  getMonthlyBorrowed,
  getTop20,
  getRoles,
  getTop20Borrowed,
  getMonthlyUser,
};