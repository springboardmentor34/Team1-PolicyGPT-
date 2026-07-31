"""
Database Initialization Script for PolicyGPT
Creates all database tables using SQLAlchemy Base metadata.
"""

import sys
import os

# Append root directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, Base
import app.models  # Register all models with Base.metadata


def init_db():
    """Create all tables defined in SQLAlchemy models."""
    print("Initializing PolicyGPT Database Tables...")
    try:
        Base.metadata.create_all(bind=engine)
        print("All tables created successfully.")
    except Exception as e:
        print(f"Error creating database tables: {e}")
        raise


if __name__ == "__main__":
    init_db()
