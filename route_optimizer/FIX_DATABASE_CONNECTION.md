# 🔧 Fix PostgreSQL Connection Error

## Error: "password authentication failed for user postgres"

This means the password in your `.env` file doesn't match your PostgreSQL password.

---

## ✅ Solution 1: Update .env File (Recommended)

### Step 1: Find your PostgreSQL password

**Remember the password you set when installing PostgreSQL?**

If you forgot it, you can:
- Check if you saved it somewhere
- Or reset it (see Solution 2 below)

### Step 2: Update `route_optimizer/.env` file

Open `route_optimizer/.env` and update the `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/referharmony_routes
```

**Replace `YOUR_PASSWORD` with your actual PostgreSQL password!**

**Example:**
```env
DATABASE_URL=postgresql://postgres:mypassword123@localhost:5432/referharmony_routes
```

### Step 3: Restart the server

```powershell
# Stop the server (Ctrl+C)
# Then start again
uvicorn route_optimizer:app --reload
```

---

## ✅ Solution 2: Reset PostgreSQL Password

If you forgot your password, reset it:

### Step 1: Edit PostgreSQL config

1. Find `pg_hba.conf` file (usually in `C:\Program Files\PostgreSQL\15\data\`)
2. Open it as Administrator
3. Find line: `host all all 127.0.0.1/32 md5`
4. Change `md5` to `trust` (temporarily)
5. Save file

### Step 2: Restart PostgreSQL service

```powershell
# In PowerShell as Administrator
Restart-Service postgresql-x64-15
```

### Step 3: Connect and reset password

```powershell
psql -U postgres
```

Then in psql:
```sql
ALTER USER postgres WITH PASSWORD 'newpassword123';
\q
```

### Step 4: Revert pg_hba.conf

Change `trust` back to `md5` and restart PostgreSQL again.

### Step 5: Update .env

```env
DATABASE_URL=postgresql://postgres:newpassword123@localhost:5432/referharmony_routes
```

---

## ✅ Solution 3: Use Default/No Password (Development Only)

**⚠️ Only for local development!**

### Step 1: Edit pg_hba.conf

Change authentication method to `trust` for localhost:

```
host    all             all             127.0.0.1/32            trust
```

### Step 2: Restart PostgreSQL

```powershell
Restart-Service postgresql-x64-15
```

### Step 3: Update .env

```env
DATABASE_URL=postgresql://postgres@localhost:5432/referharmony_routes
```

(No password in the URL)

---

## ✅ Solution 4: Create New Database User

Create a new user with a known password:

```powershell
psql -U postgres
```

Then:
```sql
CREATE USER referharmony_user WITH PASSWORD 'mypassword123';
CREATE DATABASE referharmony_routes OWNER referharmony_user;
GRANT ALL PRIVILEGES ON DATABASE referharmony_routes TO referharmony_user;
\q
```

Update `.env`:
```env
DATABASE_URL=postgresql://referharmony_user:mypassword123@localhost:5432/referharmony_routes
```

---

## 🔍 Quick Check: Test Connection

Test if your connection string works:

```powershell
# Activate venv
cd route_optimizer
venv\Scripts\activate

# Test connection
python -c "from database import engine; engine.connect(); print('✅ Connection successful!')"
```

---

## 📝 .env File Location

Make sure your `.env` file is in:
```
C:\Users\dhmp1\Desktop\ReferHarmony\route_optimizer\.env
```

**Not in the root directory!**

---

## ✅ Complete .env Example

Your `route_optimizer/.env` should look like:

```env
# Database
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/referharmony_routes

# JWT (optional)
JWT_SECRET=your-super-secret-jwt-key-min-32-characters

# LLM (if using AI)
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-key-here
```

---

## 🎯 Quick Fix Steps

1. **Open** `route_optimizer/.env`
2. **Find** `DATABASE_URL=`
3. **Update** password part: `postgresql://postgres:YOUR_PASSWORD@localhost:5432/referharmony_routes`
4. **Save** file
5. **Restart** server

---

## 🐛 Still Not Working?

### Check PostgreSQL is running:

```powershell
Get-Service postgresql*
```

Should show "Running"

### Check if database exists:

```powershell
psql -U postgres -l
```

Look for `referharmony_routes` in the list.

If it doesn't exist, create it:
```sql
CREATE DATABASE referharmony_routes;
```

---

## ✅ Success!

Once the password is correct, the server should start without connection errors!

