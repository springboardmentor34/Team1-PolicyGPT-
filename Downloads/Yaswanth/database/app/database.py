import os
from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from app.config import settings

# Determine database URL from settings
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL

# Configure engine arguments based on driver
engine_kwargs = {}
if SQLALCHEMY_DATABASE_URL.startswith("sqlite"):
    engine_kwargs["connect_args"] = {"check_same_thread": False}
else:
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_size"] = 10
    engine_kwargs["max_overflow"] = 20

# Create SQLAlchemy Engine
engine = create_engine(SQLALCHEMY_DATABASE_URL, **engine_kwargs)

# Create SessionLocal class for instantiating database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Declarative Base for ORM Models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Database session dependency.
    Yields a Session instance and ensures clean closure after request lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
