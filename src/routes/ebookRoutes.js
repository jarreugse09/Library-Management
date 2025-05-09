const ebookController = require('../controllers/eBookControllers');
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authControllers');

router.get('/', ebookController.getAllEbook);
router.get(
  '/admin',
  // authController.protect,
  // authController.restrictTo('admin', 'librarian'),
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

router.delete('/:id/delete', ebookController.softDelete);
router.delete('/:id/admin', ebookController.deleteBook);

module.exports = router;
