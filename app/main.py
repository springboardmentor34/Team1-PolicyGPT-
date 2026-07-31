from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

# Import database and models
from app.database import engine, Base
import app.models

# Import routers
from app.routers import auth


app = FastAPI(
    title="PolicyGPT API",
    description="Government Policy & Public Scheme Intelligence Platform",
    version="1.0.0"
)


# Include API routers
app.include_router(auth.router)


# CORS configuration for Angular frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:4200"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "PolicyGPT Backend is running"
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected"
    }


@app.get("/db-test")
def db_test():
    try:
        with engine.connect() as connection:
            connection.execute(text("SELECT 1"))

        return {
            "database": "connected"
        }

    except Exception as e:
        return {
            "error": str(e)
        }