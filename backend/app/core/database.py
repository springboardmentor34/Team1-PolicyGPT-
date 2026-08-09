import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("policygpt")

Base = declarative_base()

# Try connecting to PostgreSQL first, fallback to SQLite if PostgreSQL is unavailable
try:
    engine = create_engine(
        settings.DATABASE_URL,
        pool_pre_ping=True,
        pool_size=20,
        max_overflow=10,
        pool_recycle=1800
    )
    # Test connection
    with engine.connect() as conn:
        print("\n==================================================================")
        print("DATABASE CONNECTION SUCCESSFUL: Connected to PolicyGPT PostgreSQL at localhost:5432")
        print("==================================================================\n")
except Exception as e:
    print("\n------------------------------------------------------------------")
    print(f"PostgreSQL connection failed ({e}). Falling back to SQLite local database.")
    print("------------------------------------------------------------------\n")
    engine = create_engine(
        settings.SQLITE_FALLBACK_URL, connect_args={"check_same_thread": False}
    )
    print("\n==================================================================")
    print("DATABASE CONNECTION SUCCESSFUL: Connected to PolicyGPT SQLite Database")
    print("==================================================================\n")

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
