const borrowControllers = require('../controllers/borrowControllers');
const express = require('express');
const router = express.Router();

router.post('/create', borrowControllers.createBorrow);

router.get('/pending/', borrowControllers.getBorrowRequest);
router.patch('/:_id/:action/', borrowControllers.updateBorrowStatus);

module.exports = router;
