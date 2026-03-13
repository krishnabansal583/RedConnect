const express = require('express');
const router = express.Router();
const {
  recordDonation,
  getEligibility,
  getDonationHistory,
  getAllDonations,
} = require('../controllers/donationController');
const { protect } = require('../middleware/authMiddleware');

// All routes require authentication
router.use(protect);

// Record donation
router.post('/', recordDonation);

// Get eligibility status
router.get('/eligibility', getEligibility);

// Get donation history
router.get('/history', getDonationHistory);

// Get all donations (could add admin middleware)
router.get('/all', getAllDonations);

module.exports = router;
