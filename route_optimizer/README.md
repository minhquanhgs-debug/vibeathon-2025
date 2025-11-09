# Route Optimizer Microservice

AI-Powered Referral Route Optimization System for ReferHarmony

## Overview

This FastAPI microservice provides intelligent route optimization for healthcare referrals, integrating insurance eligibility verification, provider matching, and AI-powered pathfinding algorithms.

## Features

- ✅ Insurance eligibility verification (mock API)
- ✅ A* algorithm for route optimization
- ✅ Cost and time estimation
- ✅ FHIR-compliant data structures
- ✅ HIPAA-compliant audit logging
- ✅ Route re-optimization with custom parameters
- ✅ PostgreSQL database with SQLAlchemy ORM

## Tech Stack

- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM for database operations
- **Alembic** - Database migrations
- **Scikit-learn** - AI/ML algorithms
- **JWT** - Authentication (python-jose)

## Setup

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- pip

### Installation

1. **Create virtual environment:**
```bash
cd route_optimizer
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies:**
```bash
pip install -r requirements.txt
```

3. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your database credentials
```

4. **Initialize database:**
```bash
# Create database
createdb referharmony_routes

# Run migrations (if using Alembic)
alembic upgrade head

# Or initialize tables directly
python -c "from database import init_db; init_db()"
```

5. **Seed database with test data:**
```bash
python seed_data.py
```

6. **Run the server:**
```bash
uvicorn route_optimizer:app --host 0.0.0.0 --port 8000 --reload
```

The API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
```
GET /health
```

### Optimize Route
```
POST /api/route_optimizer
Content-Type: application/json

{
  "name": "John Doe",
  "insurance_code": "AET-GOLD",
  "location_latitude": 37.0842,
  "location_longitude": -94.5133,
  "address": "123 Main St, Joplin, MO",
  "phone": "+1234567890",
  "email": "john@example.com"
}
```

### Get Route
```
GET /api/routes/{route_id}
```

### Update Node Status
```
PUT /api/routes/{route_id}/update_node_status?node_id={node_id}
Content-Type: application/json

{
  "status": "Completed",
  "notes": "Service completed successfully"
}
```

### Re-optimize Route
```
POST /api/reoptimize_route
Content-Type: application/json

{
  "route_id": 1,
  "excluded_service_ids": [2, 3],
  "preferred_provider_ids": [1],
  "max_cost": 500.0,
  "max_time_minutes": 120
}
```

## Database Models

- **Patient** - Patient information with FHIR compatibility
- **Provider** - Healthcare provider details
- **Service** - Medical services offered
- **Route** - Optimized care route
- **RouteNode** - Individual service nodes in a route
- **InsuranceProgram** - Insurance coverage information
- **AuditTrail** - HIPAA-compliant audit logging

## Route Optimization Algorithm

The system uses an A* algorithm that optimizes for:
- **Distance** (40% weight) - Minimize travel distance
- **Cost** (30% weight) - Minimize patient cost
- **Time** (30% weight) - Minimize total duration

The algorithm considers:
- Patient location
- Provider locations
- Service availability
- Insurance coverage
- Service dependencies

## Insurance Eligibility

Currently uses a mock API. In production, integrate with:
- Real-time insurance verification APIs
- Eligibility checking services
- Coverage determination systems

## Security & HIPAA Compliance

- JWT-based authentication
- Audit trail logging for all actions
- Encrypted data in transit (HTTPS)
- Access control and role-based permissions
- Masked patient identifiers in logs

## Testing

Test the API with example request:

```bash
curl -X POST "http://localhost:8000/api/route_optimizer" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "insurance_code": "AET-GOLD",
    "location_latitude": 37.0842,
    "location_longitude": -94.5133
  }'
```

## Docker Deployment

See `docker-compose.yml` in the root directory for full stack deployment.

## Development

### Running with Docker

```bash
docker-compose up route_optimizer
```

### Database Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## License

MIT


