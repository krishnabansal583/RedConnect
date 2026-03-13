const { isDonorEligible } = require('./donorEligibility');

// Blood compatibility matrix - who can donate to whom
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

// Haversine formula to calculate distance between two coordinates
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return parseFloat(distance.toFixed(2));
};

const toRad = (value) => {
  return (value * Math.PI) / 180;
};

// Check if donor blood group is compatible with required blood group
const isCompatible = (donorBloodGroup, requiredBloodGroup) => {
  return bloodCompatibility[requiredBloodGroup]?.includes(donorBloodGroup) || false;
};

// Calculate priority score for a donor
const calculatePriorityScore = (donor, distance) => {
  // Formula: (100 - distance) + (reliabilityScore * 0.5) + (donationCount * 5)
  const distanceScore = Math.max(0, 100 - distance);
  const reliabilityContribution = (donor.reliabilityScore || 80) * 0.5;
  const donationContribution = (donor.donationCount || 0) * 5;
  
  const totalScore = distanceScore + reliabilityContribution + donationContribution;
  
  return Math.round(totalScore);
};

// Match donors based on blood request
const matchDonors = (donors, requestData) => {
  const { bloodGroup, latitude, longitude } = requestData;
  
  // Filter compatible donors
  const compatibleDonors = donors.filter((donor) =>
    isCompatible(donor.bloodGroup, bloodGroup)
  );
  
  // Filter eligible donors (90-day rule)
  const eligibleDonors = compatibleDonors.filter((donor) => {
    const eligibility = isDonorEligible(donor.lastDonationDate);
    return eligibility.eligible;
  });
  
  // Calculate distance and priority score for each donor
  const donorsWithScores = eligibleDonors.map((donor) => {
    const distance = calculateDistance(
      latitude,
      longitude,
      donor.latitude || 28.7041, // Default to Delhi if no location
      donor.longitude || 77.1025
    );
    
    const priorityScore = calculatePriorityScore(donor, distance);
    
    // Get badge level
    const badgeLevel = donor.donationCount >= 8 ? 'Gold' : 
                       donor.donationCount >= 4 ? 'Silver' : 'Bronze';
    
    // Get eligibility info
    const eligibility = isDonorEligible(donor.lastDonationDate);
    
    return {
      ...donor.toObject(),
      distance,
      priorityScore,
      badgeLevel,
      eligibility,
    };
  });
  
  // Sort by priority score (highest first)
  donorsWithScores.sort((a, b) => b.priorityScore - a.priorityScore);
  
  return donorsWithScores;
};

module.exports = {
  calculateDistance,
  isCompatible,
  calculatePriorityScore,
  matchDonors,
  bloodCompatibility,
};
