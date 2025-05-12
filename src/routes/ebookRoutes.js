const ebookController = require('../controllers/eBookControllers');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');
const ratingController = require('../controllers/ratingController');
const savedBookController = require('../controllers/savedBookController');

router.get('/', authController.protect, ebookController.getAllEbook);
router.get('/my-book', authController.protect, ebookController.getMyBook);
router.get(
  '/admin',
  authController.protect,
  authController.restrictTo('admin', 'librarian'),
  ebookController.getAllEbookAdmin
);

router.patch(
  '/:id',
  ebookController.upload.fields([
    { name: 'ebookEditFileUrl', maxCount: 1 },
    { name: 'ebookEditCoverImage', maxCount: 1 },
  ]),
  ebookController.updateEbook
);

router.post('/:id/rate', ratingController.rateBook);

router.post(
  '/my-book/save-book',
  authController.protect,
  savedBookController.savedBook
);

router.delete('/my-book/remove-book/:id', savedBookController.removeBook);
router.get(
  '/my-book/saved',
  authController.protect,
  savedBookController.getAllUserSavedBook
);

router.patch('/id/recover', ebookController.recoverEbook);
router.delete('/:id/delete', ebookController.softDelete);
router.delete('/:id/admin', ebookController.deleteBook);

module.exports = router;
