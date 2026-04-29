const express = require('express');
const router  = express.Router();
const { submitScreening, getScreeningStatus } = require('../controllers/healthScreeningController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // all routes require auth

router.post('/submit', submitScreening);
router.get('/status',  getScreeningStatus);

module.exports = router;
