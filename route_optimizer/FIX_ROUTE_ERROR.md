# 🔧 Fix "Failed to optimize route" Error

## ✅ Automatic Fixes Applied

I've made several improvements to fix the error:

### 1. **Better Service Matching**
- Improved algorithm to find services even with partial matches
- Added fallback if exact matches aren't found
- Better error messages

### 2. **Database Check**
- Verifies database has providers and services
- Auto-seeds if needed

---

## 🚀 Quick Fix Steps

### Step 1: Make Sure Server is Running

```powershell
# Terminal 1 - Route Optimizer
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Step 2: Verify Database Has Data

```powershell
# In route_optimizer directory
venv\Scripts\activate
python seed_data.py
```

**Should see:**
```
Database seeded successfully!
   - 5 providers
   - 5 services
   - 3 insurance programs
```

### Step 3: Test the API

```powershell
# Install requests if needed
pip install requests

# Run test script
python test_api.py
```

---

## 🧪 Manual Test

### Test 1: Health Check
Open browser: http://localhost:8000/health

**Should return:**
```json
{"status":"healthy","service":"route_optimizer"}
```

### Test 2: Route Optimization
```powershell
curl -X POST "http://localhost:8000/api/route_optimizer" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Patient\",\"insurance_code\":\"AET-GOLD\",\"location_latitude\":37.0842,\"location_longitude\":-94.5133}"
```

---

## ✅ Checklist

Before trying again, make sure:

- [ ] Route Optimizer server is running (port 8000)
- [ ] Health endpoint works: http://localhost:8000/health
- [ ] Database is seeded (run `python seed_data.py`)
- [ ] PostgreSQL is running
- [ ] `.env` file has correct database password
- [ ] Frontend is pointing to `http://localhost:8000`

---

## 🐛 Common Issues

### Issue: "No available services found"

**Fix:**
```powershell
cd route_optimizer
venv\Scripts\activate
python seed_data.py
```

### Issue: "Connection refused"

**Fix:** Start the server:
```powershell
uvicorn route_optimizer:app --reload
```

### Issue: "Database connection error"

**Fix:** Check `.env` file has correct password:
```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/referharmony_routes
```

---

## 🎯 Test Script

I've created `test_api.py` for you. Run it:

```powershell
cd route_optimizer
venv\Scripts\activate
python test_api.py
```

This will test:
1. ✅ Server is running
2. ✅ Health endpoint works
3. ✅ Route optimization works
4. ✅ Shows any errors

---

## 📝 What Was Fixed

1. **Improved service matching** - Better algorithm to find services
2. **Better error messages** - Tells you exactly what's wrong
3. **Fallback logic** - Works even if exact matches aren't found
4. **Auto-seeding check** - Verifies database has data

---

## 🚀 Try Again

After following the steps above:

1. **Start server** (if not running)
2. **Seed database** (if needed)
3. **Test in browser**: http://localhost:3000/route-planner
4. **Fill form and click "Optimize Route"**

It should work now! 🎉

