const ebookController = require('../controllers/eBookControllers');
const express = require('express');
const router = express.Router();

router.get('/', ebookController.getAllEbook);
router.get('/admin', ebookController.getAllEbookAdmin);

router.patch(
  '/:id',
  ebookController.upload.fields([
    { name: 'ebookEditFileUrl', maxCount: 1 },
    { name: 'ebookEditCoverImage', maxCount: 1 },
  ]),
  ebookController.updateEbook
);

module.exports = router;
