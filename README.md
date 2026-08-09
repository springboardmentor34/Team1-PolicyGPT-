# PolicyGPT: Government Policy & Public Scheme Intelligence Platform

**PolicyGPT** is a production-quality full-stack digital intelligence platform built with **Angular 17+**, **FastAPI**, and **PostgreSQL 16+**. It enables citizens, government officials, researchers, and organizations to access, search, analyze, evaluate eligibility for, compare, and manage government policies, public welfare schemes, regulations, notifications, and official directives.

---

## 🔒 Role Architecture & User Provisioning Security Model

```
                    ┌──────────────┐
                    │    ADMIN     │
                    │  LOGIN ONLY  │
                    └──────┬───────┘
                           │
                 Creates & Provisions
                           │
          ┌────────────────┼─────────────────┐
          │                │                 │
          ▼                ▼                 ▼
 Government Official   Organization       Researcher
    LOGIN ONLY          LOGIN ONLY         LOGIN ONLY


                    ┌──────────────┐
                    │   CITIZEN    │
                    │ SIGN UP +    │
                    │    LOGIN     │
                    └──────────────┘
```

### Authentication & Provisioning Rules

1. **CITIZEN ROLE ONLY (Public Self-Registration)**:
   - Citizens can publicly register via `/register` (`POST /api/v1/auth/register`).
   - The backend explicitly hardcodes `role = "Citizen"` for public self-registration.
   - Any attempt to self-register as a `Government Official`, `Organization`, `Researcher`, or `Administrator` via the public registration endpoint returns `HTTP 403 Forbidden`.

2. **PRIVILEGED ROLES (Admin-Provisioned & Login Only)**:
   - **Government Official**: Login Only. Account created exclusively by Administrator.
   - **Organization**: Login Only. Account created exclusively by Administrator.
   - **Researcher**: Login Only. Account created exclusively by Administrator.
   - **Administrator**: Login Only. Account created exclusively by Administrator or pre-seeded in PostgreSQL.

3. **ADMIN USER CRUD & GOVERNANCE**:
   - Administrators access a dedicated **User Provisioning & Access Control** section in `/dashboards/admin`.
   - **Provision Account Modal**: Allows Admins to provision non-citizen accounts with role-specific fields (Ministry/Department for Officials, Organization Name/Contact for Enterprises, Institution/Area for Researchers).
   - **User CRUD Capabilities**:
     - **Create**: `POST /api/v1/users/` (Protected by `require_roles(["Administrator"])`)
     - **Read**: `GET /api/v1/users/` with role filtering (`All Roles`, `Administrator`, `Government Official`, `Organization`, `Researcher`, `Citizen`)
     - **Update Role**: `PATCH /api/v1/users/{id}/role`
     - **Toggle Status**: `PATCH /api/v1/users/{id}/status` (Active / Disabled)
     - **Delete**: `DELETE /api/v1/users/{id}` (With confirmation prompt; Admin accounts protected)

---

## 📋 Role Matrix & Default Credentials

| Role | Public Sign Up | Login | Password Security | Default Seed Credentials | Destination Dashboard |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **Administrator** | ❌ (Forbidden) | ✅ | bcrypt Hashed | `admin@policygpt.gov.in` / `Admin@123456` | `/dashboards/admin` |
| **Government Official** | ❌ (Admin Provisioned) | ✅ | bcrypt Hashed | `official@policygpt.gov.in` / `Official@123456` | `/dashboards/official` |
| **Citizen** | ✅ (Public Register) | ✅ | bcrypt Hashed | `citizen@policygpt.gov.in` / `Citizen@123456` | `/dashboards/citizen` |
| **Researcher** | ❌ (Admin Provisioned) | ✅ | bcrypt Hashed | `researcher@policygpt.gov.in` / `Researcher@123456` | `/dashboards/researcher` |
| **Organization** | ❌ (Admin Provisioned) | ✅ | bcrypt Hashed | `org@policygpt.gov.in` / `Org@123456` | `/dashboards/organization` |
| **Guest User** | *Direct Access* | *N/A* | *N/A* | *No login needed* | `/dashboards/public` |

---

## 🚀 Technical Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Angular 17+, RxJS, Bootstrap 5, FontAwesome | SPA UI with Standalone Components & ChangeDetectorRef integration |
| **Backend** | FastAPI, Uvicorn, SQLAlchemy, Pydantic v2 | High-performance RESTful microservices with PostgreSQL connection pooling |
| **Database** | PostgreSQL 16+ | Relational persistence (`policygpt_db`) with DDL constraints |
| **Security & Auth** | JWT Tokens, OAuth2 Password Bearer, bcrypt | Role-Based Access Control (RBAC) & Protected API routes |
| **Export Services** | `reportlab` (PDF), `openpyxl` (Excel) | Dynamic policy PDF report & scheme Excel data exporter |

---

## 📂 Directory Structure

```
PolicyGPT/
├── database/
│   ├── init.sql              # PostgreSQL DDL schema (9 tables)
│   ├── seed_data.sql         # Seed data for policies, schemes & users
│   └── README.md             # PostgreSQL setup guide
├── backend/
│   ├── app/
│   │   ├── api/v1/           # REST endpoints (auth, users, policies, schemes, search, etc.)
│   │   ├── core/             # Security (bcrypt, JWT), Config, DB session pool
│   │   ├── models/           # SQLAlchemy database tables
│   │   ├── schemas/          # Pydantic v2 schemas
│   │   ├── services/         # Eligibility engine & PDF/Excel report generator
│   │   └── main.py           # FastAPI entrypoint & health endpoints
│   ├── tests/                # Pytest automated API test suite (11 passing tests)
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Backend environment configuration
│   └── README.md             # Backend setup & API docs guide
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/   # Header (Theme Toggle) & Footer Navigation
    │   │   ├── core/         # AuthService, ApiService, ThemeService, AuthGuard, JwtInterceptor
    │   │   └── pages/        # Role Dashboards (Admin, Official, Citizen, Org, Researcher), Auth, Search, Eligibility, Compare
    │   ├── index.html        # HTML layout with Google Fonts
    │   └── styles.css        # Navy & Saffron government design system
    ├── package.json          # Angular dependencies & scripts
    └── README.md             # Frontend setup guide
```

---

## 🛠 Quick Start Guide

### Step 1: Database Setup (PostgreSQL)
Ensure PostgreSQL 16+ is running and initialize the `policygpt_db` database:
```bash
brew services start postgresql@16
psql -d policygpt_db -U policygpt_user -f database/init.sql
psql -d policygpt_db -U policygpt_user -f database/seed_data.sql
```

### Step 2: Backend Setup (FastAPI)
```bash
cd /Users/kyashwanth/Documents/1/backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```
Endpoints:
- **Application Health**: `http://localhost:8000/health`
- **Database Health**: `http://localhost:8000/health/database`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

### Step 3: Frontend Setup (Angular)
```bash
cd /Users/kyashwanth/Documents/1/frontend
npm start
```
Open browser at `http://localhost:4200/`.

---

## 🧪 Automated Verification & Test Results

### Backend Pytest Suite
```bash
cd /Users/kyashwanth/Documents/1/backend
PYTHONPATH=. ./venv/bin/pytest tests/test_api.py
```
Output:
```text
=========================== 11 passed, 12 warnings in 2.12s ===========================
```

### Frontend Production Build
```bash
cd /Users/kyashwanth/Documents/1/frontend
npx ng build
```
Output:
```text
Application bundle generation complete. [1.899 seconds] - 0 errors
```

---

## ✅ Final Production Verification Matrix

| Verification Domain | Result | Verification Standard |
| :--- | :---: | :--- |
| **Citizen Public Self-Registration** | **PASS** | `POST /auth/register` creates Citizen accounts only (`Status 201`). |
| **Privileged Self-Register Attempt Blocked** | **PASS** | Non-citizen self-registration attempts return `Status 403 Forbidden`. |
| **Admin User Provisioning** | **PASS** | Admins create Official, Org, and Researcher accounts (`Status 201`). |
| **Provisioned User Authentication** | **PASS** | Provisioned accounts authenticate and receive role JWT tokens (`Status 200`). |
| **Backend RBAC Security** | **PASS** | Non-admin calls to `/api/v1/users/` return `Status 403 Forbidden`. |
| **Initial Dashboard Loading** | **PASS** | Official & Admin dashboards populate directly from DB without button clicks. |
| **Eligibility Checker Category Filtering** | **PASS** | Selecting "Farmer Welfare" returns ONLY `PM-KISAN` scheme. |
| **Scheme Comparison Matrix** | **PASS** | Side-by-side matrix populates automatically on mount. |
| **Database Persistence** | **PASS** | CRUD operations persist across server restarts in PostgreSQL 16. |
