const donationController = require('../controllers/donationControllers');
const logController = require('../controllers/logControllers');
const express = require('express');
const router = express.Router();

// Create donation with optional eBook upload
router.post(
  '/donate',
  donationController.upload.fields([
    { name: 'ebookFile', maxCount: 1 }, // Allow ebook file (if it's an ebook or for physical)
    { name: 'coverImage', maxCount: 1 }, // Cover image for both book types
  ]),
  donationController.createDonation
);

// View eBook by filename
router.get('/pending/', donationController.getPending);
router.get('/logs', logController.getAllDonationLogs);
router.get('/approve/', donationController.getApprove);
router.get('/my-book/', donationController.getAllUserDonated);

router.patch('/:id/:action/', donationController.updateDonationStatus);

module.exports = router;
