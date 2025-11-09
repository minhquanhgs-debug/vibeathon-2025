# 🔍 Debug "Failed to optimize route" Error

## Quick Checks

### 1. Is Route Optimizer Server Running?

**Check Terminal 1 (Route Optimizer):**
```powershell
# Should see:
INFO:     Uvicorn running on http://127.0.0.1:8000
```

**If not running, start it:**
```powershell
cd route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --reload
```

### 2. Test API Directly

**Open browser and go to:**
```
http://localhost:8000/health
```

**Should see:**
```json
{"status":"healthy","service":"route_optimizer"}
```

**If you get "connection refused":**
- Server is not running
- Start it (see step 1)

### 3. Check Browser Console

**Open browser DevTools (F12):**
- Go to **Console** tab
- Look for error messages
- Common errors:
  - `Network Error` → Server not running
  - `CORS error` → CORS configuration issue
  - `404 Not Found` → Wrong API URL

### 4. Check Network Tab

**In DevTools → Network tab:**
- Try optimizing a route
- Look for the request to `/api/route_optimizer`
- Check:
  - **Status Code** (should be 200)
  - **Response** (click to see error details)

---

## Common Issues & Fixes

### Issue 1: "Connection Refused"

**Error:** `Failed to fetch` or `Network Error`

**Fix:**
1. Make sure Route Optimizer server is running
2. Check it's on port 8000
3. Verify URL in RoutePlanner.jsx is correct

### Issue 2: "CORS Error"

**Error:** `CORS policy: No 'Access-Control-Allow-Origin' header`

**Fix:**
- Check `route_optimizer.py` has CORS middleware
- Should include: `http://localhost:3000`

### Issue 3: "404 Not Found"

**Error:** `404` status code

**Fix:**
- Check API URL in RoutePlanner.jsx
- Should be: `http://localhost:8000/api/route_optimizer`
- Not: `http://localhost:5000/api/route_optimizer`

### Issue 4: "Database Error"

**Error:** `OperationalError` or database connection error

**Fix:**
- Check PostgreSQL is running
- Verify `.env` file has correct password
- Test database connection

### Issue 5: "No services found"

**Error:** `No available services found for this insurance plan`

**Fix:**
- Run seed data: `python seed_data.py`
- Check database has providers and services

---

## Step-by-Step Debug

### Step 1: Check Server Status

```powershell
# Test health endpoint
curl http://localhost:8000/health
```

**Expected:** `{"status":"healthy","service":"route_optimizer"}`

### Step 2: Test API with curl

```powershell
curl -X POST "http://localhost:8000/api/route_optimizer" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"insurance_code\":\"AET-GOLD\",\"location_latitude\":37.0842,\"location_longitude\":-94.5133}"
```

**Check the response** - if this works, the issue is in the frontend.

### Step 3: Check Frontend Code

**Verify API URL in `RoutePlanner.jsx`:**
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**Should match your Route Optimizer server URL.**

### Step 4: Check Server Logs

**Look at the Route Optimizer terminal** for error messages:
- Python tracebacks
- Database errors
- Import errors

---

## Quick Fix Checklist

- [ ] Route Optimizer server is running (port 8000)
- [ ] Health endpoint works: http://localhost:8000/health
- [ ] PostgreSQL is running
- [ ] Database is seeded (providers/services exist)
- [ ] `.env` file has correct database password
- [ ] Frontend API URL is `http://localhost:8000`
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console

---

## Test Script

Save this as `test_route_api.py` in `route_optimizer/`:

```python
import requests
import json

url = "http://localhost:8000/api/route_optimizer"
data = {
    "name": "Test Patient",
    "insurance_code": "AET-GOLD",
    "location_latitude": 37.0842,
    "location_longitude": -94.5133
}

try:
    response = requests.post(url, json=data, timeout=10)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except requests.exceptions.ConnectionError:
    print("ERROR: Cannot connect to server. Is it running?")
except Exception as e:
    print(f"ERROR: {e}")
```

Run it:
```powershell
cd route_optimizer
venv\Scripts\activate
pip install requests
python test_route_api.py
```

---

## Most Common Fix

**90% of the time, the issue is:**

1. **Route Optimizer server is not running**
   - Start it: `uvicorn route_optimizer:app --reload`

2. **Wrong API URL in frontend**
   - Check `RoutePlanner.jsx` has: `http://localhost:8000`

3. **Database not seeded**
   - Run: `python seed_data.py`

---

## Get Detailed Error

**Check browser console for full error message:**
1. Open DevTools (F12)
2. Go to Console tab
3. Try to optimize route
4. Copy the full error message
5. Check what it says!

---

## Still Not Working?

Share:
1. **Browser console error** (full message)
2. **Server terminal output** (any errors?)
3. **Network tab** (status code and response)
4. **Is server running?** (http://localhost:8000/health works?)

Then I can help more specifically!

