const express = require('express');
const router = express.Router();
const { extractDonorSearch } = require('../controllers/aiController');

// POST /api/ai/extract-donor-search
router.post('/extract-donor-search', extractDonorSearch);

module.exports = router;
