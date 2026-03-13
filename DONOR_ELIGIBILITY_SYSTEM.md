# Donor Eligibility & Badge System

## Overview

The RedConnect platform now includes an advanced donor eligibility, badge, and reliability system that ensures donors follow the 90-day blood donation rule and helps prioritize the most reliable donors in the matching algorithm.

## Features Implemented

### 1. 90-Day Donation Eligibility Rule

Donors must wait 90 days between blood donations for health and safety reasons.

#### Implementation

**Utility Function**: `backend/utils/donorEligibility.js`

```javascript
isDonorEligible(lastDonationDate)
```

**Returns**:
- `eligible`: Boolean indicating if donor can donate
- `daysUntilEligible`: Days remaining until eligible
- `nextEligibleDate`: Date when donor becomes eligible
- `daysSinceLastDonation`: Days since last donation

**Logic**:
- If no previous donation: Eligible immediately
- If last donation < 90 days ago: Not eligible
- If last donation ≥ 90 days ago: Eligible

#### Integration

The matching algorithm automatically filters out ineligible donors:
- Only eligible donors appear in search results
- Ineligible donors are excluded from blood request matches
- Dashboard shows eligibility status

### 2. Automatic Badge System

Donors earn badges based on their total donation count.

#### Badge Levels

| Badge | Donations Required | Color |
|-------|-------------------|-------|
| Bronze | 0-3 donations | Orange |
| Silver | 4-7 donations | Gray |
| Gold | 8+ donations | Yellow |

#### Implementation

**Utility Function**:
```javascript
calculateBadgeLevel(donationCount)
```

**Virtual Field**: User model includes a virtual `badgeLevel` field that automatically calculates the badge based on `donationCount`.

#### Display Locations

Badges are displayed on:
- Donor Dashboard
- Find Donor page (donor cards)
- Leaderboard
- Blood request matched donors
- Donor profile cards

### 3. Reliability Score System

The reliability score helps prioritize trustworthy donors in the matching algorithm.

#### Calculation Formula

```javascript
reliabilityScore = (donationCount * 10) + (successfulResponses * 5)
```

**Capped at 100**

#### Factors

- **Donation Count**: Each donation adds 10 points
- **Successful Responses**: Each successful response adds 5 points (future enhancement)
- **Default Score**: New donors start at 50

#### Usage

The reliability score is used in the priority matching algorithm:

```javascript
priorityScore = (100 - distance) + (reliabilityScore * 0.5) + (donationCount * 5)
```

Higher reliability scores result in higher priority matches.

### 4. Donation Recording System

#### API Endpoint

**POST** `/api/donations`

Records a successful blood donation and updates donor stats.

**Request Body**:
```json
{
  "requestId": "optional_request_id",
  "recipientName": "Patient Name",
  "hospitalName": "Hospital Name",
  "notes": "Optional notes"
}
```

**Response**:
```json
{
  "message": "Donation recorded successfully",
  "donation": { ... },
  "donor": {
    "donationCount": 13,
    "badgeLevel": "Gold",
    "reliabilityScore": 93,
    "lastDonationDate": "2026-03-13T..."
  }
}
```

#### Automatic Updates

When a donation is recorded:
1. `donationCount` increases by 1
2. `lastDonationDate` updates to current date
3. `reliabilityScore` recalculates
4. `badgeLevel` updates automatically (virtual field)
5. Donation history record created

#### Eligibility Check

The API automatically checks if the donor is eligible before recording:
- If not eligible: Returns error with days until eligible
- If eligible: Records donation and updates stats

### 5. Enhanced Dashboard

The donor dashboard now displays:

#### Profile Section
- Name and blood group
- Current badge level (Bronze/Silver/Gold)
- Campus affiliation (if joined)

#### Donation Stats
- **Total Donations**: Lifetime donation count
- **Lives Saved**: Donations × 3 (estimated)
- **Next Eligible Date**: When donor can donate again
- **Reliability Score**: Current score out of 100

#### Eligibility Status
- **Green Badge**: "Eligible to Donate" - Can donate now
- **Yellow Badge**: "Not Eligible Yet" - Shows days remaining

#### Emergency Requests
- Shows urgent blood requests matching donor's blood group
- Quick response buttons

#### Donation History
- Table showing past donations
- Date, location, and blood group

### 6. Updated Matching Algorithm

The matching algorithm now:

1. **Filters by blood compatibility**
   - Uses blood compatibility matrix
   - O- can donate to all, AB+ can receive from all

2. **Filters by eligibility**
   - Only includes donors who passed the 90-day rule
   - Excludes recently donated donors

3. **Calculates priority score**
   ```
   Priority = (100 - distance) + (reliability * 0.5) + (donations * 5)
   ```

4. **Sorts by priority**
   - Highest priority donors appear first
   - Top 5 matches returned

5. **Includes badge level**
   - Each matched donor includes their badge level
   - Displayed on donor cards

## Database Schema Updates

### User Model

```javascript
{
  // Existing fields...
  donationCount: {
    type: Number,
    default: 0
  },
  reliabilityScore: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  lastDonationDate: {
    type: Date
  },
  // Virtual field
  badgeLevel: String // Calculated: Bronze/Silver/Gold
}
```

### DonationHistory Model

```javascript
{
  donor: ObjectId,
  bloodRequest: ObjectId,
  recipientName: String,
  hospitalName: String,
  donationDate: Date,
  notes: String
}
```

## API Endpoints

### Donation Management

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/donations` | Record donation | Required |
| GET | `/api/donations/eligibility` | Get eligibility status | Required |
| GET | `/api/donations/history` | Get donation history | Required |
| GET | `/api/donations/all` | Get all donations (admin) | Required |

### Example: Get Eligibility

**GET** `/api/donations/eligibility`

**Response**:
```json
{
  "eligible": true,
  "daysUntilEligible": 0,
  "nextEligibleDate": null,
  "daysSinceLastDonation": 120,
  "lastDonationDate": "2024-11-15T...",
  "donationCount": 11,
  "badgeLevel": "Gold",
  "reliabilityScore": 87
}
```

## Seeded Test Data

15 dummy donors with varied eligibility status:

### Eligible Donors (10)
- Rajesh Kumar (O+, 12 donations, Gold) - Last donated Oct 15, 2024
- Amit Singh (B+, 15 donations, Gold) - Last donated Nov 20, 2024
- Sneha Patel (O-, 5 donations, Silver) - Last donated Dec 1, 2024
- Anjali Mehta (A-, 7 donations, Silver) - Last donated Oct 25, 2024
- Karan Verma (O+, 20 donations, Gold) - Last donated Nov 1, 2024
- Neha Gupta (B-, 3 donations, Bronze) - Never donated
- Rohan Das (AB-, 9 donations, Gold) - Last donated Dec 10, 2024
- Arjun Nair (A+, 11 donations, Gold) - Last donated Nov 15, 2024
- Divya Iyer (B+, 4 donations, Silver) - Last donated Oct 30, 2024
- Sanjay Kumar (O-, 13 donations, Gold) - Last donated Dec 5, 2024
- Rahul Kapoor (A-, 14 donations, Gold) - Last donated Nov 25, 2024

### Ineligible Donors (4)
- Priya Sharma (A+, 8 donations, Gold) - Last donated Jan 10, 2025
- Vikram Reddy (AB+, 10 donations, Gold) - Last donated Feb 1, 2025
- Pooja Singh (O+, 6 donations, Silver) - Last donated Jan 20, 2025
- Meera Joshi (AB+, 8 donations, Gold) - Last donated Feb 10, 2025

## Testing the System

### Test Eligibility Check

1. Login as a donor
2. Go to Dashboard
3. Check the eligibility status:
   - Green badge: Can donate
   - Yellow badge: Must wait X days

### Test Donation Recording

```bash
# Using curl or Postman
POST http://localhost:5000/api/donations
Headers: Authorization: Bearer <token>
Body: {
  "recipientName": "Test Patient",
  "hospitalName": "Test Hospital",
  "notes": "Test donation"
}
```

### Test Matching with Eligibility

1. Go to Request Blood page
2. Submit a request for A+ blood in Delhi
3. Verify only eligible donors appear
4. Check that ineligible donors are excluded

### Verify Badge Display

1. Check Dashboard - badge shown next to blood group
2. Check Request Blood results - badges on donor cards
3. Check Leaderboard - badges on donor rankings

## UI Components

### Badge Display

```tsx
<span className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(badgeLevel)}`}>
  {badgeLevel}
</span>
```

### Eligibility Status

**Eligible**:
```tsx
<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
  <div className="text-sm font-semibold text-green-900">
    Eligible to Donate
  </div>
  <div className="text-xs text-green-700 mt-1">
    You can donate blood now
  </div>
</div>
```

**Not Eligible**:
```tsx
<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
  <div className="text-sm font-semibold text-yellow-900">
    Not Eligible Yet
  </div>
  <div className="text-xs text-yellow-700 mt-1">
    You can donate again in {daysUntilEligible} days
  </div>
</div>
```

## Benefits

### For Donors
- Clear visibility of eligibility status
- Gamification through badge system
- Recognition for frequent donations
- Transparent reliability scoring

### For Recipients
- Only see eligible, available donors
- Prioritized matches based on reliability
- Higher quality donor pool
- Better response rates

### For Platform
- Enforces health and safety rules
- Encourages repeat donations
- Builds trust through transparency
- Improves matching efficiency

## Future Enhancements

1. **Response Tracking**: Track donor responses to requests
2. **Success Rate**: Calculate successful donation completion rate
3. **Notification System**: Alert donors when eligible again
4. **Achievements**: Additional badges for milestones
5. **Leaderboard Integration**: Rank by reliability score
6. **Donor Ratings**: Allow recipients to rate donors
7. **Availability Status**: Let donors set availability
8. **Reminder System**: Remind donors when eligible
9. **Health Screening**: Track health check dates
10. **Donation Centers**: Partner with blood banks

## Backward Compatibility

All existing functionality remains intact:
- Login/Signup works as before
- Campus Network unchanged
- Blood Request system enhanced (not broken)
- Priority matching improved (not replaced)
- Dashboard enhanced with new features

## Conclusion

The Donor Eligibility & Badge System adds critical health and safety features while gamifying the donation experience. The 90-day rule ensures donor health, badges encourage repeat donations, and reliability scores improve matching quality.

The system is fully integrated, tested, and ready for production use.
