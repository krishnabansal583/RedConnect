// Blood compatibility matrix
const bloodCompatibility = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['A-', 'B-', 'AB-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

// Calculate distance between two cities (mock implementation)
// In production, use actual geolocation API
const calculateDistance = (city1, city2) => {
  if (city1.toLowerCase() === city2.toLowerCase()) {
    return Math.random() * 5; // 0-5 km within same city
  }
  return Math.random() * 50 + 10; // 10-60 km for different cities
};

// Calculate priority score for a donor
const calculatePriorityScore = (donor, requestedBloodGroup, requestCity) => {
  let score = 0;

  // Blood compatibility (40 points)
  if (bloodCompatibility[requestedBloodGroup]?.includes(donor.bloodGroup)) {
    if (donor.bloodGroup === requestedBloodGroup) {
      score += 40; // Exact match
    } else {
      score += 30; // Compatible but not exact
    }
  } else {
    return 0; // Not compatible
  }

  // Distance (30 points)
  const distance = calculateDistance(donor.city, requestCity);
  const distanceScore = Math.max(0, (10 - distance) / 10) * 30;
  score += distanceScore;

  // Reliability score (20 points)
  score += (donor.reliabilityScore / 100) * 20;

  // Donation count (10 points)
  const donationScore = Math.min(donor.donationCount / 20, 1) * 10;
  score += donationScore;

  return {
    score: Math.round(score),
    distance: parseFloat(distance.toFixed(1)),
  };
};

// Sort donors by priority
const sortDonorsByPriority = (donors, requestedBloodGroup, requestCity) => {
  const donorsWithPriority = donors
    .map((donor) => {
      const priority = calculatePriorityScore(
        donor,
        requestedBloodGroup,
        requestCity
      );
      return {
        ...donor.toObject(),
        priorityScore: priority.score,
        distance: priority.distance,
      };
    })
    .filter((donor) => donor.priorityScore > 0); // Remove incompatible donors

  return donorsWithPriority.sort((a, b) => b.priorityScore - a.priorityScore);
};

module.exports = {
  calculatePriorityScore,
  sortDonorsByPriority,
  bloodCompatibility,
};
