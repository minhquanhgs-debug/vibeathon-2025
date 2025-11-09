# 🚀 How to Run ReferHarmony App

Complete guide to run the entire application including the new Route Optimizer feature.

## 📋 What You Need

1. **Node.js** (v16+) - For main backend and frontend
2. **MongoDB** - For main app database (Atlas or local)
3. **PostgreSQL** - For Route Optimizer (optional if not using Route Optimizer)
4. **Python 3.11+** - For Route Optimizer (optional if not using Route Optimizer)

---

## 🎯 Option 1: Run Main App Only (Simplest)

If you just want to run the main ReferHarmony app (without Route Optimizer):

### Step 1: Set Up MongoDB

**Option A: MongoDB Atlas (Free Cloud)**
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Create free account and cluster
3. Get connection string

**Option B: Local MongoDB**
- Download from https://www.mongodb.com/try/download/community
- Install and start MongoDB

### Step 2: Create `.env` File

Create `.env` in root directory (`C:\Users\dhmp1\Desktop\ReferHarmony\.env`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/referharmony
JWT_SECRET=my-super-secret-jwt-key-12345
JWT_EXPIRE=24h
```

### Step 3: Install Dependencies

```powershell
# In project root
cd C:\Users\dhmp1\Desktop\ReferHarmony
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### Step 4: Start Backend (Terminal 1)

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony
npm run dev
```

✅ You should see: "Server running on port 5000"

### Step 5: Start Frontend (Terminal 2)

Open a **NEW PowerShell window**:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\client
npm run dev
```

✅ You should see: "Local: http://localhost:3000/"

### Step 6: Open Browser

Go to: **http://localhost:3000**

🎉 **You're done!** The main app is running.

---

## 🎯 Option 2: Run Full App WITH Route Optimizer

To use the AI Route Planner feature, you need to also run the Route Optimizer service.

### Part A: Main App (Same as Option 1)

Follow Steps 1-6 from Option 1 above.

### Part B: Route Optimizer Setup

#### Step 1: Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the postgres password you set

#### Step 2: Create Database

```powershell
# Open PostgreSQL command line (search "psql" in Windows)
psql -U postgres

# In psql, run:
CREATE DATABASE referharmony_routes;
\q
```

#### Step 3: Set Up Python Environment

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# Create virtual environment
python -m venv venv

# Activate it
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 4: Configure Route Optimizer

Create `route_optimizer/.env`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/referharmony_routes
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
PORT=8000
```

**Replace `YOUR_PASSWORD` with your PostgreSQL password!**

#### Step 5: Initialize Database

```powershell
# Make sure venv is activated
python -c "from database import init_db; init_db()"
python seed_data.py
```

#### Step 6: Start Route Optimizer (Terminal 3)

Open a **NEW PowerShell window**:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --host 0.0.0.0 --port 8000 --reload
```

✅ You should see: "Uvicorn running on http://0.0.0.0:8000"

---

## 📊 Summary: What Runs Where

### Terminal 1: Main Backend (Node.js)
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony
npm run dev
```
**Port:** 5000

### Terminal 2: Frontend (React)
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\client
npm run dev
```
**Port:** 3000

### Terminal 3: Route Optimizer (FastAPI) - Optional
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --reload
```
**Port:** 8000

---

## 🌐 Access Points

Once everything is running:

- **Main App:** http://localhost:3000
- **Route Planner:** http://localhost:3000/route-planner
- **Provider Dashboard:** http://localhost:3000/provider-dashboard
- **Route Optimizer API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

---

## ✅ Quick Test

1. **Open browser:** http://localhost:3000
2. **Register** a new account
3. **Login** with your account
4. **Click "AI Route Planner"** on dashboard
5. **Fill in patient info:**
   - Name: Test Patient
   - Insurance: AET-GOLD
   - Latitude: 37.0842
   - Longitude: -94.5133
6. **Click "Optimize Route"**
7. **See optimized route!** 🎉

---

## 🐛 Troubleshooting

### "Cannot connect to Route Optimizer"
- Make sure Terminal 3 (Route Optimizer) is running
- Check http://localhost:8000/health in browser
- Should see: `{"status":"healthy"}`

### "Database connection error"
- Check PostgreSQL is running (Windows Services)
- Verify password in `route_optimizer/.env`
- Make sure database `referharmony_routes` exists

### "Port already in use"
```powershell
# Find what's using the port
netstat -ano | findstr :8000

# Kill it (replace PID)
taskkill /PID <PID> /F
```

### "Module not found" (Python)
- Make sure virtual environment is activated
- Run: `pip install -r requirements.txt`

---

## 🛑 Stop the App

Press `Ctrl+C` in each terminal window to stop the services.

---

## 📝 Checklist

**For Main App Only:**
- [ ] MongoDB running (Atlas or local)
- [ ] `.env` file created
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running (Terminal 1)
- [ ] Frontend running (Terminal 2)
- [ ] Browser opened to http://localhost:3000

**For Full App with Route Optimizer:**
- [ ] All above items ✅
- [ ] PostgreSQL installed and running
- [ ] Database `referharmony_routes` created
- [ ] Python virtual environment created
- [ ] Route Optimizer dependencies installed
- [ ] `route_optimizer/.env` configured
- [ ] Database initialized and seeded
- [ ] Route Optimizer running (Terminal 3)

---

## 🎉 You're All Set!

The app is now running. Start with the main app, then add Route Optimizer when you're ready to test that feature!

