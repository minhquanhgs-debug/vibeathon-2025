# 🔧 Fix Python Installation Error

## Error: "Preparing metadata (pyproject.toml) ... error"

This error usually means a Python package can't be built. Here's how to fix it:

---

## ✅ Solution 1: Update pip and build tools (Recommended)

```powershell
# Make sure you're in the route_optimizer directory
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# Activate virtual environment first
venv\Scripts\activate

# Upgrade pip
python -m pip install --upgrade pip

# Install build tools
python -m pip install --upgrade setuptools wheel

# Now try installing requirements again
pip install -r requirements.txt
```

---

## ✅ Solution 2: Install packages one by one

If Solution 1 doesn't work, install packages individually to see which one fails:

```powershell
# Activate virtual environment
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate

# Install core packages first
pip install fastapi uvicorn sqlalchemy psycopg2-binary pydantic python-dotenv

# Then install others
pip install alembic python-jose passlib python-multipart httpx

# Skip scikit-learn and numpy if they cause issues (they're optional for basic functionality)
pip install scikit-learn numpy
```

---

## ✅ Solution 3: Use pre-built wheels (Windows)

Some packages need to be installed from pre-built wheels:

```powershell
# Activate virtual environment
venv\Scripts\activate

# Install with no build isolation
pip install --no-build-isolation -r requirements.txt
```

---

## ✅ Solution 4: Minimal requirements (if all else fails)

If you're having trouble, try this minimal version first:

Create `route_optimizer/requirements-minimal.txt`:

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
sqlalchemy==2.0.23
psycopg2-binary==2.9.9
pydantic==2.5.0
pydantic-settings==2.1.0
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
httpx==0.25.2
python-dotenv==1.0.0
```

Then install:
```powershell
pip install -r requirements-minimal.txt
```

**Note:** This skips scikit-learn and numpy (used for AI optimization). The basic route optimizer will still work, but advanced AI features may be limited.

---

## ✅ Solution 5: Check Python version

Make sure you have Python 3.11 or higher:

```powershell
python --version
```

If you have an older version, download Python 3.11+ from python.org

---

## ✅ Solution 6: Install Visual C++ Build Tools (Windows)

Some packages need C++ compiler. Install:

1. Download: https://visualstudio.microsoft.com/visual-cpp-build-tools/
2. Install "Desktop development with C++"
3. Restart terminal
4. Try installing again

---

## 🎯 Quick Fix (Try This First)

```powershell
# 1. Go to route_optimizer directory
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# 2. Activate virtual environment
venv\Scripts\activate

# 3. Upgrade everything
python -m pip install --upgrade pip setuptools wheel

# 4. Install requirements
pip install -r requirements.txt --no-cache-dir
```

---

## 🔍 Identify the Problem Package

To see which package is failing:

```powershell
pip install -r requirements.txt -v
```

The `-v` (verbose) flag will show you exactly which package is causing the error.

---

## 💡 Alternative: Skip Route Optimizer for Now

If you just want to run the main app, you can skip the Route Optimizer setup:

1. **Just run the main app** (MongoDB only)
2. **Route Optimizer is optional** - only needed for the AI route planning feature
3. You can set it up later when needed

See `HOW_TO_RUN.md` for running just the main app.

---

## 📝 Common Issues

### Issue: "Microsoft Visual C++ 14.0 is required"
**Fix:** Install Visual C++ Build Tools (Solution 6 above)

### Issue: "Failed building wheel for..."
**Fix:** Try Solution 1 (upgrade pip, setuptools, wheel)

### Issue: "ERROR: Could not find a version that satisfies..."
**Fix:** Check Python version (Solution 5)

### Issue: "Permission denied"
**Fix:** Make sure virtual environment is activated

---

## ✅ Success Check

After successful installation, you should be able to run:

```powershell
python -c "import fastapi; print('FastAPI installed!')"
```

If this works, you're good to go! 🎉

---

## 🆘 Still Having Issues?

1. Share the **full error message** (copy/paste it)
2. Share your **Python version** (`python --version`)
3. Share which **package is failing** (from verbose output)

Then I can provide more specific help!


