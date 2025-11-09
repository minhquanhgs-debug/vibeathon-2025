"""
Seed data for Joplin, MO healthcare providers
"""
from sqlalchemy.orm import Session
from models import Provider, Service, InsuranceProgram, Base
from database import engine, SessionLocal
import json

# Joplin, MO coordinates (approximately)
JOPLIN_LAT = 37.0842
JOPLIN_LON = -94.5133

# Providers in Joplin area
PROVIDERS = [
    {
        "name": "Mercy Joplin Clinic",
        "specialty": "Primary Care",
        "latitude": 37.0915,
        "longitude": -94.5142,
        "address": "100 Mercy Way, Joplin, MO 64804",
        "phone": "(417) 556-3000",
        "npi": "1234567890"
    },
    {
        "name": "Freeman Health Center",
        "specialty": "Cardiology",
        "latitude": 37.0789,
        "longitude": -94.5098,
        "address": "1102 W 32nd St, Joplin, MO 64804",
        "phone": "(417) 347-1111",
        "npi": "1234567891"
    },
    {
        "name": "JRAH Medical Center",
        "specialty": "Radiology",
        "latitude": 37.0956,
        "longitude": -94.5201,
        "address": "3126 S Main St, Joplin, MO 64804",
        "phone": "(417) 781-2724",
        "npi": "1234567892"
    },
    {
        "name": "Mercy Specialty Clinic",
        "specialty": "Dermatology",
        "latitude": 37.0887,
        "longitude": -94.5156,
        "address": "1905 W 32nd St, Joplin, MO 64804",
        "phone": "(417) 556-3000",
        "npi": "1234567893"
    },
    {
        "name": "Freeman Lab Services",
        "specialty": "Lab Work",
        "latitude": 37.0801,
        "longitude": -94.5105,
        "address": "1102 W 32nd St, Joplin, MO 64804",
        "phone": "(417) 347-1111",
        "npi": "1234567894"
    }
]

# Services
SERVICES = [
    {
        "name": "Primary Care Consultation",
        "description": "General health checkup and consultation",
        "price": 100.0,
        "duration_minutes": 30,
        "service_code": "99213"
    },
    {
        "name": "Cardiology Follow-up",
        "description": "Cardiologist consultation and follow-up",
        "price": 250.0,
        "duration_minutes": 45,
        "service_code": "99214"
    },
    {
        "name": "Chest X-Ray",
        "description": "Radiology imaging service",
        "price": 150.0,
        "duration_minutes": 20,
        "service_code": "71020"
    },
    {
        "name": "Dermatology Consultation",
        "description": "Skin condition evaluation",
        "price": 180.0,
        "duration_minutes": 30,
        "service_code": "99213"
    },
    {
        "name": "Blood Work Panel",
        "description": "Comprehensive lab panel",
        "price": 120.0,
        "duration_minutes": 15,
        "service_code": "80053"
    }
]

# Insurance Programs
INSURANCE_PROGRAMS = [
    {
        "insurance_code": "AET-GOLD",
        "provider_name": "Aetna",
        "plan_name": "Gold Plan",
        "covered_services": json.dumps(["Primary Care", "Cardiology", "Radiology", "Lab Work"]),
        "coverage_percentage": 80.0
    },
    {
        "insurance_code": "BCBS-SILVER",
        "provider_name": "Blue Cross Blue Shield",
        "plan_name": "Silver Plan",
        "covered_services": json.dumps(["Primary Care", "Cardiology", "Dermatology"]),
        "coverage_percentage": 70.0
    },
    {
        "insurance_code": "UHC-PLATINUM",
        "provider_name": "UnitedHealthcare",
        "plan_name": "Platinum Plan",
        "covered_services": json.dumps(["Primary Care", "Cardiology", "Radiology", "Lab Work", "Physical Therapy"]),
        "coverage_percentage": 90.0
    }
]


def seed_database():
    """Seed the database with initial data"""
    db = SessionLocal()
    
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)
        
        # Seed Providers
        print("Seeding providers...")
        for provider_data in PROVIDERS:
            provider = db.query(Provider).filter(
                Provider.name == provider_data["name"]
            ).first()
            
            if not provider:
                # Map the data correctly
                provider = Provider(
                    name=provider_data["name"],
                    specialty=provider_data["specialty"],
                    location_latitude=provider_data["latitude"],
                    location_longitude=provider_data["longitude"],
                    address=provider_data["address"],
                    phone=provider_data.get("phone"),
                    npi=provider_data.get("npi")
                )
                db.add(provider)
        
        db.commit()
        
        # Seed Services (link to providers by specialty)
        print("Seeding services...")
        providers = db.query(Provider).all()
        
        specialty_mapping = {
            "Primary Care Consultation": "Primary Care",
            "Cardiology Follow-up": "Cardiology",
            "Chest X-Ray": "Radiology",
            "Dermatology Consultation": "Dermatology",
            "Blood Work Panel": "Lab Work"
        }
        
        for service_data in SERVICES:
            service_name = service_data["name"]
            specialty = specialty_mapping.get(service_name)
            
            if specialty:
                provider = next(
                    (p for p in providers if p.specialty == specialty),
                    None
                )
                
                if provider:
                    service = db.query(Service).filter(
                        Service.name == service_name,
                        Service.provider_id == provider.id
                    ).first()
                    
                    if not service:
                        service = Service(
                            **service_data,
                            provider_id=provider.id,
                            insurance_coverage=json.dumps(["AET-GOLD", "BCBS-SILVER", "UHC-PLATINUM"])
                        )
                        db.add(service)
        
        db.commit()
        
        # Seed Insurance Programs
        print("Seeding insurance programs...")
        for insurance_data in INSURANCE_PROGRAMS:
            insurance = db.query(InsuranceProgram).filter(
                InsuranceProgram.insurance_code == insurance_data["insurance_code"]
            ).first()
            
            if not insurance:
                insurance = InsuranceProgram(**insurance_data)
                db.add(insurance)
        
        db.commit()
        
        print("Database seeded successfully!")
        print(f"   - {len(PROVIDERS)} providers")
        print(f"   - {len(SERVICES)} services")
        print(f"   - {len(INSURANCE_PROGRAMS)} insurance programs")
        
    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()


