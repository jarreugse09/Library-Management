const ebookController = require('../controllers/eBookControllers');
const express = require('express');
const router = express.Router();

router.get('/', ebookController.getAllEbook);
router.get('/admin', ebookController.getAllEbookAdmin);

router.patch('/:id', ebookController.uploadFields, ebookController.updateEbook);

module.exports = router;
