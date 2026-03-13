const express = require('express');
const router = express.Router();
const {
  getCampuses,
  getCampusById,
  createCampus,
  joinCampus,
  leaveCampus,
  getMyCampus,
} = require('../controllers/campusController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getCampuses);
router.post('/', createCampus);
router.get('/my-campus', protect, getMyCampus);
router.post('/join', protect, joinCampus);
router.post('/leave', protect, leaveCampus);
router.get('/:id', getCampusById);

module.exports = router;
