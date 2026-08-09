# PolicyGPT Backend (`backend/`)

This directory contains the **FastAPI** backend service for **PolicyGPT: Government Policy & Public Scheme Intelligence Platform**.

---

## Features
- **JWT & OAuth2 Authentication**: Role-Based Access Control (RBAC) supporting Administrators, Government Officials, Citizens, Researchers, Organizations, and Guest Users.
- **Policy Management Engine**: Comprehensive policy lifecycle (Draft, Pending Approval, Published, Archived).
- **Public Scheme Engine & Eligibility Evaluator**: Dynamic demographic matching rule algorithm.
- **Search Engine**: Faceted search across policies and schemes by keyword, ministry, state, sector, and category.
- **Reports & Export Engine**: On-the-fly PDF generation (`reportlab`) and Excel export (`openpyxl`).
- **Database Connection**: Native PostgreSQL connector (`psycopg2-binary`) with automatic SQLite fallback.

---

## How to Run Backend

### Step 1: Create and Activate Virtual Environment
```bash
cd /Users/kyashwanth/Documents/1/backend
python3 -m venv venv
source venv/bin/activate
```

### Step 2: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Step 4: Launch FastAPI Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Upon launching, the console output will display:
```
==================================================================
DATABASE CONNECTION SUCCESSFUL: Connected to PolicyGPT database
==================================================================
```

### Step 5: Interactive Swagger API Documentation
Open your web browser and navigate to:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc UI**: `http://localhost:8000/redoc`
- **Health Endpoint**: `http://localhost:8000/api/health`
