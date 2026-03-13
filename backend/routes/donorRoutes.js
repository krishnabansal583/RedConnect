const express = require('express');
const router = express.Router();
const {
  getDonors,
  getDonorById,
  updateDonor,
} = require('../controllers/donorController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getDonors);
router.get('/:id', getDonorById);
router.put('/:id', protect, updateDonor);

module.exports = router;
