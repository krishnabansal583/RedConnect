// Donor eligibility and badge utilities

/**
 * Check if donor is eligible to donate (90-day rule)
 * @param {Date} lastDonationDate - Last donation date
 * @returns {Object} { eligible: boolean, daysUntilEligible: number, nextEligibleDate: Date }
 */
const isDonorEligible = (lastDonationDate) => {
  if (!lastDonationDate) {
    return {
      eligible: true,
      daysUntilEligible: 0,
      nextEligibleDate: null,
    };
  }

  const currentDate = new Date();
  const lastDonation = new Date(lastDonationDate);
  const daysSinceLastDonation = Math.floor(
    (currentDate - lastDonation) / (1000 * 60 * 60 * 24)
  );

  const eligible = daysSinceLastDonation >= 90;
  const daysUntilEligible = eligible ? 0 : 90 - daysSinceLastDonation;

  // Calculate next eligible date
  const nextEligibleDate = new Date(lastDonation);
  nextEligibleDate.setDate(nextEligibleDate.getDate() + 90);

  return {
    eligible,
    daysUntilEligible,
    nextEligibleDate: eligible ? null : nextEligibleDate,
    daysSinceLastDonation,
  };
};

/**
 * Calculate badge level based on donation count
 * @param {Number} donationCount - Total donations
 * @returns {String} Badge level (Bronze, Silver, Gold)
 */
const calculateBadgeLevel = (donationCount) => {
  if (donationCount >= 8) return 'Gold';
  if (donationCount >= 4) return 'Silver';
  return 'Bronze';
};

/**
 * Calculate reliability score
 * @param {Number} donationCount - Total donations
 * @param {Number} successfulResponses - Number of successful responses (optional)
 * @returns {Number} Reliability score (0-100)
 */
const calculateReliabilityScore = (donationCount, successfulResponses = 0) => {
  // Formula: (donationCount * 10) + (successfulResponses * 5)
  // Cap at 100
  const score = donationCount * 10 + successfulResponses * 5;
  return Math.min(score, 100);
};

/**
 * Update donor after successful donation
 * @param {Object} donor - Donor user object
 * @returns {Object} Updated donor data
 */
const updateDonorAfterDonation = (donor) => {
  donor.donationCount += 1;
  donor.lastDonationDate = new Date();
  donor.reliabilityScore = calculateReliabilityScore(donor.donationCount);
  
  return donor;
};

/**
 * Get badge color for UI
 * @param {String} badgeLevel - Badge level
 * @returns {String} Tailwind CSS classes
 */
const getBadgeColor = (badgeLevel) => {
  switch (badgeLevel) {
    case 'Gold':
      return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case 'Silver':
      return 'bg-gray-100 text-gray-700 border-gray-300';
    case 'Bronze':
      return 'bg-orange-100 text-orange-700 border-orange-300';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

module.exports = {
  isDonorEligible,
  calculateBadgeLevel,
  calculateReliabilityScore,
  updateDonorAfterDonation,
  getBadgeColor,
};
