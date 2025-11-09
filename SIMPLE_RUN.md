# Run ReferHarmony - Simple Way (No Docker)

Just like before - simple setup with localhost only!

## 🚀 Quick Steps

### Step 1: Set Up MongoDB (Choose One)

#### Option A: MongoDB Atlas (Free Cloud - Recommended)
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Create free account
3. Create free cluster
4. Create database user (save username & password!)
5. Allow access from anywhere (Network Access → Add IP → Allow from anywhere)
6. Get connection string (Database → Connect → Connect your application)

#### Option B: Local MongoDB
1. Download: https://www.mongodb.com/try/download/community
2. Install MongoDB
3. It should start automatically on Windows

---

### Step 2: Create `.env` File

Create `.env` in the root directory (`C:\Users\dhmp1\Desktop\ReferHarmony\.env`):

**If using MongoDB Atlas:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/referharmony?retryWrites=true&w=majority

# JWT Secret (any long random string)
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRE=24h
```

**If using Local MongoDB:**
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000

# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/referharmony

# JWT Secret (any long random string)
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRE=24h
```

**Important:** Replace `username:password@cluster0.xxxxx.mongodb.net` with your actual MongoDB Atlas credentials!

---

### Step 3: Install Dependencies

```powershell
# Make sure you're in project directory
cd C:\Users\dhmp1\Desktop\ReferHarmony

# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

---

### Step 4: Start Backend

```powershell
# In project root directory
npm run dev
```

**You should see:**
```
✅ MongoDB Connected: localhost (or your Atlas cluster)
📊 Database: referharmony
═══════════════════════════════════════════════
  🏥 ReferHarmony API Server
  🚀 Server running on port 5000
  🌐 API URL: http://localhost:5000
═══════════════════════════════════════════════
```

✅ **Keep this terminal open!**

---

### Step 5: Start Frontend (New Terminal)

Open a **NEW PowerShell window**:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\client
npm run dev
```

**You should see:**
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:3000/
```

✅ **Keep this terminal open too!**

---

### Step 6: Open Browser

Go to: **http://localhost:3000**

You should see the ReferHarmony login page! 🎉

---

## 🧪 Test It

1. Click **"Register"**
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: Password123!
   - Role: Provider
3. Click **"Register"**
4. You should be logged in! ✅

---

## 📋 Summary

**Two terminals needed:**

**Terminal 1 (Backend):**
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony
npm run dev
```

**Terminal 2 (Frontend):**
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\client
npm run dev
```

**Browser:** http://localhost:3000

**That's it!** No Docker needed! 🚀

---

## ❗ Troubleshooting

### MongoDB Connection Error

**If using MongoDB Atlas:**
- Make sure you replaced `<password>` in connection string
- Make sure you allowed access from anywhere in Network Access
- Check connection string is correct

**If using Local MongoDB:**
- Make sure MongoDB is running
- Check Windows Services for "MongoDB"
- Or run `mongod` in a terminal

### Port Already in Use

```powershell
# Find what's using port 5000
netstat -ano | findstr :5000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### Frontend Can't Connect

1. Make sure backend is running (Terminal 1)
2. Test: Open http://localhost:5000/health in browser
3. Should see: `{"success":true,"message":"ReferHarmony API is running"}`

---

## 🛑 Stop the App

Press `Ctrl+C` in both terminals (backend and frontend).

---

## ✅ Success Checklist

- [ ] MongoDB Atlas account created OR Local MongoDB installed
- [ ] `.env` file created with correct `MONGODB_URI`
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`cd client && npm install`)
- [ ] Backend running (`npm run dev`) - Terminal 1
- [ ] Frontend running (`npm run dev`) - Terminal 2
- [ ] Browser opened to http://localhost:3000
- [ ] Can see login/register page

**You're all set!** 🎉

