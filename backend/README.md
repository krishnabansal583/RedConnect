# RedConnect Backend API

Backend API for the RedConnect blood donation platform built with Node.js, Express, and MongoDB.

## Features

- JWT-based authentication
- User registration and login
- Donor management with priority matching
- Blood request management
- Leaderboard system
- Password hashing with bcrypt
- Protected routes with middleware

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

## Installation

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file with the following variables:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/redconnect
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

4. Make sure MongoDB is running on your system

5. Start the server:
```bash
npm run dev
```

The server will run on http://localhost:5000

## API Endpoints

### Authentication Routes
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Donor Routes
- `GET /api/donors` - Get all donors (with optional filters)
- `GET /api/donors/:id` - Get donor by ID
- `PUT /api/donors/:id` - Update donor profile (Protected)

### Blood Request Routes
- `POST /api/requests` - Create blood request (Protected)
- `GET /api/requests` - Get all blood requests
- `GET /api/requests/:id` - Get request by ID
- `GET /api/requests/my-requests` - Get user's requests (Protected)
- `PUT /api/requests/:id` - Update request status (Protected)

### Leaderboard Routes
- `GET /api/leaderboard` - Get donor leaderboard

## Priority Matching Algorithm

The system calculates donor priority scores based on:
- Blood compatibility (40%)
- Geographic distance (30%)
- Reliability score (20%)
- Donation count (10%)

## Models

### User Model
- name, email, password (hashed)
- bloodGroup, city, role
- donationCount, reliabilityScore
- Virtual field: badgeLevel (Bronze/Silver/Gold)

### BloodRequest Model
- patientName, bloodGroup, hospitalName
- city, urgencyLevel, contactNumber
- status, requestedBy (ref to User)

### DonationHistory Model
- donorId (ref to User)
- hospital, date, bloodGroup
- requestId (ref to BloodRequest)

## Authentication

Protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

Run in production mode:
```bash
npm start
```
