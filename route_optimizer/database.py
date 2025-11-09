"""
Database connection and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

load_dotenv()

# Database URL from environment
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/referharmony_routes"
)

# For SQLite (development/testing)
# DATABASE_URL = "sqlite:///./route_optimizer.db"
# engine = create_engine(
#     DATABASE_URL, 
#     connect_args={"check_same_thread": False},
#     poolclass=StaticPool
# )

# PostgreSQL engine
engine = create_engine(
    DATABASE_URL,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables"""
    from models import Base
    # Create all tables
    Base.metadata.create_all(bind=engine)

