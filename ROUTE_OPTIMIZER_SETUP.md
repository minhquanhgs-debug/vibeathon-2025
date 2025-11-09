# Route Optimizer Setup Guide

Complete setup guide for the AI-Powered Referral Route Optimization System

## Quick Start

### Option 1: Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f route_optimizer

# Stop services
docker-compose down
```

### Option 2: Manual Setup

#### Step 1: Install PostgreSQL

**Windows:**
1. Download from https://www.postgresql.org/download/windows/
2. Install with default settings
3. Remember the postgres user password

**macOS:**
```bash
brew install postgresql
brew services start postgresql
```

**Linux:**
```bash
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

#### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE referharmony_routes;

# Exit
\q
```

#### Step 3: Set Up Python Environment

```bash
cd route_optimizer

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

#### Step 4: Configure Environment

Create `route_optimizer/.env`:

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/referharmony_routes
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
PORT=8000
```

#### Step 5: Initialize Database

```bash
# Initialize tables
python -c "from database import init_db; init_db()"

# Seed with test data
python seed_data.py
```

#### Step 6: Run Server

```bash
uvicorn route_optimizer:app --host 0.0.0.0 --port 8000 --reload
```

## Testing

### Test Route Optimization

1. **Using curl:**
```bash
curl -X POST "http://localhost:8000/api/route_optimizer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "insurance_code": "AET-GOLD",
    "location_latitude": 37.0842,
    "location_longitude": -94.5133,
    "address": "123 Main St, Joplin, MO"
  }'
```

2. **Using the React Frontend:**
   - Navigate to http://localhost:3000/route-planner
   - Fill in patient information
   - Click "Optimize Route"

### Test Provider Dashboard

1. Navigate to http://localhost:3000/provider-dashboard
2. Enter a route ID (from previous optimization)
3. View and update service statuses

## API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## Troubleshooting

### Database Connection Error

**Error:** `could not connect to server`

**Solution:**
1. Check PostgreSQL is running:
   ```bash
   # Windows
   services.msc (look for PostgreSQL)

   # macOS/Linux
   sudo systemctl status postgresql
   ```

2. Verify connection string in `.env`
3. Check firewall settings

### Port Already in Use

**Error:** `Address already in use`

**Solution:**
```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000

# macOS/Linux
lsof -i :8000

# Kill process (replace PID)
# Windows
taskkill /PID <PID> /F

# macOS/Linux
kill -9 <PID>
```

### Module Not Found

**Error:** `ModuleNotFoundError`

**Solution:**
1. Ensure virtual environment is activated
2. Reinstall dependencies:
   ```bash
   pip install -r requirements.txt
   ```

### Database Migration Issues

**Error:** `alembic: command not found`

**Solution:**
```bash
pip install alembic
```

Or use direct initialization:
```bash
python -c "from database import init_db; init_db()"
```

## Seed Data

The seed data includes:

- **5 Providers** in Joplin, MO:
  - Mercy Joplin Clinic (Primary Care)
  - Freeman Health Center (Cardiology)
  - JRAH Medical Center (Radiology)
  - Mercy Specialty Clinic (Dermatology)
  - Freeman Lab Services (Lab Work)

- **5 Services:**
  - Primary Care Consultation
  - Cardiology Follow-up
  - Chest X-Ray
  - Dermatology Consultation
  - Blood Work Panel

- **3 Insurance Programs:**
  - AET-GOLD (Aetna Gold Plan)
  - BCBS-SILVER (Blue Cross Blue Shield Silver)
  - UHC-PLATINUM (UnitedHealthcare Platinum)

## Next Steps

1. **Integrate Real Insurance API:**
   - Replace mock `verify_insurance_eligibility()` function
   - Add real-time eligibility checking

2. **Add Map Integration:**
   - Integrate Leaflet or Google Maps API
   - Show route visualization on map

3. **Enhance Authentication:**
   - Connect with main ReferHarmony auth system
   - Implement role-based access control

4. **Add WebSocket Support:**
   - Real-time route updates
   - Live progress tracking

## Production Deployment

1. **Set strong JWT secret:**
   ```env
   JWT_SECRET=<generate-strong-random-secret>
   ```

2. **Use production database:**
   ```env
   DATABASE_URL=postgresql://user:pass@host:5432/dbname
   ```

3. **Enable HTTPS:**
   - Use reverse proxy (nginx)
   - Configure SSL certificates

4. **Set up monitoring:**
   - Log aggregation
   - Error tracking
   - Performance monitoring

## Support

For issues or questions, refer to:
- Main README.md
- route_optimizer/README.md
- API documentation at /docs endpoint

