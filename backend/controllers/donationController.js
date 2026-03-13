const User = require('../models/User');
const DonationHistory = require('../models/DonationHistory');
const { updateDonorAfterDonation, isDonorEligible } = require('../utils/donorEligibility');

// @desc    Record a successful donation
// @route   POST /api/donations
// @access  Private
const recordDonation = async (req, res) => {
  try {
    const { requestId, recipientName, hospitalName, notes } = req.body;

    // Get donor
    const donor = await User.findById(req.user._id);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    // Check eligibility
    const eligibility = isDonorEligible(donor.lastDonationDate);
    if (!eligibility.eligible) {
      return res.status(400).json({
        message: `You are not eligible to donate yet. Please wait ${eligibility.daysUntilEligible} more days.`,
        nextEligibleDate: eligibility.nextEligibleDate,
      });
    }

    // Update donor stats
    updateDonorAfterDonation(donor);
    await donor.save();

    // Create donation history record
    const donation = await DonationHistory.create({
      donor: donor._id,
      bloodRequest: requestId || null,
      recipientName: recipientName || 'Anonymous',
      hospitalName: hospitalName || 'Not specified',
      donationDate: new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      message: 'Donation recorded successfully',
      donation,
      donor: {
        donationCount: donor.donationCount,
        badgeLevel: donor.donationCount >= 8 ? 'Gold' : donor.donationCount >= 4 ? 'Silver' : 'Bronze',
        reliabilityScore: donor.reliabilityScore,
        lastDonationDate: donor.lastDonationDate,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donor eligibility status
// @route   GET /api/donations/eligibility
// @access  Private
const getEligibility = async (req, res) => {
  try {
    const donor = await User.findById(req.user._id);

    if (!donor) {
      return res.status(404).json({ message: 'Donor not found' });
    }

    const eligibility = isDonorEligible(donor.lastDonationDate);
    const badgeLevel = donor.donationCount >= 8 ? 'Gold' : donor.donationCount >= 4 ? 'Silver' : 'Bronze';

    res.json({
      eligible: eligibility.eligible,
      daysUntilEligible: eligibility.daysUntilEligible,
      nextEligibleDate: eligibility.nextEligibleDate,
      daysSinceLastDonation: eligibility.daysSinceLastDonation,
      lastDonationDate: donor.lastDonationDate,
      donationCount: donor.donationCount,
      badgeLevel,
      reliabilityScore: donor.reliabilityScore,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get donation history
// @route   GET /api/donations/history
// @access  Private
const getDonationHistory = async (req, res) => {
  try {
    const donations = await DonationHistory.find({ donor: req.user._id })
      .populate('bloodRequest', 'patientName bloodGroup hospitalName')
      .sort({ donationDate: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all donations (admin)
// @route   GET /api/donations
// @access  Private/Admin
const getAllDonations = async (req, res) => {
  try {
    const donations = await DonationHistory.find()
      .populate('donor', 'name email bloodGroup city')
      .populate('bloodRequest', 'patientName bloodGroup hospitalName')
      .sort({ donationDate: -1 });

    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  recordDonation,
  getEligibility,
  getDonationHistory,
  getAllDonations,
};
