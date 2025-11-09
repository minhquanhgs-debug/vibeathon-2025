# 📦 Install Python Packages

## Quick Fix for "ModuleNotFoundError"

This error means packages aren't installed in your virtual environment.

---

## ✅ Solution: Install Packages

### Step 1: Activate Virtual Environment

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
```

**You should see `(venv)` in your prompt!**

### Step 2: Install All Packages

```powershell
pip install -r requirements-working.txt
```

**OR install individually:**

```powershell
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic pydantic-settings python-jose passlib python-multipart httpx python-dotenv
```

### Step 3: Verify Installation

```powershell
python -c "import fastapi; print('FastAPI installed!')"
```

If you see "FastAPI installed!", you're good!

---

## 🔧 If That Doesn't Work

### Option 1: Upgrade pip first

```powershell
venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements-working.txt
```

### Option 2: Install without cache

```powershell
venv\Scripts\activate
pip install --no-cache-dir -r requirements-working.txt
```

### Option 3: Install packages one by one

```powershell
venv\Scripts\activate
pip install fastapi
pip install uvicorn
pip install sqlalchemy
pip install psycopg2-binary
pip install pydantic
pip install python-dotenv
# ... continue with other packages
```

---

## ✅ Complete Setup (If Starting Fresh)

```powershell
# 1. Navigate to route_optimizer
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer

# 2. Create virtual environment (if not exists)
python -m venv venv

# 3. Activate it
venv\Scripts\activate

# 4. Upgrade pip
python -m pip install --upgrade pip

# 5. Install all packages
pip install -r requirements-working.txt

# 6. Verify
python -c "import fastapi; print('✅ All packages installed!')"
```

---

## 🎯 Quick Command

**Copy and paste this entire block:**

```powershell
cd C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer
venv\Scripts\activate
python -m pip install --upgrade pip
pip install fastapi uvicorn sqlalchemy psycopg2-binary alembic pydantic pydantic-settings python-jose passlib python-multipart httpx python-dotenv
```

---

## ✅ Success Check

After installation, try:

```powershell
python -c "import fastapi, uvicorn, sqlalchemy; print('✅ All core packages installed!')"
```

If this works, you can start the server:

```powershell
uvicorn route_optimizer:app --reload
```

---

## 🐛 Common Issues

### "pip is not recognized"
- Make sure virtual environment is activated
- Try: `python -m pip install ...` instead

### "Permission denied"
- Make sure you activated the venv
- Close and reopen terminal

### "Package installation fails"
- Try: `pip install --upgrade pip` first
- Then: `pip install --no-cache-dir package-name`

---

## 📝 Remember

**Always activate the virtual environment first:**
```powershell
venv\Scripts\activate
```

**You'll know it's activated when you see `(venv)` at the start of your prompt!**

