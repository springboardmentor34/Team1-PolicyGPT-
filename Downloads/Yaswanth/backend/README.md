# PolicyGPT FastAPI Backend

The RESTful API service for **PolicyGPT** built with **FastAPI**, **SQLAlchemy**, **PostgreSQL**, **Alembic**, and **JWT Authentication**.

## Features

- **Authentication System**:
  - User registration (`POST /auth/signup`) supporting roles: `citizen`, `policy_officer`, `admin`.
  - User login (`POST /auth/login`) with password verification and JWT token generation.
- **Role-Based Authorization**:
  - Secure endpoints using JWT Bearer tokens and role-based dependency checks.
- **Database Integration**:
  - Shares and reuses existing PostgreSQL SQLAlchemy models from the `database/` module.
- **CORS Enabled**:
  - Fully configured for Angular UI (`http://localhost:4200`).
- **Interactive Documentation**:
  - Swagger UI at `/docs` and ReDoc at `/redoc`.

---

## Setup & Startup Instructions

### 1. Prerequisites
- Python 3.10+
- PostgreSQL server running with database created via `database/` scripts.

### 2. Environment Setup & Running Server

```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (macOS/Linux)
source venv/bin/activate

# On Windows PowerShell:
# .\venv\Scripts\Activate.ps1

# Install required dependencies
pip install -r requirements.txt

# Start FastAPI development server
uvicorn app.main:app --reload
```

The API will be available at: `http://localhost:8000`
Swagger UI documentation: `http://localhost:8000/docs`

---

## API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/auth/signup` | Register a new user | No |
| `POST` | `/auth/login` | Authenticate user & get JWT token | No |
| `GET`  | `/users/me` | Get profile of logged-in user | Yes |
| `GET`  | `/users/` | List all users | Yes (Admin) |
| `GET`  | `/policies/` | List all government policies | No / Yes |
| `POST` | `/policies/` | Create a new policy | Yes (Officer/Admin) |
| `GET`  | `/schemes/` | List public schemes | No / Yes |
| `POST` | `/schemes/` | Create a public scheme | Yes (Officer/Admin) |
