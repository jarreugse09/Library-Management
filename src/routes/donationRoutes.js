const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationControllers');
const upload = require('../middlewares/upload'); // adjust path as needed

// Post route to create a donation with eBook upload
router.post(
  '/donate',
  donationController.upload.single('ebookFile'),
  donationController.createDonation
);

module.exports = router;
