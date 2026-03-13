const express = require('express');
const router = express.Router();
const { matchDonorsForRequest } = require('../controllers/matchingController');

router.post('/', matchDonorsForRequest);

module.exports = router;
