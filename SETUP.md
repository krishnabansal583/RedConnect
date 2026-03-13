# RedConnect - Setup Instructions

## Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Backend Setup

### 1. Navigate to backend folder
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create .env file
Create a `.env` file in the backend folder with the following:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/redconnect
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**For MongoDB Atlas:**
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/redconnect?retryWrites=true&w=majority
```

### 4. Start MongoDB (if using local)
```bash
mongod
```

### 5. Start backend server
```bash
npm run dev
```

Backend will run on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to project root
```bash
cd ..
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment variables
The `.env.local` file is already created with:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start frontend development server
```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Testing the Application

### 1. Register a new user
- Go to `http://localhost:3000/register`
- Fill in the registration form
- Choose role: Donor or Requester
- Submit the form

### 2. Login
- Go to `http://localhost:3000/login`
- Use your registered credentials
- You'll be redirected to the dashboard

### 3. Test Features
- **Find Donors**: Browse and filter donors by blood group and city
- **Request Blood**: Submit blood requests (requires authentication)
- **Dashboard**: View your profile and donation stats
- **Leaderboard**: See top donors
- **Campus Network**: View participating colleges

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### Donors
- `GET /api/donors` - Get all donors (with filters)
- `GET /api/donors/:id` - Get donor by ID

### Blood Requests
- `POST /api/requests` - Create blood request (protected)
- `GET /api/requests` - Get all requests

### Leaderboard
- `GET /api/leaderboard` - Get top donors

## Project Structure

```
RedConnect/
├── app/                    # Next.js pages
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── find-donor/
│   ├── request-blood/
│   ├── leaderboard/
│   └── campus-network/
├── components/             # Reusable React components
├── lib/                    # Utility functions (API client)
├── backend/
│   ├── config/            # Database configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Express server
└── public/                # Static assets
```

## Troubleshooting

### MongoDB Connection Error
- Make sure MongoDB is running
- Check MONGO_URI in .env file
- For Atlas, ensure IP whitelist is configured

### CORS Error
- Backend CORS is already configured
- Ensure backend is running on port 5000
- Check NEXT_PUBLIC_API_URL in .env.local

### JWT Token Issues
- Clear localStorage in browser
- Re-login to get new token
- Check JWT_SECRET in backend .env

## Production Deployment

### Backend
1. Set NODE_ENV=production
2. Use strong JWT_SECRET
3. Configure MongoDB Atlas
4. Deploy to Heroku/Railway/Render

### Frontend
1. Update NEXT_PUBLIC_API_URL to production API
2. Build: `npm run build`
3. Deploy to Vercel/Netlify

## Features Implemented

✅ User Authentication (JWT)
✅ Password Hashing (bcrypt)
✅ Protected Routes
✅ Donor Search & Filtering
✅ Priority Score Calculation
✅ Blood Request Management
✅ Donor Dashboard
✅ Leaderboard
✅ Campus Network
✅ Responsive Design
✅ Form Validation

## Next Steps

- Add email verification
- Implement real-time notifications
- Add geolocation for distance calculation
- Implement donation history tracking
- Add admin panel
- Integrate payment gateway for donations
