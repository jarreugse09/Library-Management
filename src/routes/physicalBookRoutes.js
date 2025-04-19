const express = require('express');
const router = express.Router();
const controller = require('../controllers/physicalBookControllers');

// Base URL: /api/books/physical
router.get('/', controller.getAllBooks);
router.get('/title', controller.getAllBookTitle);
router.get('/borrowed', controller.getAllBookBorrowed);
router.get('/:id', controller.getBookById);
router.post('/', controller.createBook);
router.put('/:id', controller.updateBook);
router.delete('/:id', controller.deleteBook);

module.exports = router;
