const User = require('../models/User');

// ── Eligibility rules ─────────────────────────────────────────────────────────
// Returns array of disqualifying reasons. Empty array = eligible.
function checkEligibility(data) {
  const reasons = [];

  if (data.age < 18)    reasons.push('You must be at least 18 years old to donate.');
  if (data.age > 65)    reasons.push('Donors above 65 years are not eligible.');
  if (data.weight < 50) reasons.push('Minimum weight requirement is 50 kg.');

  if (data.hasDiabetes)       reasons.push('Donors with diabetes are currently not eligible.');
  if (data.hasHeartDisease)   reasons.push('Donors with heart disease are not eligible.');
  if (data.hasHIV)            reasons.push('Donors with HIV are not eligible.');
  if (data.hasHepatitis)      reasons.push('Donors with Hepatitis B/C are not eligible.');
  if (data.recentSurgery)     reasons.push('You must wait 6 months after surgery before donating.');
  if (data.recentTattoo)      reasons.push('You must wait 6 months after a tattoo or piercing.');
  if (data.currentMedications) reasons.push('Donors on blood-thinners or antibiotics are not eligible right now.');
  if (data.isPregnant)        reasons.push('Pregnant donors are not eligible.');
  if (data.alcoholLast24h)    reasons.push('Please avoid alcohol for at least 24 hours before donating.');

  return reasons;
}

// @desc    Submit health screening form
// @route   POST /api/health-screening/submit
// @access  Private
const submitScreening = async (req, res) => {
  try {
    const {
      age,
      weight,
      hasDiabetes,
      hasHeartDisease,
      hasHIV,
      hasHepatitis,
      recentSurgery,
      recentTattoo,
      currentMedications,
      isPregnant,
      alcoholLast24h,
    } = req.body;

    // Basic presence validation
    if (age == null || weight == null) {
      return res.status(400).json({ message: 'Age and weight are required.' });
    }

    const reasons  = checkEligibility(req.body);
    const eligible = reasons.length === 0;

    // Persist result on the user document
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        isHealthScreeningComplete: true,
        // Only promote to donor role if eligible
        ...(eligible && { role: 'donor' }),
        healthScreening: {
          age,
          weight,
          hasDiabetes:         !!hasDiabetes,
          hasHeartDisease:     !!hasHeartDisease,
          hasHIV:              !!hasHIV,
          hasHepatitis:        !!hasHepatitis,
          recentSurgery:       !!recentSurgery,
          recentTattoo:        !!recentTattoo,
          currentMedications:  !!currentMedications,
          isPregnant:          !!isPregnant,
          alcoholLast24h:      !!alcoholLast24h,
          submittedAt:         new Date(),
          eligible,
          ineligibilityReasons: reasons,
        },
      },
      { new: true }
    ).select('-password');

    return res.json({
      eligible,
      reasons,
      role: user.role,
      message: eligible
        ? 'You are eligible to donate blood. Welcome to the donor community!'
        : 'Based on your health information, you are not eligible to donate at this time.',
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get screening status for logged-in user
// @route   GET /api/health-screening/status
// @access  Private
const getScreeningStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      'isHealthScreeningComplete healthScreening role'
    );
    res.json({
      isComplete: user.isHealthScreeningComplete,
      eligible:   user.healthScreening?.eligible ?? null,
      reasons:    user.healthScreening?.ineligibilityReasons ?? [],
      submittedAt: user.healthScreening?.submittedAt ?? null,
      role:       user.role,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { submitScreening, getScreeningStatus };
