require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

// Dummy donors with locations in Delhi NCR
const dummyDonors = [
  {
    name: 'Rajesh Kumar',
    email: 'rajesh@example.com',
    password: 'password123',
    bloodGroup: 'O+',
    city: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    donationCount: 12,
    reliabilityScore: 95,
    role: 'donor',
    lastDonationDate: new Date('2024-10-15'), // Eligible (>90 days)
  },
  {
    name: 'Priya Sharma',
    email: 'priya@example.com',
    password: 'password123',
    bloodGroup: 'A+',
    city: 'Noida',
    latitude: 28.5355,
    longitude: 77.3910,
    donationCount: 8,
    reliabilityScore: 88,
    role: 'donor',
    lastDonationDate: new Date('2025-01-10'), // Not eligible yet
  },
  {
    name: 'Amit Singh',
    email: 'amit@example.com',
    password: 'password123',
    bloodGroup: 'B+',
    city: 'Ghaziabad',
    latitude: 28.6692,
    longitude: 77.4538,
    donationCount: 15,
    reliabilityScore: 92,
    role: 'donor',
    lastDonationDate: new Date('2024-11-20'), // Eligible
  },
  {
    name: 'Sneha Patel',
    email: 'sneha@example.com',
    password: 'password123',
    bloodGroup: 'O-',
    city: 'Gurgaon',
    latitude: 28.4595,
    longitude: 77.0266,
    donationCount: 5,
    reliabilityScore: 75,
    role: 'donor',
    lastDonationDate: new Date('2024-12-01'), // Eligible
  },
  {
    name: 'Vikram Reddy',
    email: 'vikram@example.com',
    password: 'password123',
    bloodGroup: 'AB+',
    city: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    donationCount: 10,
    reliabilityScore: 90,
    role: 'donor',
    lastDonationDate: new Date('2025-02-01'), // Not eligible
  },
  {
    name: 'Anjali Mehta',
    email: 'anjali@example.com',
    password: 'password123',
    bloodGroup: 'A-',
    city: 'Noida',
    latitude: 28.5706,
    longitude: 77.3272,
    donationCount: 7,
    reliabilityScore: 80,
    role: 'donor',
    lastDonationDate: new Date('2024-10-25'), // Eligible
  },
  {
    name: 'Karan Verma',
    email: 'karan@example.com',
    password: 'password123',
    bloodGroup: 'O+',
    city: 'Delhi',
    latitude: 28.6517,
    longitude: 77.2219,
    donationCount: 20,
    reliabilityScore: 98,
    role: 'donor',
    lastDonationDate: new Date('2024-11-01'), // Eligible
  },
  {
    name: 'Neha Gupta',
    email: 'neha@example.com',
    password: 'password123',
    bloodGroup: 'B-',
    city: 'Ghaziabad',
    latitude: 28.6328,
    longitude: 77.4194,
    donationCount: 3,
    reliabilityScore: 70,
    role: 'donor',
    lastDonationDate: null, // Never donated, eligible
  },
  {
    name: 'Rohan Das',
    email: 'rohan@example.com',
    password: 'password123',
    bloodGroup: 'AB-',
    city: 'Gurgaon',
    latitude: 28.4089,
    longitude: 77.0322,
    donationCount: 9,
    reliabilityScore: 85,
    role: 'donor',
    lastDonationDate: new Date('2024-12-10'), // Eligible
  },
  {
    name: 'Pooja Singh',
    email: 'pooja@example.com',
    password: 'password123',
    bloodGroup: 'O+',
    city: 'Noida',
    latitude: 28.5355,
    longitude: 77.3910,
    donationCount: 6,
    reliabilityScore: 82,
    role: 'donor',
    lastDonationDate: new Date('2025-01-20'), // Not eligible
  },
  {
    name: 'Arjun Nair',
    email: 'arjun@example.com',
    password: 'password123',
    bloodGroup: 'A+',
    city: 'Delhi',
    latitude: 28.7041,
    longitude: 77.1025,
    donationCount: 11,
    reliabilityScore: 87,
    role: 'donor',
    lastDonationDate: new Date('2024-11-15'), // Eligible
  },
  {
    name: 'Divya Iyer',
    email: 'divya@example.com',
    password: 'password123',
    bloodGroup: 'B+',
    city: 'Gurgaon',
    latitude: 28.4595,
    longitude: 77.0266,
    donationCount: 4,
    reliabilityScore: 78,
    role: 'donor',
    lastDonationDate: new Date('2024-10-30'), // Eligible
  },
  {
    name: 'Sanjay Kumar',
    email: 'sanjay@example.com',
    password: 'password123',
    bloodGroup: 'O-',
    city: 'Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    donationCount: 13,
    reliabilityScore: 93,
    role: 'donor',
    lastDonationDate: new Date('2024-12-05'), // Eligible
  },
  {
    name: 'Meera Joshi',
    email: 'meera@example.com',
    password: 'password123',
    bloodGroup: 'AB+',
    city: 'Noida',
    latitude: 28.5706,
    longitude: 77.3272,
    donationCount: 8,
    reliabilityScore: 86,
    role: 'donor',
    lastDonationDate: new Date('2025-02-10'), // Not eligible
  },
  {
    name: 'Rahul Kapoor',
    email: 'rahul@example.com',
    password: 'password123',
    bloodGroup: 'A-',
    city: 'Ghaziabad',
    latitude: 28.6692,
    longitude: 77.4538,
    donationCount: 14,
    reliabilityScore: 91,
    role: 'donor',
    lastDonationDate: new Date('2024-11-25'), // Eligible
  },
];

const seedDonors = async () => {
  try {
    await connectDB();

    // Clear existing donors (optional)
    await User.deleteMany({ email: { $in: dummyDonors.map((d) => d.email) } });
    console.log('Cleared existing dummy donors');

    // Insert dummy donors
    await User.insertMany(dummyDonors);
    console.log('15 dummy donors inserted successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding donors:', error);
    process.exit(1);
  }
};

seedDonors();
