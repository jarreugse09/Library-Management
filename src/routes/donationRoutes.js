const donationController = require('../controllers/donationControllers');
const express = require('express');
const router = express.Router();

// Create donation with optional eBook upload
router.post(
  '/donate',
  donationController.upload.single('ebookFile'),
  donationController.createDonation
);

// View eBook by filename
router.get('/pending/', donationController.getEbook);
router.get('/approve/', donationController.getApproveEbook);

router.patch('/:_id/:action/', donationController.updateDonationStatus);

module.exports = router;
