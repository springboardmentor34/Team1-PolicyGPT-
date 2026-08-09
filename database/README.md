# PolicyGPT Database Module (`database/`)

This directory contains the database initialization scripts and setup guidelines for **PolicyGPT: Government Policy & Public Scheme Intelligence Platform**.

---

## Database Architecture
- **DBMS**: PostgreSQL 14+ (or SQLite fallback mode for immediate zero-config testing)
- **Primary Database Name**: `policygpt_db`
- **User**: `policygpt_user`
- **Default Password**: `policygpt_pass`

---

## Files Overview
1. `init.sql`: Standard DDL SQL script creating all 9 database tables (`users`, `policies`, `schemes`, `eligibility_rules`, `notifications`, `feedback`, `reports`, `audit_logs`, `search_history`).
2. `seed_data.sql`: Pre-populated initial seed data including default administrative accounts, national policies, public schemes, eligibility criteria, notifications, and feedback items.

---

## Step-by-Step PostgreSQL Setup

### Option 1: Using Installed Homebrew PostgreSQL (macOS)

1. **Start PostgreSQL Service**:
   ```bash
   brew services start postgresql@16
   ```

2. **Create Database & User**:
   ```bash
   psql postgres -c "CREATE DATABASE policygpt_db;"
   psql postgres -c "CREATE USER policygpt_user WITH PASSWORD 'policygpt_pass';"
   psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE policygpt_db TO policygpt_user;"
   psql postgres -c "ALTER DATABASE policygpt_db OWNER TO policygpt_user;"
   ```

3. **Execute DDL Schema & Seed Data**:
   ```bash
   psql -d policygpt_db -U policygpt_user -f database/init.sql
   psql -d policygpt_db -U policygpt_user -f database/seed_data.sql
   ```

---

### Option 2: Automatic FastAPI Self-Initialization

The FastAPI backend automatically detects if tables or default users exist. On backend startup, if PostgreSQL is connected, FastAPI will run table creation and seed default users automatically, printing:

```
DATABASE CONNECTION SUCCESSFUL: Connected to PolicyGPT database at localhost:5432
```

---

## Initial Pre-Seeded System Accounts

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@policygpt.gov.in` | `Admin@123456` | Direct Login Only (Full System Management) |
| **Government Official** | `official@policygpt.gov.in` | `Official@123456` | Sign Up & Login (Policy/Scheme Upload & Management) |
| **Citizen** | `citizen@policygpt.gov.in` | `Citizen@123456` | Sign Up & Login (Eligibility Checker, Saved Policies) |
| **Researcher** | `researcher@policygpt.gov.in` | `Researcher@123456` | Sign Up & Login (Analytics & Deep Policy Intelligence) |
| **Organization** | `org@policygpt.gov.in` | `Org@123456` | Sign Up & Login (Grants, Business Schemes & Compliance) |
| **Guest User** | *No login required* | *N/A* | Direct Public Dashboard Access |
