# PolicyGPT - Database Development (Milestone 1)

**PolicyGPT: Government Policy & Public Scheme Intelligence Platform**

This repository contains the complete PostgreSQL database implementation, SQLAlchemy ORM models, Alembic migrations, SQL DDL/DML scripts, seed data, and documentation for **Milestone 1**.

---

## 🛠️ Tech Stack
- **Database Engine**: PostgreSQL 14+
- **ORM**: SQLAlchemy 2.0+
- **Database Migrations**: Alembic
- **Settings & Config**: Pydantic Settings & dotenv

---

## 📁 Repository Structure
```
infosys/
├── app/
│   ├── __init__.py
│   ├── config.py           # Database configuration settings
│   ├── database.py         # Engine, SessionLocal, Base, get_db dependency
│   └── models/             # Modular 3NF SQLAlchemy ORM Models
│       ├── __init__.py
│       ├── base.py
│       ├── user.py
│       ├── policy.py
│       ├── scheme.py
│       ├── eligibility.py
│       ├── notification.py
│       ├── feedback.py
│       ├── report.py
│       ├── audit.py
│       └── search.py
├── alembic/                # Migration scripts
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 001_initial_schema.py
├── scripts/
│   ├── schema.sql          # Complete PostgreSQL DDL & DML script
│   ├── seed_data.py        # Python data seeding script
│   └── init_db.py          # Table initialization runner
├── docs/
│   ├── setup_guide.md      # Installation & setup guide
│   ├── database_design.md  # 3NF normalization & data dictionary
│   └── erd.md              # Mermaid Entity Relationship Diagram
├── .env.example
├── .gitignore
├── alembic.ini
└── requirements.txt
```

---

## 🚀 Quickstart Guide for Backend Team

### 1. Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment
```bash
cp .env.example .env
```
*Update `.env` with your local PostgreSQL credentials.*

### 3. Run Alembic Migrations
```bash
alembic upgrade head
```

### 4. Seed Database
```bash
python scripts/seed_data.py
```

For complete PostgreSQL setup, user privileges, and database configuration, see [`docs/setup_guide.md`](file:///Users/kyashwanth/Documents/infosys/docs/setup_guide.md).
For entity schemas, 3NF design details, and the ER diagram, see [`docs/database_design.md`](file:///Users/kyashwanth/Documents/infosys/docs/database_design.md) and [`docs/erd.md`](file:///Users/kyashwanth/Documents/infosys/docs/erd.md).