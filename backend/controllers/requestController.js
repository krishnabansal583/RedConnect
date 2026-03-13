const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { matchDonors } = require('../utils/donorMatching');

// @desc    Create new blood request
// @route   POST /api/requests
// @access  Private
const createRequest = async (req, res) => {
  try {
    const {
      patientName,
      bloodGroup,
      hospitalName,
      city,
      urgencyLevel,
      contactNumber,
      additionalNotes,
      latitude,
      longitude,
    } = req.body;

    // Create the blood request
    const request = await BloodRequest.create({
      patientName,
      bloodGroup,
      hospitalName,
      city,
      latitude: latitude || null,
      longitude: longitude || null,
      urgencyLevel,
      contactNumber,
      additionalNotes,
      requestedBy: req.user._id,
    });

    // If location is provided, match donors
    let matchedDonors = [];
    if (latitude && longitude) {
      // Fetch all active donors
      const donors = await User.find({ role: 'donor' }).select('-password');

      if (donors.length > 0) {
        // Match donors using the matching algorithm
        const allMatched = matchDonors(donors, {
          bloodGroup,
          city,
          latitude,
          longitude,
        });

        // Get top 5 donors
        matchedDonors = allMatched.slice(0, 5);

        // Save matched donors to request
        request.matchedDonors = matchedDonors.map((donor) => ({
          donor: donor._id,
          distance: donor.distance,
          priorityScore: donor.priorityScore,
        }));
        await request.save();
      }
    }

    res.status(201).json({
      request,
      matchedDonors,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all blood requests
// @route   GET /api/requests
// @access  Public
const getRequests = async (req, res) => {
  try {
    const { urgencyLevel, bloodGroup, city, status } = req.query;

    let query = {};

    if (urgencyLevel) {
      query.urgencyLevel = urgencyLevel;
    }

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (city) {
      query.city = new RegExp(city, 'i');
    }

    if (status) {
      query.status = status;
    } else {
      query.status = 'pending'; // Default to pending requests
    }

    const requests = await BloodRequest.find(query)
      .populate('requestedBy', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single blood request
// @route   GET /api/requests/:id
// @access  Public
const getRequestById = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id).populate(
      'requestedBy',
      'name email phone'
    );

    if (request) {
      res.json(request);
    } else {
      res.status(404).json({ message: 'Request not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update blood request status
// @route   PUT /api/requests/:id
// @access  Private
const updateRequestStatus = async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    const { status } = req.body;

    if (status) {
      request.status = status;
    }

    const updatedRequest = await request.save();
    res.json(updatedRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's blood requests
// @route   GET /api/requests/my-requests
// @access  Private
const getMyRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ requestedBy: req.user._id })
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createRequest,
  getRequests,
  getRequestById,
  updateRequestStatus,
  getMyRequests,
};
