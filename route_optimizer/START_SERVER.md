# 🚀 How to Start Route Optimizer Server

## Quick Fix for "uvicorn not recognized" Error

This error means the virtual environment is not activated or uvicorn is not installed.

---

## ✅ Solution: Step-by-Step

### Step 1: Navigate to route_optimizer directory

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
```

### Step 2: Activate Virtual Environment

```powershell
venv\Scripts\activate
```

**You should see `(venv)` at the start of your prompt:**
```
(venv) PS C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer>
```

### Step 3: Install uvicorn (if not installed)

```powershell
pip install uvicorn
```

### Step 4: Install all requirements

```powershell
pip install -r requirements-working.txt
```

### Step 5: Start the server

```powershell
uvicorn route_optimizer:app --reload
```

---

## 🔍 Troubleshooting

### Issue: "venv\Scripts\activate" not found

**Solution:** Create virtual environment first:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
python -m venv venv
venv\Scripts\activate
pip install -r requirements-working.txt
```

### Issue: "python" not recognized

**Solution:** 
- Make sure Python is installed
- Try `python3` instead of `python`
- Or use full path: `C:\Python314\python.exe -m venv venv`

### Issue: Still says "uvicorn not recognized" after activating venv

**Solution:**
```powershell
# Make sure you're in the right directory
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# Activate venv
venv\Scripts\activate

# Install uvicorn explicitly
pip install uvicorn[standard]

# Try again
uvicorn route_optimizer:app --reload
```

### Issue: "No module named 'route_optimizer'"

**Solution:** Make sure you're in the `route_optimizer` directory:

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
uvicorn route_optimizer:app --reload
```

---

## ✅ Complete Setup (First Time)

If you haven't set up the virtual environment yet:

```powershell
# 1. Navigate to route_optimizer
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
venv\Scripts\activate

# 4. Install all packages
pip install -r requirements-working.txt

# 5. Start server
uvicorn route_optimizer:app --reload
```

---

## 🎯 Quick Command Reference

```powershell
# Always do these in order:
cd route_optimizer          # Go to directory
venv\Scripts\activate        # Activate venv (you'll see (venv) in prompt)
uvicorn route_optimizer:app --reload  # Start server
```

---

## ✅ Success Indicators

When it's working, you'll see:

```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Server is running on:** http://localhost:8000

---

## 🛑 Stop the Server

Press `Ctrl+C` in the terminal where the server is running.

---

## 📝 Remember

**Every time you open a new terminal to start the server:**

1. `cd route_optimizer`
2. `venv\Scripts\activate` ← **This is the key step!**
3. `uvicorn route_optimizer:app --reload`

**The `(venv)` prefix in your prompt means the virtual environment is active!**

