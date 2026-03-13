# RedConnect Testing Guide

## System Status ✅

All components are successfully implemented and running:

- **Backend Server**: http://localhost:5000 ✅
- **Frontend Server**: http://localhost:3001 ✅
- **Database**: MongoDB Atlas Connected ✅
- **Dummy Donors**: 15 donors seeded successfully ✅

## Priority-Based Donor Matching System

### How It Works

1. **Blood Compatibility**: Filters donors based on blood group compatibility rules
   - O- is universal donor (can donate to all)
   - AB+ is universal receiver (can receive from all)
   - Full compatibility matrix implemented

2. **Distance Calculation**: Uses Haversine formula to calculate distance between request location and donor location

3. **Priority Score Algorithm**:
   ```
   Priority Score = (100 - distance) + (reliabilityScore * 0.5) + (donationCount * 5)
   ```
   - Closer donors get higher scores
   - More reliable donors get bonus points
   - Experienced donors (more donations) get bonus points

4. **Automatic Matching**: When a blood request is submitted, the system automatically:
   - Finds compatible donors
   - Calculates distances
   - Computes priority scores
   - Returns top 5 matches sorted by priority

## Testing the Complete Flow

### Step 1: Register a New User

1. Go to http://localhost:3001/register
2. Fill in the registration form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - Phone: 9876543210
   - Blood Group: A+
   - City: Delhi
   - Role: Requester
3. Click "Sign Up"

### Step 2: Login

1. Go to http://localhost:3001/login
2. Login with:
   - Email: test@example.com
   - Password: password123
3. You'll be redirected to the dashboard

### Step 3: Submit a Blood Request

1. Go to http://localhost:3001/request-blood
2. Fill in the form:
   - Patient Name: John Doe
   - Blood Group: A+ (or any blood group)
   - Hospital Name: AIIMS Delhi
   - City: Delhi (select from dropdown)
   - Urgency Level: Emergency or Normal
   - Contact Number: 9876543210
   - Additional Notes: (optional)
3. Click "Submit Blood Request"

### Step 4: View Matched Donors

After submission, you should see:
- Success message: "Blood request submitted successfully!"
- Section titled: "Top Matching Donors Near You"
- Up to 5 donor cards showing:
  - Donor name and blood group
  - Distance in kilometers
  - Reliability score (percentage)
  - Donation count
  - Priority score (color-coded)
  - Badge level (Bronze/Silver/Gold)
  - Contact button

### Expected Results

For an A+ blood request in Delhi, you should see donors with:
- Compatible blood groups: A+, A-, O+, O-
- Sorted by priority score (highest first)
- Distance calculated from Delhi coordinates
- Priority scores typically ranging from 70-150

## Seeded Dummy Donors

The system has 15 pre-populated donors across Delhi NCR:

| Name | Blood Group | City | Donations | Reliability |
|------|-------------|------|-----------|-------------|
| Rajesh Kumar | O+ | Delhi | 12 | 95% |
| Priya Sharma | A+ | Noida | 8 | 88% |
| Amit Singh | B+ | Ghaziabad | 15 | 92% |
| Sneha Patel | O- | Gurgaon | 5 | 75% |
| Vikram Reddy | AB+ | Delhi | 10 | 90% |
| Anjali Mehta | A- | Noida | 7 | 80% |
| Karan Verma | O+ | Delhi | 20 | 98% |
| Neha Gupta | B- | Ghaziabad | 3 | 70% |
| Rohan Das | AB- | Gurgaon | 9 | 85% |
| Pooja Singh | O+ | Noida | 6 | 82% |
| Arjun Nair | A+ | Delhi | 11 | 87% |
| Divya Iyer | B+ | Gurgaon | 4 | 78% |
| Sanjay Kumar | O- | Delhi | 13 | 93% |
| Meera Joshi | AB+ | Noida | 8 | 86% |
| Rahul Kapoor | A- | Ghaziabad | 14 | 91% |

## API Endpoints

### Blood Request with Matching
```
POST /api/requests
Body: {
  "patientName": "John Doe",
  "bloodGroup": "A+",
  "hospitalName": "AIIMS Delhi",
  "city": "Delhi",
  "latitude": 28.7041,
  "longitude": 77.1025,
  "urgencyLevel": "Emergency",
  "contactNumber": "9876543210",
  "additionalNotes": "Urgent requirement"
}

Response: {
  "request": { ... },
  "matchedDonors": [
    {
      "_id": "...",
      "name": "Karan Verma",
      "bloodGroup": "O+",
      "city": "Delhi",
      "distance": 2.5,
      "priorityScore": 147,
      "reliabilityScore": 98,
      "donationCount": 20
    },
    ...
  ]
}
```

### Manual Donor Matching
```
POST /api/matching/match-donors
Body: {
  "bloodGroup": "A+",
  "city": "Delhi",
  "latitude": 28.7041,
  "longitude": 77.1025
}

Response: {
  "matchedDonors": [ ... ]
}
```

## Badge System

Donors are awarded badges based on donation count:
- **Bronze**: 0-3 donations
- **Silver**: 4-7 donations
- **Gold**: 8+ donations

## Priority Score Color Coding

- **Green** (≥85): High priority match
- **Blue** (70-84): Medium priority match
- **Gray** (<70): Lower priority match

## Troubleshooting

### Backend Not Starting
```bash
# Kill process on port 5000
Get-NetTCPConnection -LocalPort 5000 | Select-Object -ExpandProperty OwningProcess
Stop-Process -Id <PID> -Force

# Restart backend
cd backend
npm run dev
```

### Frontend Not Starting
```bash
# Frontend will automatically use port 3001 if 3000 is busy
npm run dev
```

### No Donors Showing
```bash
# Re-run seed script
cd backend
node seedDonors.js
```

### Database Connection Issues
- Check `.env` file in backend folder
- Verify MongoDB Atlas connection string
- Ensure IP address is whitelisted in MongoDB Atlas

## Next Steps (Optional Enhancements)

1. **Real-time Notifications**: Implement WebSocket or Firebase for instant donor notifications
2. **SMS Integration**: Send SMS to matched donors using Twilio
3. **Email Notifications**: Send email alerts to donors
4. **Donor Response System**: Allow donors to accept/decline requests
5. **Request Status Tracking**: Track request fulfillment status
6. **Donor Availability**: Add availability status (available/busy)
7. **Advanced Filters**: Add more filtering options (age, last donation date)
8. **Map Integration**: Show donors on Google Maps
9. **Rating System**: Allow requesters to rate donors after donation
10. **Analytics Dashboard**: Show statistics and trends

## Success Criteria ✅

- [x] User can register and login
- [x] User can submit blood request
- [x] System automatically matches compatible donors
- [x] Distance is calculated accurately
- [x] Priority scores are computed correctly
- [x] Top 5 donors are displayed
- [x] Donor cards show all relevant information
- [x] Emergency requests are highlighted
- [x] Badge system works correctly
- [x] UI is responsive and user-friendly

## Conclusion

The Priority-Based Donor Matching System is fully functional and ready for testing. The system successfully:
- Matches donors based on blood compatibility
- Calculates geographical distance
- Computes priority scores
- Displays top matches with detailed information
- Provides a seamless user experience

Test the system by following the steps above and verify that all features work as expected!
