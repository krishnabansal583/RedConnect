# RedConnect - Quick Start Guide

Get your RedConnect platform running in 5 minutes!

## Prerequisites

- Node.js installed (v18+)
- MongoDB installed and running

## Step 1: Install Dependencies

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

## Step 2: Start MongoDB

### Windows
```bash
net start MongoDB
```

### Mac/Linux
```bash
sudo systemctl start mongod
# or
brew services start mongodb-community
```

### Check if MongoDB is running
```bash
mongosh
# If it connects, MongoDB is running!
```

## Step 3: Start the Application

### Option A: Two Terminals (Recommended)

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```
✅ Backend running on http://localhost:5000

**Terminal 2 - Frontend:**
```bash
npm run dev
```
✅ Frontend running on http://localhost:3000

### Option B: Using concurrently (if installed)
```bash
npm run dev:all
```

## Step 4: Test the Application

1. Open browser: http://localhost:3000
2. Click "Register" or go to http://localhost:3000/register
3. Fill in the registration form:
   - Name: John Doe
   - Email: john@example.com
   - Password: password123
   - Blood Group: O+
   - City: Mumbai
   - Role: Donor
4. Click "Create Account"
5. You'll be redirected to the dashboard!

## Verify Backend is Working

Open http://localhost:5000/api/health

You should see:
```json
{
  "status": "OK",
  "message": "RedConnect API is running"
}
```

## Test API with Sample Data

### Register a User
```bash
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "bloodGroup": "O+",
    "city": "Mumbai",
    "role": "donor"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## Troubleshooting

### MongoDB Not Running
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port Already in Use

**Backend (Port 5000):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:5000 | xargs kill -9
```

**Frontend (Port 3000):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Cannot Connect to MongoDB
1. Check if MongoDB is installed
2. Check if MongoDB service is running
3. Verify MONGO_URI in `backend/.env`:
   ```
   MONGO_URI=mongodb://localhost:27017/redconnect
   ```

### CORS Error
- Make sure backend is running on port 5000
- Check `.env.local` has correct API URL:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

## Environment Files

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Backend (backend/.env)
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/redconnect
JWT_SECRET=redconnect_secret_key_change_in_production_2024
NODE_ENV=development
```

## Available Pages

- **Home**: http://localhost:3000
- **Register**: http://localhost:3000/register
- **Login**: http://localhost:3000/login
- **Dashboard**: http://localhost:3000/dashboard (requires login)
- **Find Donor**: http://localhost:3000/find-donor
- **Request Blood**: http://localhost:3000/request-blood
- **Leaderboard**: http://localhost:3000/leaderboard
- **Campus Network**: http://localhost:3000/campus-network

## API Endpoints

- **Health Check**: GET http://localhost:5000/api/health
- **Signup**: POST http://localhost:5000/api/auth/signup
- **Login**: POST http://localhost:5000/api/auth/login
- **Get Donors**: GET http://localhost:5000/api/donors
- **Get Requests**: GET http://localhost:5000/api/requests
- **Leaderboard**: GET http://localhost:5000/api/leaderboard

## Default Test Credentials

After registering, you can use these credentials to test:

```
Email: test@example.com
Password: password123
```

## Next Steps

1. ✅ Register a new account
2. ✅ Login to your account
3. ✅ Explore the dashboard
4. ✅ Create a blood request
5. ✅ Find donors
6. ✅ Check the leaderboard

## Need Help?

Check these files for detailed information:
- `FULLSTACK_SETUP.md` - Complete setup guide
- `backend/README.md` - Backend documentation
- `BACKEND_INTEGRATION_COMPLETE.md` - Integration details

## Success Checklist

- [ ] MongoDB is running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can register a new user
- [ ] Can login successfully
- [ ] Redirected to dashboard after login

**If all checkboxes are checked, you're ready to go! 🚀**

---

**Haan, ab sab kuch ready hai! Start coding! 💻**
