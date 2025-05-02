const donationController = require('../controllers/donationControllers');
const logController = require('../controllers/logControllers');
const express = require('express');
const router = express.Router();

// Create donation with optional eBook upload
router.post(
  '/donate',
  (req, res, next) => {
    const { bookType } = req.body;

    // Apply file upload middleware only if bookType is 'ebook'
    if (bookType === 'ebook') {
      return donationController.upload.fields([
        { name: 'ebookFile', maxCount: 1 },
        { name: 'coverImage', maxCount: 1 },
      ])(req, res, next);
    }

    // Skip file upload and continue to the controller if it's a physical book or copy
    next();
  },
  donationController.createDonation
);

// View eBook by filename
router.get('/pending/', donationController.getPending);
router.get('/logs', logController.getAllDonationLogs);
router.get('/approve/', donationController.getApprove);

router.patch('/:id/:action/', donationController.updateDonationStatus);

module.exports = router;
