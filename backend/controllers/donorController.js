const User = require('../models/User');
const { sortDonorsByPriority } = require('../utils/priorityCalculator');

// @desc    Get all donors with optional filters
// @route   GET /api/donors
// @access  Public
const getDonors = async (req, res) => {
  try {
    const { bloodGroup, city, requestedBloodGroup, requestCity } = req.query;

    let query = { role: 'donor' };

    if (bloodGroup) {
      query.bloodGroup = bloodGroup;
    }

    if (city) {
      query.city = new RegExp(city, 'i'); // Case-insensitive search
    }

    const donors = await User.find(query).select('-password');

    // If priority matching is requested
    if (requestedBloodGroup && requestCity) {
      const sortedDonors = sortDonorsByPriority(
        donors,
        requestedBloodGroup,
        requestCity
      );
      return res.json(sortedDonors);
    }

    // Add badge level to response
    const donorsWithBadge = donors.map((donor) => ({
      ...donor.toObject(),
      badgeLevel: donor.badgeLevel,
    }));

    res.json(donorsWithBadge);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single donor by ID
// @route   GET /api/donors/:id
// @access  Public
const getDonorById = async (req, res) => {
  try {
    const donor = await User.findById(req.params.id).select('-password');

    if (donor && donor.role === 'donor') {
      res.json({
        ...donor.toObject(),
        badgeLevel: donor.badgeLevel,
      });
    } else {
      res.status(404).json({ message: 'Donor not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update donor profile
// @route   PUT /api/donors/:id
// @access  Private
const updateDonor = async (req, res) => {
  try {
    const donor = await User.findById(req.params.id);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Check if user is updating their own profile
    if (donor._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { name, bloodGroup, city, phone } = req.body;

    donor.name = name || donor.name;
    donor.bloodGroup = bloodGroup || donor.bloodGroup;
    donor.city = city || donor.city;
    donor.phone = phone || donor.phone;

    const updatedDonor = await donor.save();

    res.json({
      _id: updatedDonor._id,
      name: updatedDonor.name,
      email: updatedDonor.email,
      bloodGroup: updatedDonor.bloodGroup,
      city: updatedDonor.city,
      phone: updatedDonor.phone,
      donationCount: updatedDonor.donationCount,
      reliabilityScore: updatedDonor.reliabilityScore,
      badgeLevel: updatedDonor.badgeLevel,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDonors,
  getDonorById,
  updateDonor,
};
