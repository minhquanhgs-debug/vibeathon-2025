# Quick Start - Route Optimizer

## 🚀 Fastest Way to Get Started

### Option 1: Docker (Easiest)

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f route_optimizer

# Access services:
# - Frontend: http://localhost:3000
# - Route Optimizer API: http://localhost:8000
# - API Docs: http://localhost:8000/docs
```

### Option 2: Manual (Step by Step)

#### 1. Install PostgreSQL
```bash
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql
```

#### 2. Create Database
```bash
psql -U postgres
CREATE DATABASE referharmony_routes;
\q
```

#### 3. Set Up Python Environment
```bash
cd route_optimizer
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### 4. Configure Environment
Create `route_optimizer/.env`:
```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/referharmony_routes
JWT_SECRET=your-secret-key-here
```

#### 5. Initialize & Seed
```bash
python -c "from database import init_db; init_db()"
python seed_data.py    
```

#### 6. Run Server
```bash
uvicorn route_optimizer:app --reload
```

## 🧪 Test It

### 1. Test API Directly
```bash
curl -X POST "http://localhost:8000/api/route_optimizer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "insurance_code": "AET-GOLD",
    "location_latitude": 37.0842,
    "location_longitude": -94.5133
  }'
```

### 2. Test in Browser
1. Go to http://localhost:3000/route-planner
2. Fill in patient information
3. Click "Optimize Route"
4. View optimized route!

### 3. Test Provider Dashboard
1. Go to http://localhost:3000/provider-dashboard
2. Enter route ID from previous step
3. Update service statuses

## 📍 Default Test Data

**Location:** Joplin, MO (37.0842, -94.5133)

**Insurance Codes:**
- `AET-GOLD` - Aetna Gold Plan
- `BCBS-SILVER` - Blue Cross Blue Shield Silver
- `UHC-PLATINUM` - UnitedHealthcare Platinum

**Providers:**
- Mercy Joplin Clinic
- Freeman Health Center
- JRAH Medical Center
- And more...

## 🐛 Troubleshooting

**Database Connection Error?**
- Check PostgreSQL is running
- Verify DATABASE_URL in .env
- Check password is correct

**Port Already in Use?**
- Change port: `uvicorn route_optimizer:app --port 8001`
- Or kill process using port 8000

**Module Not Found?**
- Activate virtual environment
- Run: `pip install -r requirements.txt`

## 📚 Next Steps

- Read `ROUTE_OPTIMIZER_SETUP.md` for detailed setup
- Check `route_optimizer/README.md` for API docs
- See `IMPLEMENTATION_SUMMARY.md` for architecture

---

**Ready to optimize routes!** 🎉


