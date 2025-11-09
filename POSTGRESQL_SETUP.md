# 🐘 PostgreSQL Setup Guide for Windows

## Quick Connection Guide

### When psql asks for server:

**Just press ENTER** (uses default: localhost)

Or type: `localhost` then press ENTER

---

## Step-by-Step: First Time Setup

### Step 1: Connect to PostgreSQL

When you see:
```
server [localhost]:
```

**Just press ENTER** (or type `localhost` and press ENTER)

Then it will ask:
```
Database [postgres]:
```

**Just press ENTER** (uses default database)

Then it will ask:
```
Port [5432]:
```

**Just press ENTER** (uses default port)

Then it will ask:
```
Username [postgres]:
```

**Just press ENTER** (uses default user)

Then it will ask for password:
```
Password for user postgres:
```

**Type the password you set during PostgreSQL installation** (you won't see it as you type - that's normal!)

Press ENTER

---

## ✅ Success!

If successful, you'll see:
```
postgres=#
```

This means you're connected! 🎉

---

## Step 2: Create Database

Now type these commands (one at a time, press ENTER after each):

```sql
CREATE DATABASE referharmony_routes;
```

You should see:
```
CREATE DATABASE
```

Then verify it was created:
```sql
\l
```

You should see `referharmony_routes` in the list.

---

## Step 3: Exit psql

Type:
```sql
\q
```

Press ENTER to exit.

---

## Common Issues

### "Password authentication failed"
- Make sure you're using the correct password
- If you forgot, you may need to reset PostgreSQL password

### "psql: error: connection to server failed"
- PostgreSQL service might not be running
- Check Windows Services for "postgresql" service
- Start it if it's stopped

### "psql: command not found"
- PostgreSQL might not be installed
- Or psql is not in your PATH
- Try using "SQL Shell (psql)" from Start Menu instead

---

## Alternative: Use pgAdmin (GUI Tool)

If command line is confusing, use pgAdmin:

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to server (use your password)
3. Right-click "Databases" → "Create" → "Database"
4. Name: `referharmony_routes`
5. Click "Save"

Done! ✅

---

## Next Steps

After creating the database:

1. Set up Route Optimizer environment
2. Configure `.env` file in `route_optimizer/` folder
3. Run database initialization

See `ROUTE_OPTIMIZER_SETUP.md` for next steps!


