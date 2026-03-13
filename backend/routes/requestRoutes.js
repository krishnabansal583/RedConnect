const express = require('express');
const router = express.Router();
const {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  getMyRequests,
} = require('../controllers/requestController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createRequest);
router.get('/', getRequests);
router.get('/my-requests', protect, getMyRequests);
router.get('/:id', getRequestById);
router.put('/:id', protect, updateRequestStatus);

module.exports = router;
