import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from app.config import settings


# Database URL from .env configuration
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL


# Engine configuration
engine_kwargs = {}

if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {
        "check_same_thread": False
    }
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20


# Create database engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    **engine_kwargs
)


# Database session
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)


# Base class for SQLAlchemy models
Base = declarative_base()


# Dependency for API routes
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()