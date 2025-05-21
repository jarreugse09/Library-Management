const express = require('express');
const {
  getAllGenre,
  getBookTotal,
  getMonthlyDonated,
  getPhysicalBooksByCondition,
  getMonthlyBorrowed,
  getTop20,
  getRoles,
} = require('../controllers/dashboardControllers');
const router = express.Router();

router.get('/genre', getAllGenre);

router.get('/total', getBookTotal);

router.get(
  '/physical-book-condition',
  getPhysicalBooksByCondition
);

router.get('/monthly/donated', getMonthlyDonated);

router.get(
  '/monthly/borrowed',
  getMonthlyBorrowed
);

router.get('/top-20', getTop20);

router.get('/roles', getRoles);

module.exports = router;
