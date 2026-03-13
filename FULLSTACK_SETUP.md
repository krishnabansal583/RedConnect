# RedConnect Full Stack Setup Guide

Complete guide to set up and run the RedConnect blood donation platform with backend and frontend.

## Tech Stack

### Frontend
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Axios for API calls
- React Context for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT authentication
- bcryptjs for password hashing

## Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation Steps

### 1. Clone and Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2. Set Up MongoDB

**Option A: Local MongoDB**
- Install MongoDB on your system
- Start MongoDB service:
  ```bash
  # Windows
  net start MongoDB
  
  # Mac/Linux
  sudo systemctl start mongod
  ```

**Option B: MongoDB Atlas (Cloud)**
- Create account at https://www.mongodb.com/cloud/atlas
- Create a cluster
- Get connection string
- Update `backend/.env` with your connection string

### 3. Configure Environment Variables

**Backend (.env file already created in backend/)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/redconnect
JWT_SECRET=redconnect_secret_key_change_in_production_2024
NODE_ENV=development
```

**Frontend (.env.local file already created)**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Start the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
```
Backend will run on http://localhost:5000

**Terminal 2 - Start Frontend:**
```bash
npm run dev
```
Frontend will run on http://localhost:3000

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (Protected)

### Donors
- `GET /api/donors` - Get all donors (with filters)
- `GET /api/donors/:id` - Get donor by ID
- `PUT /api/donors/:id` - Update donor profile (Protected)

### Blood Requests
- `POST /api/requests` - Create blood request (Protected)
- `GET /api/requests` - Get all blood requests
- `GET /api/requests/:id` - Get request by ID
- `GET /api/requests/my-requests` - Get user's requests (Protected)
- `PUT /api/requests/:id` - Update request status (Protected)

### Leaderboard
- `GET /api/leaderboard` - Get donor leaderboard

## Features Implemented

### Backend
✅ User authentication with JWT
✅ Password hashing with bcrypt
✅ MongoDB models (User, BloodRequest, DonationHistory)
✅ Protected routes with middleware
✅ Priority matching algorithm
✅ Blood compatibility checking
✅ RESTful API design

### Frontend
✅ Login and Registration pages
✅ Auth context for state management
✅ Protected routes
✅ Token storage in localStorage
✅ Axios interceptors for auth headers
✅ Error handling
✅ Form validation

## Testing the Application

### 1. Register a New User
- Go to http://localhost:3000/register
- Fill in the form
- Click "Create Account"
- You'll be redirected to dashboard

### 2. Login
- Go to http://localhost:3000/login
- Enter email and password
- Click "Login"
- You'll be redirected to dashboard

### 3. Test API with Postman/Thunder Client

**Register:**
```json
POST http://localhost:5000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "bloodGroup": "O+",
  "city": "Mumbai",
  "role": "donor"
}
```

**Login:**
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Get Donors (with priority matching):**
```
GET http://localhost:5000/api/donors?requestedBloodGroup=O+&requestCity=Mumbai
```

## Project Structure

```
redconnect/
├── app/                    # Next.js pages
│   ├── login/
│   ├── register/
│   ├── dashboard/
│   ├── find-donor/
│   └── request-blood/
├── components/             # Reusable components
├── lib/                    # Utilities
│   ├── axios.ts           # Axios instance
│   ├── api.ts             # API functions
│   └── AuthContext.tsx    # Auth state management
├── backend/
│   ├── config/            # Database config
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── utils/             # Helper functions
│   └── server.js          # Express server
└── .env.local             # Frontend environment variables
```

## Priority Matching Algorithm

The system calculates donor priority scores based on:

1. **Blood Compatibility (40%)**: Exact match gets full points
2. **Distance (30%)**: Closer donors get higher scores
3. **Reliability Score (20%)**: Based on past donation history
4. **Donation Count (10%)**: More donations = higher priority

## Badge System

- **Bronze**: 1-3 donations
- **Silver**: 4-7 donations
- **Gold**: 8+ donations

## Security Features

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens with 30-day expiration
- Protected routes require valid token
- CORS enabled for frontend-backend communication

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGO_URI in backend/.env
- For Atlas, whitelist your IP address

### CORS Error
- Backend has CORS enabled
- Check API_URL in frontend .env.local

### Token Not Working
- Clear localStorage
- Login again
- Check token expiration

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

## Next Steps

- Update Find Donor page to use backend API
- Update Request Blood page to use backend API
- Update Dashboard to fetch real data
- Update Leaderboard to use backend API
- Add donation history tracking
- Implement real-time notifications

## Production Deployment

### Backend (Heroku/Railway/Render)
1. Set environment variables
2. Change MONGO_URI to production database
3. Update JWT_SECRET
4. Deploy backend

### Frontend (Vercel/Netlify)
1. Update NEXT_PUBLIC_API_URL to production backend URL
2. Deploy frontend

## Support

For issues or questions, check:
- Backend README: `backend/README.md`
- API documentation in backend controllers
- Frontend components documentation

---

**Congratulations! Your full-stack RedConnect application is ready! 🎉**
