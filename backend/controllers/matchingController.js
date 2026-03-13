const User = require('../models/User');
const { matchDonors } = require('../utils/donorMatching');

// @desc    Match donors based on blood request
// @route   POST /api/match-donors
// @access  Public
const matchDonorsForRequest = async (req, res) => {
  try {
    const { bloodGroup, city, latitude, longitude } = req.body;

    // Validate required fields
    if (!bloodGroup || !latitude || !longitude) {
      return res.status(400).json({
        message: 'Blood group, latitude, and longitude are required',
      });
    }

    // Fetch all active donors
    const donors = await User.find({ role: 'donor' }).select('-password');

    if (donors.length === 0) {
      return res.json([]);
    }

    // Match donors using the matching algorithm
    const matchedDonors = matchDonors(donors, {
      bloodGroup,
      city,
      latitude,
      longitude,
    });

    // Return top 5 donors
    const topDonors = matchedDonors.slice(0, 5);

    res.json(topDonors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  matchDonorsForRequest,
};
