const genreController = require('../controllers/genreControllers');
const express = require('express');
const router = express.Router();

router.get('/', genreController.getAllGenre);
router.get('/create', genreController.createGenre);

module.exports = router;
