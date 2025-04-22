const borrowControllers = require('../controllers/borrowControllers');
const physicalControllers = require('../controllers/physicalBookControllers');
const express = require('express');
const router = express.Router();

router.post('/create', borrowControllers.createBorrow);

router.get('/pending/', borrowControllers.getBorrowRequest);
router.patch('/:id/:action/', borrowControllers.updateBorrowStatus);

module.exports = router;
