"""
SQLAlchemy ORM Models for Route Optimization System
FHIR-compliant data structures for healthcare integration
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()


class StatusEnum(str, enum.Enum):
    """Route node status enumeration"""
    PENDING = "Pending"
    SCHEDULED = "Scheduled"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"
    SKIPPED = "Skipped"


class Patient(Base):
    """Patient model with FHIR-compatible fields"""
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    fhir_id = Column(String, unique=True, index=True, nullable=True)  # FHIR Patient ID
    name = Column(String, nullable=False)
    insurance_code = Column(String, nullable=False, index=True)  # e.g., "AET-GOLD"
    location_latitude = Column(Float, nullable=False)
    location_longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    date_of_birth = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    routes = relationship("Route", back_populates="patient", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Patient(id={self.id}, name={self.name}, insurance={self.insurance_code})>"


class Provider(Base):
    """Healthcare provider model"""
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    specialty = Column(String, nullable=False, index=True)  # e.g., "Cardiology", "Primary Care"
    location_latitude = Column(Float, nullable=False)
    location_longitude = Column(Float, nullable=False)
    address = Column(Text, nullable=False)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    npi = Column(String, nullable=True)  # National Provider Identifier
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    services = relationship("Service", back_populates="provider", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Provider(id={self.id}, name={self.name}, specialty={self.specialty})>"


class Service(Base):
    """Medical service model"""
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    price = Column(Float, nullable=False)
    duration_minutes = Column(Integer, nullable=False)  # Duration in minutes
    provider_id = Column(Integer, ForeignKey("providers.id"), nullable=False)
    insurance_coverage = Column(Text, nullable=True)  # JSON string of covered insurance codes
    service_code = Column(String, nullable=True)  # CPT/HCPCS code
    is_available = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    provider = relationship("Provider", back_populates="services")
    route_nodes = relationship("RouteNode", back_populates="service")

    def __repr__(self):
        return f"<Service(id={self.id}, name={self.name}, price={self.price})>"


class Route(Base):
    """Optimized care route for a patient"""
    __tablename__ = "routes"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    total_cost = Column(Float, nullable=False, default=0.0)
    total_time_minutes = Column(Integer, nullable=False, default=0)
    total_distance_miles = Column(Float, nullable=True)
    status = Column(String, default="Pending")
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    patient = relationship("Patient", back_populates="routes")
    route_nodes = relationship("RouteNode", back_populates="route", order_by="RouteNode.order_index", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Route(id={self.id}, patient_id={self.patient_id}, cost={self.total_cost})>"


class RouteNode(Base):
    """Individual service node in a route"""
    __tablename__ = "route_nodes"

    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False)
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    order_index = Column(Integer, nullable=False)  # Order in the route (0, 1, 2, ...)
    status = Column(SQLEnum(StatusEnum), default=StatusEnum.PENDING)
    estimated_arrival_time = Column(DateTime, nullable=True)
    actual_completion_time = Column(DateTime, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    route = relationship("Route", back_populates="route_nodes")
    service = relationship("Service", back_populates="route_nodes")

    def __repr__(self):
        return f"<RouteNode(id={self.id}, route_id={self.route_id}, order={self.order_index}, status={self.status})>"


class AuditTrail(Base):
    """Audit log for HIPAA compliance"""
    __tablename__ = "audit_trails"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)  # User identifier (masked for HIPAA)
    user_role = Column(String, nullable=False)  # patient, provider, admin
    action = Column(String, nullable=False)  # e.g., "route_created", "node_updated"
    entity_type = Column(String, nullable=False)  # e.g., "Route", "RouteNode"
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)  # JSON string with action details
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, server_default=func.now(), index=True)

    def __repr__(self):
        return f"<AuditTrail(id={self.id}, action={self.action}, timestamp={self.timestamp})>"


class InsuranceProgram(Base):
    """Insurance program coverage information"""
    __tablename__ = "insurance_programs"

    id = Column(Integer, primary_key=True, index=True)
    insurance_code = Column(String, nullable=False, unique=True, index=True)  # e.g., "AET-GOLD"
    provider_name = Column(String, nullable=False)  # e.g., "Aetna"
    plan_name = Column(String, nullable=True)  # e.g., "Gold Plan"
    covered_services = Column(Text, nullable=True)  # JSON array of service names/codes
    coverage_percentage = Column(Float, default=100.0)  # Percentage covered
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<InsuranceProgram(code={self.insurance_code}, provider={self.provider_name})>"


