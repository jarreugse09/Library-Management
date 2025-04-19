const express = require('express');
const router = express.Router();
const donationController = require('../controllers/donationControllers');

// Create donation with optional eBook upload
router.post(
  '/donate',
  donationController.upload.single('ebookFile'),
  donationController.createDonation
);

// View eBook by filename
router.get('/pending/', donationController.getEbook);

router.patch(
  '/donations/:donationId/:action',
  donationController.updateDonationStatus
);

module.exports = router;
