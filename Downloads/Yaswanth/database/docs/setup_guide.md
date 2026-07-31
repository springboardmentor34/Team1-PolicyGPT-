# PostgreSQL Setup & Integration Guide - PolicyGPT (Milestone 1)

This guide provides step-by-step instructions for installing PostgreSQL, setting up the database and user roles, granting privileges, configuring environment variables, running migrations, seeding data, and verifying the completed installation for **PolicyGPT**.

---

## 1. PostgreSQL Installation Guide

### macOS (Homebrew)
```bash
# Update Homebrew and install PostgreSQL 16
brew update
brew install postgresql@16

# Start PostgreSQL service
brew services start postgresql@16

# Verify installation
psql --version
```

### Ubuntu / Debian Linux
```bash
# Update repository packages
sudo apt update && sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verify status
sudo systemctl status postgresql
```

### Windows
1. Download the PostgreSQL Installer for Windows from [EnterpriseDB PostgreSQL Downloads](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads).
2. Run the `.exe` wizard, select PostgreSQL Server, command line tools, and pgAdmin 4.
3. Set a password for the superuser `postgres` during installation (default port: `5432`).

---

## 2. Database & User Creation

Open a terminal or command prompt and connect to the default PostgreSQL superuser shell (`psql`):

```bash
# On macOS / Linux:
psql postgres
# Or as postgres system user:
sudo -u postgres psql
```

Run the following SQL commands to create the database, dedicated user, and assign privileges:

```sql
-- 1. Create dedicated user with password
CREATE USER policygpt_user WITH PASSWORD 'policygpt_password';

-- 2. Create PolicyGPT database owned by policygpt_user
CREATE DATABASE policygpt_db OWNER policygpt_user;

-- 3. Grant full privileges on database to policygpt_user
GRANT ALL PRIVILEGES ON DATABASE policygpt_db TO policygpt_user;

-- 4. Connect to policygpt_db to set schema privileges and enable UUID extension
\c policygpt_db

-- Grant schema privileges
GRANT ALL ON SCHEMA public TO policygpt_user;

-- Enable UUID Extension (required for UUID primary keys)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verify user privileges
\du
\l
```

---

## 3. Database Connection URL Format

The standard PostgreSQL SQLAlchemy Connection URL format is structured as follows:

```
postgresql://<username>:<password>@<hostname>:<port>/<database_name>
```

### Example PolicyGPT Connection String:
```
postgresql://policygpt_user:policygpt_password@localhost:5432/policygpt_db
```

---

## 4. Environment Configuration (`.env`)

Copy `.env.example` to create your local `.env` file in the project root:

```bash
cp .env.example .env
```

Contents of `.env`:
```ini
POSTGRES_USER=policygpt_user
POSTGRES_PASSWORD=policygpt_password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=policygpt_db

# Full Database Connection String
DATABASE_URL=postgresql://policygpt_user:policygpt_password@localhost:5432/policygpt_db
```

---

## 5. Environment Setup & Dependency Installation

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

# Install requirements
pip install -r requirements.txt
```

---

## 6. Table Creation & Migration Execution

Run the initial migration to create all application tables and migration version tracking:

```bash
alembic upgrade head
```

**Executed Migration Log Output:**
```
INFO  [alembic.runtime.migration] Context impl PostgresqlImpl.
INFO  [alembic.runtime.migration] Will assume transactional DDL.
```

---

## 7. Seeding the Database

Populate sample data across all tables using the seed script:

```bash
python3 scripts/seed_data.py
```

**Executed Seeding Output:**
```
Starting PolicyGPT Database Seeding Process...
Users seeded successfully.
Policies seeded successfully.
Schemes seeded successfully.
Successfully seeded all 9 tables in PolicyGPT database!
```

---

## 8. Completed Verification Record

To verify that all tables and seed records are created successfully, connect using `psql`:

```bash
psql -U policygpt_user -d policygpt_db
```

Run `\dt` inside the psql prompt:

```sql
policygpt_db=> \dt
                  List of relations
 Schema |       Name        | Type  |     Owner      
--------+-------------------+-------+----------------
 public | alembic_version   | table | policygpt_user
 public | audit_logs        | table | policygpt_user
 public | eligibility_rules | table | policygpt_user
 public | feedback          | table | policygpt_user
 public | notifications     | table | policygpt_user
 public | policies          | table | policygpt_user
 public | reports           | table | policygpt_user
 public | schemes           | table | policygpt_user
 public | search_history    | table | policygpt_user
 public | users             | table | policygpt_user
(10 rows)
```

**Verification Results Summary:**
- **PostgreSQL installation & configuration**: Completed successfully.
- **Database & User**: `policygpt_db` and `policygpt_user` created successfully with full schema privileges.
- **Alembic migration**: `alembic upgrade head` executed successfully.
- **Data Seeding**: `python3 scripts/seed_data.py` executed successfully across all domain tables.
- **Live Relations Count**: Exactly **10 tables** created (`alembic_version`, `audit_logs`, `eligibility_rules`, `feedback`, `notifications`, `policies`, `reports`, `schemes`, `search_history`, `users`).
