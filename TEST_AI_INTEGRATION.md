# 🧪 Test AI/OpenAI Integration

Step-by-step guide to verify your OpenAI integration is working!

---

## ✅ Step 1: Verify Setup

### Check your `.env` file in `route_optimizer/`:

```env
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
```

**Make sure:**
- ✅ `LLM_PROVIDER=openai` (not "OpenAI" or "OPENAI")
- ✅ `OPENAI_API_KEY` starts with `sk-`
- ✅ No extra spaces or quotes around the API key

---

## ✅ Step 2: Start Route Optimizer Server

### Terminal 1 - Route Optimizer:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --reload
```

**You should see:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

**If you see "AI service not available":**
- Check that `openai` package is installed: `pip install openai`
- Verify `.env` file is in `route_optimizer/` directory
- Check API key is correct

---

## ✅ Step 3: Test with API (Method 1 - Quick Test)

### Open a NEW terminal (Terminal 2):

```powershell
# Test the health endpoint first
curl http://localhost:8000/health
```

**Should return:**
```json
{"status":"healthy","service":"route_optimizer"}
```

### Now test route optimization with AI:

```powershell
curl -X POST "http://localhost:8000/api/route_optimizer" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Patient\",\"insurance_code\":\"AET-GOLD\",\"location_latitude\":37.0842,\"location_longitude\":-94.5133}"
```

**Look for `ai_recommendations` in the response!**

---

## ✅ Step 4: Test in Browser (Method 2 - Visual Test)

### Step 4a: Start Main App (if not running)

**Terminal 3 - Backend:**
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony
npm run dev
```

**Terminal 4 - Frontend:**
```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\client
npm run dev
```

### Step 4b: Open Browser

1. Go to: **http://localhost:3000**
2. **Login** or **Register** an account
3. Click **"AI Route Planner"** on the dashboard
4. Fill in the form:
   - Name: Test Patient
   - Insurance: AET-GOLD
   - Latitude: 37.0842
   - Longitude: -94.5133
5. Click **"Optimize Route"**

### Step 4c: Check for AI Recommendations

**Look for a section that says:**
- 🤖 **AI Recommendations**
- **Route Explanation** (natural language text)
- 💰 **Cost-Saving Tips** (green box)
- ⏱️ **Time-Saving Tips** (blue box)
- 🏥 **Health Considerations** (yellow box)

**If you see these sections, AI is working! ✅**

---

## ✅ Step 5: Verify in API Response (Method 3 - Detailed Check)

### Use Postman, Insomnia, or Browser DevTools:

**Request:**
```
POST http://localhost:8000/api/route_optimizer
Content-Type: application/json

{
  "name": "John Doe",
  "insurance_code": "AET-GOLD",
  "location_latitude": 37.0842,
  "location_longitude": -94.5133
}
```

**Response should include:**
```json
{
  "patient_id": "P1",
  "route": [...],
  "total_estimated_cost": 330.0,
  "ai_recommendations": {
    "explanation": "This route is optimized because...",
    "cost_tips": ["Tip 1", "Tip 2"],
    "time_tips": ["Tip 1", "Tip 2"],
    "health_considerations": ["Note 1", "Note 2"]
  }
}
```

**If `ai_recommendations` is `null` or missing:**
- AI service is not working
- Check server logs for errors
- Verify API key is valid

---

## 🔍 Troubleshooting

### Issue: "AI service not available" in server logs

**Fix:**
```powershell
# Make sure OpenAI is installed
cd route_optimizer
venv\Scripts\activate
pip install openai

# Verify installation
python -c "import openai; print('OpenAI installed!')"
```

### Issue: "OpenAI error: Invalid API key"

**Fix:**
1. Check your API key in `.env`
2. Make sure it starts with `sk-`
3. Verify key is active at https://platform.openai.com/api-keys
4. Check you have credits in your OpenAI account

### Issue: No `ai_recommendations` in response

**Check:**
1. Server logs for errors
2. `.env` file location (should be in `route_optimizer/` folder)
3. Restart server after changing `.env`
4. Check API key is correct

### Issue: Server crashes when optimizing route

**Check server logs for:**
- Import errors
- API key errors
- Network errors

**Fix:**
```powershell
# Reinstall OpenAI
pip install --upgrade openai

# Check Python version (need 3.8+)
python --version
```

---

## ✅ Success Indicators

### You'll know it's working when:

1. **Server starts without "AI service not available" message**
2. **API response includes `ai_recommendations` field**
3. **Frontend shows AI Recommendations section**
4. **You see natural language explanations**
5. **Tips and recommendations appear**

---

## 🧪 Quick Test Script

Save this as `test_ai.py` in `route_optimizer/`:

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

response = requests.post(url, json=data)
result = response.json()

if result.get("ai_recommendations"):
    print("✅ AI is working!")
    print(f"Explanation: {result['ai_recommendations'].get('explanation', 'N/A')[:100]}...")
else:
    print("❌ AI recommendations not found")
    print("Check server logs and .env file")
```

Run it:
```powershell
cd route_optimizer
venv\Scripts\activate
pip install requests
python test_ai.py
```

---

## 📊 Expected Response Structure

When AI is working, you should see:

```json
{
  "patient_id": "P1",
  "route_id": 1,
  "insurance_code": "AET-GOLD",
  "route": [
    {
      "service_name": "Primary Care Consultation",
      "location": "Mercy Joplin Clinic",
      "price": 80.0,
      "duration": "30 mins",
      "status": "Pending"
    }
  ],
  "total_estimated_cost": 330.0,
  "total_estimated_time": "1 hr 15 mins",
  "ai_recommendations": {
    "explanation": "This route minimizes travel distance...",
    "alternatives": [],
    "cost_tips": [
      "Consider scheduling services on the same day",
      "Check for telemedicine options"
    ],
    "time_tips": [
      "Arrive 15 minutes early",
      "Schedule early morning appointments"
    ],
    "health_considerations": [
      "Bring previous test results",
      "Follow provider instructions"
    ]
  }
}
```

---

## 🎯 Quick Checklist

- [ ] OpenAI package installed (`pip install openai`)
- [ ] `.env` file in `route_optimizer/` directory
- [ ] `LLM_PROVIDER=openai` in `.env`
- [ ] Valid `OPENAI_API_KEY` in `.env`
- [ ] Route Optimizer server running (port 8000)
- [ ] No errors in server logs
- [ ] API response includes `ai_recommendations`
- [ ] Frontend shows AI Recommendations section

---

## 🆘 Still Not Working?

1. **Check server logs** - Look for error messages
2. **Test API key** - Try using it in OpenAI playground
3. **Verify installation** - `python -c "import openai; print(openai.__version__)"`
4. **Check network** - Make sure you can reach OpenAI API
5. **Restart everything** - Stop and restart the server

---

## 🎉 Success!

If you see AI recommendations in the response or frontend, **congratulations!** Your OpenAI integration is working! 🚀

