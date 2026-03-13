# MongoDB Atlas Setup Guide (Hindi + English)

## MongoDB Atlas se Connect Kaise Kare

### Step 1: Account Banao
1. https://www.mongodb.com/cloud/atlas pe jao
2. Sign up karo (Google account se bhi kar sakte ho)
3. Email verify karo

### Step 2: Free Cluster Banao
1. **"Create"** button pe click karo
2. **Deployment Type**: Shared (FREE)
3. **Cloud Provider**: AWS (ya koi bhi)
4. **Region**: Mumbai (India) ya closest region select karo
5. **Cluster Name**: RedConnect (ya koi bhi naam)
6. **Create Deployment** pe click karo
7. Wait karo 3-5 minutes (cluster ban raha hai)

### Step 3: Database User Banao
1. Left sidebar me **"Database Access"** pe click karo
2. **"Add New Database User"** pe click karo
3. **Authentication Method**: Password
4. **Username**: `redconnect_user` (ya koi bhi)
5. **Password**: Auto-generate karo ya apna password daalo
   - ⚠️ **IMPORTANT**: Password ko save kar lo (notepad me copy karo)
6. **Database User Privileges**: "Read and write to any database"
7. **Add User** pe click karo

### Step 4: Network Access Allow Karo
1. Left sidebar me **"Network Access"** pe click karo
2. **"Add IP Address"** pe click karo
3. **"Allow Access from Anywhere"** pe click karo
   - IP: `0.0.0.0/0` automatically add ho jayega
4. **Confirm** pe click karo

### Step 5: Connection String Copy Karo
1. Left sidebar me **"Database"** pe click karo
2. Apne cluster ke samne **"Connect"** button pe click karo
3. **"Drivers"** option select karo
4. **Driver**: Node.js select karo
5. **Version**: 4.1 or later
6. Connection string copy karo:
   ```
   mongodb+srv://redconnect_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Backend .env File Update Karo

1. `backend/.env` file kholo
2. `MONGO_URI` line ko replace karo:

**BEFORE:**
```env
MONGO_URI=mongodb://localhost:27017/redconnect
```

**AFTER:**
```env
MONGO_URI=mongodb+srv://redconnect_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/redconnect?retryWrites=true&w=majority
```

⚠️ **IMPORTANT Changes:**
- `<password>` ko apne actual password se replace karo
- `cluster0.xxxxx` ko apne actual cluster URL se replace karo
- End me `/redconnect` add karo (database name)

### Example Connection String:

A