"""
FastAPI Backend Microservice for Route Optimization
AI-powered referral route optimization with insurance eligibility verification
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import json
import math
import httpx
import os
from dotenv import load_dotenv

from database import get_db, init_db
from models import (
    Patient, Provider, Service, Route, RouteNode, 
    AuditTrail, InsuranceProgram, StatusEnum, Base
)

# AI Service for LLM-powered recommendations
try:
    from ai_service import ai_service
    AI_AVAILABLE = True
except ImportError:
    AI_AVAILABLE = False
    print("AI service not available - install openai, anthropic, or ollama for AI features")

load_dotenv()

app = FastAPI(
    title="ReferHarmony Route Optimizer API",
    description="AI-Powered Referral Route Optimization System",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()


# ==================== Pydantic Models ====================

class PatientInput(BaseModel):
    """Patient input for route optimization"""
    name: str
    insurance_code: str = Field(..., description="Insurance code like 'AET-GOLD'")
    location_latitude: float
    location_longitude: float
    address: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ServiceNode(BaseModel):
    """Service node in optimized route"""
    service_name: str
    location: str
    price: float
    duration: str
    covered: bool
    status: str = "Pending"
    order_index: Optional[int] = None
    service_id: Optional[int] = None
    provider_id: Optional[int] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    travel_distance_miles: Optional[float] = None
    travel_cost: Optional[float] = None


class RouteResponse(BaseModel):
    """Optimized route response"""
    patient_id: str
    route_id: Optional[int] = None
    insurance_code: str
    route: List[ServiceNode]
    total_estimated_cost: float
    total_service_cost: Optional[float] = None  # Cost of services only
    total_travel_cost: Optional[float] = None  # Cost of travel based on distance
    total_estimated_time: str
    total_distance_miles: Optional[float] = None
    ai_recommendations: Optional[Dict[str, Any]] = None  # LLM-powered recommendations


class RouteUpdateRequest(BaseModel):
    """Request to update route node status"""
    status: str
    notes: Optional[str] = None


class ReoptimizeRequest(BaseModel):
    """Request to re-optimize route with custom parameters"""
    route_id: int
    excluded_service_ids: Optional[List[int]] = []
    preferred_provider_ids: Optional[List[int]] = []
    max_cost: Optional[float] = None
    max_time_minutes: Optional[int] = None


# ==================== Helper Functions ====================

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate distance between two coordinates in miles using Haversine formula"""
    R = 3959  # Earth radius in miles
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat/2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))
    return R * c


def calculate_travel_cost(distance_miles: float, cost_per_mile: float = 0.50) -> float:
    """
    Calculate travel cost based on distance
    Default: $0.50 per mile (can be configured)
    """
    return round(distance_miles * cost_per_mile, 2)


def geocode_address(address: str) -> Optional[Dict[str, float]]:
    """
    Geocode address to get latitude and longitude
    Uses a simple approach - can be enhanced with Google Geocoding API
    """
    if not address:
        return None
    
    # For now, return None - will be enhanced with actual geocoding
    # In production, use Google Geocoding API or similar service
    try:
        # Try to use a geocoding service
        # This is a placeholder - implement with actual geocoding API
        import requests
        # Example with a free geocoding service (Nominatim)
        try:
            response = requests.get(
                f"https://nominatim.openstreetmap.org/search",
                params={"q": address, "format": "json", "limit": 1},
                headers={"User-Agent": "ReferHarmony/1.0"},
                timeout=5
            )
            if response.status_code == 200:
                data = response.json()
                if data:
                    return {
                        "latitude": float(data[0]["lat"]),
                        "longitude": float(data[0]["lon"])
                    }
        except:
            pass
    except ImportError:
        pass
    
    return None


def verify_insurance_eligibility(insurance_code: str) -> Dict[str, Any]:
    """
    Mock AI API call to verify insurance eligibility
    In production, this would call a real insurance verification API
    """
    # Mock response - in production, make HTTP request to insurance API
    mock_eligibility = {
        "AET-GOLD": {
            "eligible": True,
            "covered_services": ["Primary Care", "Cardiology", "Radiology", "Lab Work"],
            "coverage_percentage": 80.0
        },
        "BCBS-SILVER": {
            "eligible": True,
            "covered_services": ["Primary Care", "Cardiology", "Dermatology"],
            "coverage_percentage": 70.0
        },
        "UHC-PLATINUM": {
            "eligible": True,
            "covered_services": ["Primary Care", "Cardiology", "Radiology", "Lab Work", "Physical Therapy"],
            "coverage_percentage": 90.0
        }
    }
    
    return mock_eligibility.get(insurance_code, {
        "eligible": True,
        "covered_services": ["Primary Care", "Cardiology"],
        "coverage_percentage": 75.0
    })


def optimize_route_astar(
    patient_lat: float,
    patient_lon: float,
    services: List[Service],
    providers: List[Provider]
) -> List[tuple]:
    """
    A* algorithm for route optimization
    Optimizes for: distance, cost, and time
    Returns ordered list of (service_id, provider_id) tuples
    """
    if not services:
        return []
    
    # Create graph nodes (services with their providers)
    nodes = []
    for service in services:
        provider = next((p for p in providers if p.id == service.provider_id), None)
        if provider:
            nodes.append({
                'service_id': service.id,
                'provider_id': provider.id,
                'lat': provider.location_latitude,
                'lon': provider.location_longitude,
                'cost': service.price,
                'time': service.duration_minutes,
                'service': service,
                'provider': provider
            })
    
    if not nodes:
        return []
    
    # Start from patient location
    start_lat, start_lon = patient_lat, patient_lon
    
    # A* algorithm implementation
    visited = set()
    path = []
    current_lat, current_lon = start_lat, start_lon
    
    while len(visited) < len(nodes):
        best_node = None
        best_score = float('inf')
        
        for node in nodes:
            if node['service_id'] in visited:
                continue
            
            # Calculate distance (heuristic)
            distance = haversine_distance(
                current_lat, current_lon,
                node['lat'], node['lon']
            )
            
            # Calculate cost
            cost = node['cost']
            
            # Combined score (weighted: distance 40%, cost 30%, time 30%)
            score = (distance * 0.4) + (cost * 0.0003) + (node['time'] * 0.0003)
            
            if score < best_score:
                best_score = score
                best_node = node
        
        if best_node:
            visited.add(best_node['service_id'])
            path.append((best_node['service_id'], best_node['provider_id']))
            current_lat = best_node['lat']
            current_lon = best_node['lon']
        else:
            break
    
    return path


def log_audit_trail(
    db: Session,
    user_id: str,
    user_role: str,
    action: str,
    entity_type: str,
    entity_id: Optional[int] = None,
    details: Optional[Dict] = None,
    ip_address: Optional[str] = None
):
    """Log action to audit trail for HIPAA compliance"""
    audit = AuditTrail(
        user_id=user_id,
        user_role=user_role,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        details=json.dumps(details) if details else None,
        ip_address=ip_address
    )
    db.add(audit)
    db.commit()


# ==================== API Endpoints ====================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "route_optimizer"}


@app.post("/api/route_optimizer", response_model=RouteResponse)
async def optimize_route(
    patient_input: PatientInput,
    db: Session = Depends(get_db)
):
    """
    Main route optimization endpoint
    Accepts patient input and returns optimized care route
    """
    try:
        # Verify insurance eligibility
        eligibility = verify_insurance_eligibility(patient_input.insurance_code)
        
        if not eligibility.get("eligible", False):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Insurance eligibility verification failed"
            )
        
        # Geocode address if provided to get accurate coordinates
        patient_lat = patient_input.location_latitude
        patient_lon = patient_input.location_longitude
        
        if patient_input.address:
            geocoded = geocode_address(patient_input.address)
            if geocoded:
                patient_lat = geocoded["latitude"]
                patient_lon = geocoded["longitude"]
                # Update patient input with geocoded coordinates
                patient_input.location_latitude = patient_lat
                patient_input.location_longitude = patient_lon
        
        # Get or create patient
        patient = db.query(Patient).filter(
            Patient.insurance_code == patient_input.insurance_code,
            Patient.location_latitude == patient_input.location_latitude,
            Patient.location_longitude == patient_input.location_longitude
        ).first()
        
        if not patient:
            patient = Patient(
                name=patient_input.name,
                insurance_code=patient_input.insurance_code,
                location_latitude=patient_lat,
                location_longitude=patient_lon,
                address=patient_input.address,
                phone=patient_input.phone,
                email=patient_input.email
            )
            db.add(patient)
            db.commit()
            db.refresh(patient)
        
        # Get covered services from insurance
        covered_service_names = eligibility.get("covered_services", [])
        
        # Query available services that match covered services
        # First try exact matches, then partial matches
        services = db.query(Service).join(Provider).filter(
            Service.is_available == True,
            or_(*[Service.name.ilike(f"%{name}%") for name in covered_service_names])
        ).all()
        
        # If no services found, try broader search
        if not services:
            # Try matching by service name keywords
            all_services = db.query(Service).join(Provider).filter(
                Service.is_available == True
            ).all()
            
            # Filter services that might match
            matched_services = []
            for service in all_services:
                service_lower = service.name.lower()
                for covered in covered_service_names:
                    if covered.lower() in service_lower or service_lower in covered.lower():
                        matched_services.append(service)
                        break
            
            services = matched_services if matched_services else all_services[:3]  # Fallback to first 3
        
        if not services:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No available services found. Please seed the database with providers and services."
            )
        
        # Get providers for these services
        provider_ids = [s.provider_id for s in services]
        providers = db.query(Provider).filter(Provider.id.in_(provider_ids)).all()
        
        # Optimize route using A* algorithm (use geocoded coordinates if available)
        optimized_path = optimize_route_astar(
            patient_lat,
            patient_lon,
            services,
            providers
        )
        
        # Get travel cost per mile from environment (default $0.50/mile)
        travel_cost_per_mile = float(os.getenv("TRAVEL_COST_PER_MILE", "0.50"))
        
        # Create route in database
        total_service_cost = 0.0
        total_travel_cost = 0.0
        total_time = 0
        total_distance = 0.0
        
        route = Route(
            patient_id=patient.id,
            total_cost=0.0,
            total_time_minutes=0,
            status="Pending"
        )
        db.add(route)
        db.commit()
        db.refresh(route)
        
        # Create route nodes
        route_nodes = []
        current_lat = patient_lat
        current_lon = patient_lon
        
        for order_idx, (service_id, provider_id) in enumerate(optimized_path):
            service = next(s for s in services if s.id == service_id)
            provider = next(p for p in providers if p.id == provider_id)
            
            # Calculate distance from current location to provider
            distance = haversine_distance(
                current_lat, current_lon,
                provider.location_latitude, provider.location_longitude
            )
            total_distance += distance
            
            # Calculate travel cost for this segment
            segment_travel_cost = calculate_travel_cost(distance, travel_cost_per_mile)
            total_travel_cost += segment_travel_cost
            
            # Calculate service cost (apply insurance coverage)
            coverage_pct = eligibility.get("coverage_percentage", 100.0)
            patient_service_cost = service.price * (1 - coverage_pct / 100.0)
            total_service_cost += patient_service_cost
            
            total_time += service.duration_minutes
            
            route_node = RouteNode(
                route_id=route.id,
                service_id=service.id,
                order_index=order_idx,
                status=StatusEnum.PENDING
            )
            db.add(route_node)
            route_nodes.append(route_node)
            
            current_lat = provider.location_latitude
            current_lon = provider.location_longitude
        
        # Calculate total cost (services + travel)
        total_cost = total_service_cost + total_travel_cost
        
        # Update route totals
        route.total_cost = total_cost
        route.total_time_minutes = total_time
        route.total_distance_miles = total_distance
        db.commit()
        
        # Build response with travel costs
        service_nodes = []
        current_lat_resp = patient_lat
        current_lon_resp = patient_lon
        
        for idx, (service_id, provider_id) in enumerate(optimized_path):
            service = next(s for s in services if s.id == service_id)
            provider = next(p for p in providers if p.id == provider_id)
            
            # Calculate distance from current location to this provider
            node_distance = haversine_distance(
                current_lat_resp, current_lon_resp,
                provider.location_latitude, provider.location_longitude
            )
            
            # Calculate travel cost for this segment
            node_travel_cost = calculate_travel_cost(node_distance, travel_cost_per_mile)
            
            # Calculate service cost
            node_service_cost = round(service.price * (1 - eligibility.get("coverage_percentage", 100.0) / 100.0), 2)
            
            # Update current location for next iteration
            current_lat_resp = provider.location_latitude
            current_lon_resp = provider.location_longitude
            
            service_nodes.append(ServiceNode(
                service_name=service.name,
                location=provider.name,
                price=node_service_cost,
                duration=f"{service.duration_minutes} mins",
                covered=True,
                status="Pending",
                order_index=idx,
                service_id=service.id,
                provider_id=provider.id,
                latitude=provider.location_latitude,
                longitude=provider.location_longitude,
                travel_distance_miles=round(node_distance, 2),
                travel_cost=node_travel_cost
            ))
        
        # Get AI recommendations if available
        ai_recommendations = None
        if AI_AVAILABLE:
            try:
                patient_info = {
                    "name": patient_input.name,
                    "insurance_code": patient_input.insurance_code,
                    "location_latitude": patient_input.location_latitude,
                    "location_longitude": patient_input.location_longitude
                }
                
                available_services_data = [
                    {
                        "name": s.name,
                        "price": s.price,
                        "duration": s.duration_minutes,
                        "provider": next((p.name for p in providers if p.id == s.provider_id), "Unknown")
                    }
                    for s in services
                ]
                
                ai_recommendations = ai_service.generate_route_recommendations(
                    patient_info=patient_info,
                    available_services=available_services_data,
                    insurance_coverage=eligibility,
                    optimized_route=[
                        {
                            "service_name": node.service_name,
                            "location": node.location,
                            "price": node.price,
                            "duration": node.duration,
                            "status": node.status
                        }
                        for node in service_nodes
                    ]
                )
            except Exception as e:
                print(f"AI recommendations error: {e}")
                ai_recommendations = None
        
        # Log audit trail
        log_audit_trail(
            db=db,
            user_id=f"patient_{patient.id}",
            user_role="patient",
            action="route_created",
            entity_type="Route",
            entity_id=route.id,
            details={"insurance_code": patient_input.insurance_code, "ai_used": AI_AVAILABLE}
        )
        
        # Format total time
        hours = total_time // 60
        minutes = total_time % 60
        time_str = f"{hours} hr {minutes} mins" if hours > 0 else f"{minutes} mins"
        
        return RouteResponse(
            patient_id=f"P{patient.id}",
            route_id=route.id,
            insurance_code=patient_input.insurance_code,
            route=service_nodes,
            total_estimated_cost=round(total_cost, 2),
            total_service_cost=round(total_service_cost, 2),
            total_travel_cost=round(total_travel_cost, 2),
            total_estimated_time=time_str,
            total_distance_miles=round(total_distance, 2),
            ai_recommendations=ai_recommendations
        )
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Route optimization failed: {str(e)}"
        )


@app.get("/api/routes/{route_id}", response_model=RouteResponse)
async def get_route(
    route_id: int,
    db: Session = Depends(get_db)
):
    """Get route by ID"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    patient = route.patient
    service_nodes = []
    
    # Get travel cost per mile
    travel_cost_per_mile = float(os.getenv("TRAVEL_COST_PER_MILE", "0.50"))
    
    # Calculate travel costs for each node
    current_lat = patient.location_latitude
    current_lon = patient.location_longitude
    total_service_cost = 0.0
    total_travel_cost = 0.0
    
    for node in sorted(route.route_nodes, key=lambda n: n.order_index):
        service = node.service
        provider = service.provider
        
        # Calculate distance
        distance = haversine_distance(
            current_lat, current_lon,
            provider.location_latitude, provider.location_longitude
        )
        
        # Calculate travel cost
        node_travel_cost = calculate_travel_cost(distance, travel_cost_per_mile)
        total_travel_cost += node_travel_cost
        
        # Calculate service cost (estimate 20% patient cost)
        node_service_cost = service.price * 0.2
        total_service_cost += node_service_cost
        
        service_nodes.append(ServiceNode(
            service_name=service.name,
            location=provider.name,
            price=round(node_service_cost, 2),
            duration=f"{service.duration_minutes} mins",
            covered=True,
            status=node.status.value,
            order_index=node.order_index,
            service_id=service.id,
            provider_id=provider.id,
            latitude=provider.location_latitude,
            longitude=provider.location_longitude,
            travel_distance_miles=round(distance, 2),
            travel_cost=node_travel_cost
        ))
        
        # Update current location
        current_lat = provider.location_latitude
        current_lon = provider.location_longitude
    
    hours = route.total_time_minutes // 60
    minutes = route.total_time_minutes % 60
    time_str = f"{hours} hr {minutes} mins" if hours > 0 else f"{minutes} mins"
    
    return RouteResponse(
        patient_id=f"P{patient.id}",
        route_id=route.id,
        insurance_code=patient.insurance_code,
        route=service_nodes,
        total_estimated_cost=route.total_cost,
        total_service_cost=round(total_service_cost, 2),
        total_travel_cost=round(total_travel_cost, 2),
        total_estimated_time=time_str,
        total_distance_miles=route.total_distance_miles
    )


@app.put("/api/routes/{route_id}/update_node_status")
async def update_node_status(
    route_id: int,
    node_id: int,
    update_request: RouteUpdateRequest,
    db: Session = Depends(get_db)
):
    """Update status of a route node (for provider dashboard)"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    node = db.query(RouteNode).filter(
        RouteNode.id == node_id,
        RouteNode.route_id == route_id
    ).first()
    
    if not node:
        raise HTTPException(status_code=404, detail="Route node not found")
    
    # Update status
    try:
        node.status = StatusEnum(update_request.status)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid status")
    
    if update_request.notes:
        node.notes = update_request.notes
    
    if update_request.status == "Completed":
        node.actual_completion_time = datetime.utcnow()
    
    db.commit()
    db.refresh(node)
    
    # Log audit trail
    log_audit_trail(
        db=db,
        user_id="provider",
        user_role="provider",
        action="node_status_updated",
        entity_type="RouteNode",
        entity_id=node.id,
        details={"status": update_request.status, "route_id": route_id}
    )
    
    return {"success": True, "message": "Node status updated", "node_id": node.id}


@app.post("/api/reoptimize_route", response_model=RouteResponse)
async def reoptimize_route(
    reopt_request: ReoptimizeRequest,
    db: Session = Depends(get_db)
):
    """Re-optimize route with updated parameters"""
    route = db.query(Route).filter(Route.id == reopt_request.route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    patient = route.patient
    
    # Get eligibility
    eligibility = verify_insurance_eligibility(patient.insurance_code)
    covered_service_names = eligibility.get("covered_services", [])
    
    # Query services, excluding specified ones
    service_query = db.query(Service).join(Provider).filter(
        Service.is_available == True,
        ~Service.id.in_(reopt_request.excluded_service_ids),
        or_(*[Service.name.ilike(f"%{name}%") for name in covered_service_names])
    )
    
    if reopt_request.preferred_provider_ids:
        service_query = service_query.filter(Service.provider_id.in_(reopt_request.preferred_provider_ids))
    
    services = service_query.all()
    
    if not services:
        raise HTTPException(status_code=404, detail="No available services found")
    
    provider_ids = [s.provider_id for s in services]
    providers = db.query(Provider).filter(Provider.id.in_(provider_ids)).all()
    
    # Re-optimize
    optimized_path = optimize_route_astar(
        patient.location_latitude,
        patient.location_longitude,
        services,
        providers
    )
    
    # Delete old route nodes
    db.query(RouteNode).filter(RouteNode.route_id == route.id).delete()
    
    # Create new route nodes
    total_cost = 0.0
    total_time = 0
    total_distance = 0.0
    current_lat = patient.location_latitude
    current_lon = patient.location_longitude
    
    for order_idx, (service_id, provider_id) in enumerate(optimized_path):
        service = next(s for s in services if s.id == service_id)
        provider = next(p for p in providers if p.id == provider_id)
        
        distance = haversine_distance(
            current_lat, current_lon,
            provider.location_latitude, provider.location_longitude
        )
        total_distance += distance
        
        coverage_pct = eligibility.get("coverage_percentage", 100.0)
        patient_cost = service.price * (1 - coverage_pct / 100.0)
        total_cost += patient_cost
        total_time += service.duration_minutes
        
        route_node = RouteNode(
            route_id=route.id,
            service_id=service.id,
            order_index=order_idx,
            status=StatusEnum.PENDING
        )
        db.add(route_node)
        
        current_lat = provider.location_latitude
        current_lon = provider.location_longitude
    
    # Calculate total cost
    total_cost = total_service_cost + total_travel_cost
    
    # Update route
    route.total_cost = total_cost
    route.total_time_minutes = total_time
    route.total_distance_miles = total_distance
    db.commit()
    db.refresh(route)
    
    # Build response with travel costs
    service_nodes = []
    current_lat_resp = patient.location_latitude
    current_lon_resp = patient.location_longitude
    
    for idx, (service_id, provider_id) in enumerate(optimized_path):
        service = next(s for s in services if s.id == service_id)
        provider = next(p for p in providers if p.id == provider_id)
        
        # Calculate distance and travel cost
        node_distance = haversine_distance(
            current_lat_resp, current_lon_resp,
            provider.location_latitude, provider.location_longitude
        )
        node_travel_cost = calculate_travel_cost(node_distance, travel_cost_per_mile)
        node_service_cost = round(service.price * (1 - eligibility.get("coverage_percentage", 100.0) / 100.0), 2)
        
        service_nodes.append(ServiceNode(
            service_name=service.name,
            location=provider.name,
            price=node_service_cost,
            duration=f"{service.duration_minutes} mins",
            covered=True,
            status="Pending",
            order_index=idx,
            service_id=service.id,
            provider_id=provider.id,
            latitude=provider.location_latitude,
            longitude=provider.location_longitude,
            travel_distance_miles=round(node_distance, 2),
            travel_cost=node_travel_cost
        ))
        
        # Update current location
        current_lat_resp = provider.location_latitude
        current_lon_resp = provider.location_longitude
    
    hours = total_time // 60
    minutes = total_time % 60
    time_str = f"{hours} hr {minutes} mins" if hours > 0 else f"{minutes} mins"
    
    # Log audit trail
    log_audit_trail(
        db=db,
        user_id=f"patient_{patient.id}",
        user_role="patient",
        action="route_reoptimized",
        entity_type="Route",
        entity_id=route.id
    )
    
    return RouteResponse(
        patient_id=f"P{patient.id}",
        route_id=route.id,
        insurance_code=patient.insurance_code,
        route=service_nodes,
        total_estimated_cost=round(total_cost, 2),
        total_service_cost=round(total_service_cost, 2),
        total_travel_cost=round(total_travel_cost, 2),
        total_estimated_time=time_str,
        total_distance_miles=round(total_distance, 2)
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

