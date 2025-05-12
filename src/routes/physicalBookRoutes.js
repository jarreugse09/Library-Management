const express = require('express');
const router = express.Router();
const controller = require('../controllers/physicalBookControllers');
const authController = require('../controllers/authControllers');

// Base URL: /api/books/physical
router.get('/', authController.protect, controller.getAllBooks);
router.get('/admin', authController.protect, controller.getAllBooksAdmin);
router.get('/title', authController.protect, controller.getAllBookTitle);
router.get('/borrowed', authController.protect, controller.getAllBookBorrowed);
router.get('/filter', controller.getAllBookFilter);
router.get('/:id', controller.getBookById);
router.post('/', controller.createBook);
router.patch('/:id', controller.updateBook);
router.delete('/:id/delete', controller.softDeleteBook);
router.delete('/:id/admin', controller.permanentDeleteBook);

module.exports = router;
