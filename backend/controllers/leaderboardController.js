const User = require('../models/User');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
const getLeaderboard = async (req, res) => {
  try {
    const { limit = 50 } = req.query;

    const donors = await User.find({ role: 'donor' })
      .select('-password')
      .sort({ donationCount: -1, reliabilityScore: -1 })
      .limit(parseInt(limit));

    const leaderboard = donors.map((donor, index) => ({
      rank: index + 1,
      _id: donor._id,
      name: donor.name,
      bloodGroup: donor.bloodGroup,
      city: donor.city,
      donationCount: donor.donationCount,
      reliabilityScore: donor.reliabilityScore,
      badgeLevel: donor.badgeLevel,
    }));

    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getLeaderboard,
};
