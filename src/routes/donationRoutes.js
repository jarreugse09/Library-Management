const donationController = require('../controllers/donationControllers');
const logController = require('../controllers/logControllers');
const express = require('express');
const router = express.Router();

// Create donation with optional eBook upload
router.post(
  '/donate',
  donationController.upload.single('ebookFile'),
  donationController.createDonation
);

// View eBook by filename
router.get('/pending/', donationController.getPending);
router.get('/logs', logController.getAllDonationLogs);
router.get('/approve/', donationController.getApprove);

router.patch('/:id/:action/', donationController.updateDonationStatus);

module.exports = router;
