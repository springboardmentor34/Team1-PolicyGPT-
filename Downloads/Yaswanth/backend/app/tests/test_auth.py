import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.main import app
from app.database import get_db, User

# Setup shared in-memory SQLite database using StaticPool for unit testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create users table
User.__table__.create(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_signup_success():
    payload = {
        "full_name": "Test User",
        "email": "testuser@example.com",
        "phone_number": "1234567890",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "Citizen"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "testuser@example.com"
    assert data["user"]["full_name"] == "Test User"
    assert data["user"]["role"] == "citizen"


def test_signup_password_mismatch():
    payload = {
        "full_name": "Mismatch User",
        "email": "mismatch@example.com",
        "password": "Password123!",
        "confirm_password": "WrongPassword",
        "role": "Citizen"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 400
    assert "do not match" in response.json()["detail"]


def test_signup_duplicate_email():
    payload = {
        "full_name": "Dup User",
        "email": "testuser@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "role": "Citizen"
    }
    response = client.post("/auth/signup", json=payload)
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


def test_login_success():
    payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "role": "Citizen"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "testuser@example.com"


def test_login_invalid_password():
    payload = {
        "email": "testuser@example.com",
        "password": "WrongPassword",
        "role": "Citizen"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 401


def test_login_invalid_role():
    payload = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "role": "Administrator"
    }
    response = client.post("/auth/login", json=payload)
    assert response.status_code == 403
