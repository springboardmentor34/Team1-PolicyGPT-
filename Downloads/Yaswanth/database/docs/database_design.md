# Database Design Documentation - PolicyGPT (Milestone 1)

## Executive Summary
This document details the relational database architecture for **PolicyGPT: Government Policy & Public Scheme Intelligence Platform**. The database is designed strictly in **Third Normal Form (3NF)** using PostgreSQL 16+, SQLAlchemy ORM 2.0+, and Alembic migration framework.

---

## 1. Normalization & 3NF Compliance

The PolicyGPT database architecture adheres to 3NF principles to ensure data integrity, eliminate redundancy, and support high performance:

### 1. First Normal Form (1NF)
- Every column contains atomic (indivisible) scalar values (e.g., `full_name`, `email`, `rating`).
- Multi-valued attributes are separated into child tables (e.g., multiple eligibility rules per scheme in `eligibility_rules` table).
- Every record is uniquely identifiable by a UUID primary key.

### 2. Second Normal Form (2NF)
- Tables are in 1NF.
- Every non-key attribute is fully functionally dependent on the primary key, with no composite key partial dependencies.
- Entities are isolated into discrete domain tables (`users`, `policies`, `schemes`, `eligibility_rules`, `notifications`, `feedback`, `reports`, `audit_logs`, `search_history`).

### 3. Third Normal Form (3NF)
- Tables are in 2NF.
- No transitive dependencies exist. Attributes dependent on other non-key attributes have been extracted into independent tables.
  - *Example*: Policy metadata (`sector`, `ministry_or_department`) belongs to `policies`. Schemes reference `policies.id` via foreign key without duplicating policy description or ministry details in the `schemes` table.
  - *Example*: Eligibility rules belong directly to `schemes.id` without duplicating scheme summaries.

---

## 2. Comprehensive Data Dictionary

### 2.1 `users`
Represents citizens, admins, and policy officers interacting with the platform.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary unique identifier |
| `email` | VARCHAR(255) | No | None | UNIQUE, Index | User login email address |
| `hashed_password` | VARCHAR(255) | No | None | None | Bcrypt hashed password |
| `full_name` | VARCHAR(150) | No | None | None | Full legal name (maps to "User Name" on Register page) |
| `phone_number` | VARCHAR(20) | Yes | NULL | Index | Phone number (maps to "Phone Number" on Register page) |
| `role` | VARCHAR(50) | No | `'citizen'` | Index, CHECK (`citizen`, `admin`, `policy_officer`) | System user role (maps to Role dropdown on Sign In page) |
| `is_active` | BOOLEAN | No | `TRUE` | None | Account activity status |
| `is_verified` | BOOLEAN | No | `FALSE` | None | Email verification status |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp (UTC) |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp (UTC) |

### 2.2 `policies`
Stores government policies uploaded by authorized policy officers or system admins.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `title` | VARCHAR(255) | No | None | Index | Official policy title |
| `description` | TEXT | No | None | None | Comprehensive policy text |
| `sector` | VARCHAR(100) | No | None | Index | Sector (Agriculture, Education, etc.) |
| `ministry_or_department` | VARCHAR(200) | No | None | Index | Issuing government body |
| `effective_date` | DATE | No | None | None | Date policy takes effect |
| `status` | VARCHAR(50) | No | `'active'` | Index, CHECK (`draft`, `active`, `archived`) | Policy lifecycle state |
| `uploaded_by_id` | UUID | Yes | NULL | FK -> `users.id` (ON DELETE SET NULL), Index | Uploader user ID |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.3 `schemes`
Public welfare schemes formulated under specific government policies.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `policy_id` | UUID | No | None | FK -> `policies.id` (ON DELETE CASCADE), Index | Parent policy ID |
| `title` | VARCHAR(255) | No | None | Index | Scheme title |
| `code` | VARCHAR(50) | No | None | UNIQUE, Index | Unique government scheme code |
| `summary` | TEXT | No | None | None | Short summary of scheme |
| `benefits_summary` | TEXT | No | None | None | Detailed financial/social benefits |
| `budget_allocation` | NUMERIC(15,2) | No | `0.00` | None | Allocated budget in INR |
| `status` | VARCHAR(50) | No | `'active'` | Index, CHECK (`active`, `paused`, `closed`) | Scheme state |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.4 `eligibility_rules`
Defines demographic, financial, and regional criteria for scheme eligibility matching.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `scheme_id` | UUID | No | None | FK -> `schemes.id` (ON DELETE CASCADE), Index | Associated scheme |
| `rule_name` | VARCHAR(150) | No | None | None | Descriptive rule name |
| `min_age` | INTEGER | Yes | NULL | CHECK (`min_age >= 0`) | Minimum age limit |
| `max_age` | INTEGER | Yes | NULL | CHECK (`max_age >= min_age`) | Maximum age limit |
| `max_income` | NUMERIC(12,2) | Yes | NULL | CHECK (`max_income >= 0`) | Upper annual income threshold |
| `gender_requirement` | VARCHAR(20) | No | `'all'` | CHECK (`all`, `male`, `female`, `other`) | Targeted gender |
| `caste_category` | VARCHAR(50) | No | `'all'` | None | Social category filter |
| `state_or_region` | VARCHAR(100) | No | `'all'` | Index | Geographical eligibility |
| `occupation_type` | VARCHAR(100) | No | `'all'` | None | Target occupation |
| `rule_criteria_json` | JSONB | No | `'{}'` | None | Dynamic JSON criteria rules |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.5 `notifications`
Direct messages and status alerts sent to registered users.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `user_id` | UUID | No | None | FK -> `users.id` (ON DELETE CASCADE), Index | Recipient user ID |
| `title` | VARCHAR(255) | No | None | None | Notification subject |
| `message` | TEXT | No | None | None | Body text |
| `notification_type` | VARCHAR(50) | No | `'system'` | Index | Alert category |
| `is_read` | BOOLEAN | No | `FALSE` | Index | Read status flag |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.6 `feedback`
Feedback and ratings submitted by citizens on platform operations or public schemes.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `user_id` | UUID | No | None | FK -> `users.id` (ON DELETE CASCADE), Index | User submitting feedback |
| `scheme_id` | UUID | Yes | NULL | FK -> `schemes.id` (ON DELETE SET NULL), Index | Target scheme ID (optional) |
| `rating` | INTEGER | No | None | CHECK (`rating BETWEEN 1 AND 5`) | 1 to 5 star rating |
| `comments` | TEXT | Yes | NULL | None | Detailed user comments |
| `category` | VARCHAR(50) | No | `'general'` | None | Category of feedback |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Submission timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.7 `reports`
Analytical intelligence reports generated by policy officers or administrative personnel.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `user_id` | UUID | No | None | FK -> `users.id` (ON DELETE CASCADE), Index | Report owner ID |
| `report_type` | VARCHAR(50) | No | None | Index | Report type |
| `title` | VARCHAR(255) | No | None | None | Report title |
| `parameters_json` | JSONB | No | `'{}'` | None | Filter & query settings |
| `content_json` | JSONB | No | `'{}'` | None | Generated analytical result payload |
| `status` | VARCHAR(50) | No | `'pending'` | Index, CHECK (`pending`, `processing`, `completed`, `failed`) | Async generation state |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.8 `audit_logs`
Immutable record of administrative, user, and system operational events for auditability.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `user_id` | UUID | Yes | NULL | FK -> `users.id` (ON DELETE SET NULL), Index | Performing user ID |
| `action` | VARCHAR(100) | No | None | Index | Event action name |
| `entity_type` | VARCHAR(50) | No | None | Index | Target entity type |
| `entity_id` | VARCHAR(100) | No | None | None | Target entity UUID string |
| `ip_address` | VARCHAR(45) | Yes | NULL | None | Origin IP address |
| `details_json` | JSONB | No | `'{}'` | None | Event context payload |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Audit timestamp |

### 2.9 `search_history`
Stores historical query inputs and filters to power personal recommendations and policy search analytics.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `id` | UUID | No | `uuid_generate_v4()` | PK, Index | Primary key |
| `user_id` | UUID | No | None | FK -> `users.id` (ON DELETE CASCADE), Index | Searching user ID |
| `search_query` | TEXT | No | None | None | Raw user search input |
| `filters_applied` | JSONB | No | `'{}'` | None | Active search filters |
| `results_count` | INTEGER | No | `0` | None | Count of returned items |
| `created_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Search timestamp |
| `updated_at` | TIMESTAMPTZ | No | `CURRENT_TIMESTAMP` | None | Modification timestamp |

### 2.10 `alembic_version`
Internal Alembic schema migration tracker table automatically created and managed by Alembic.

| Column | Data Type | Nullable | Default | Constraints | Description |
|---|---|---|---|---|---|
| `version_num` | VARCHAR(32) | No | None | PK | Active revision ID (`001_initial_schema`) |

---

## 3. Entity Relationships & Foreign Key Cascade Rules

1. **User ↔ Policy (1:N)**: A Policy Officer can upload multiple Policies (`Policy.uploaded_by_id` -> `users.id`). `ON DELETE SET NULL` ensures policies remain in system even if an officer account is deleted.
2. **Policy ↔ Scheme (1:N)**: A Policy contains multiple Schemes (`Scheme.policy_id` -> `policies.id`). `ON DELETE CASCADE` automatically cleans up child schemes if a policy is removed.
3. **Scheme ↔ EligibilityRule (1:N)**: A Scheme has multiple Eligibility Rules (`EligibilityRule.scheme_id` -> `schemes.id`). `ON DELETE CASCADE` removes rules when a scheme is removed.
4. **User ↔ Notification (1:N)**: A User receives many Notifications (`Notification.user_id` -> `users.id`). `ON DELETE CASCADE`.
5. **User ↔ Feedback (1:N)**: A User submits Feedback (`Feedback.user_id` -> `users.id`). `ON DELETE CASCADE`.
6. **Scheme ↔ Feedback (1:N)**: Feedback optionally links to a Scheme (`Feedback.scheme_id` -> `schemes.id`). `ON DELETE SET NULL`.
7. **User ↔ Report (1:N)**: A User generates multiple Reports (`Report.user_id` -> `users.id`). `ON DELETE CASCADE`.
8. **User ↔ AuditLog (1:N)**: Audit Logs track User actions (`AuditLog.user_id` -> `users.id`). `ON DELETE SET NULL` preserves audit trail for legal/security auditing.
9. **User ↔ SearchHistory (1:N)**: A User accumulates search queries (`SearchHistory.user_id` -> `users.id`). `ON DELETE CASCADE`.

---

## 4. Verified Database Implementation State

The PostgreSQL database `policygpt_db` owned by `policygpt_user` has been initialized, migrated, seeded, and verified:
- **Total Tables**: 10 tables (`alembic_version`, `audit_logs`, `eligibility_rules`, `feedback`, `notifications`, `policies`, `reports`, `schemes`, `search_history`, `users`).
- **Migrations Applied**:
  - `001_initial_schema` — Initial 9-table schema.
  - `002_add_phone_number` — Added `phone_number VARCHAR(20)` column + index to `users` table (frontend alignment).
- **Seeding Command**: Executed `python scripts/seed_data.py`.
- **Live Verification**: Verified via `psql -U policygpt_user -d policygpt_db` command `\d users`.

---

## 5. Frontend Compatibility — Sign In / Sign Up

The schema is fully aligned with the finalized Angular frontend. The table below maps every frontend form field to its database column:

### Sign In Page (`login.component.html`)

| Frontend Field | Input Type | DB Column | Notes |
|---|---|---|---|
| Select Role | `<select>` | `users.role` | Frontend values: `Citizen` → `citizen`, `Officer` → `policy_officer`, `Admin` → `admin` (normalized by backend) |
| Email Address | `type="email"` | `users.email` | UNIQUE, indexed |
| Password | `type="password"` | `users.hashed_password` | Backend hashes with bcrypt before storing |
| Remember Me | `type="checkbox"` | *(UI only)* | Handled via JWT token TTL in backend; no DB column needed |

### Sign Up Page (`register.component.html`)

| Frontend Field | Input Type | DB Column | Notes |
|---|---|---|---|
| User Name | `type="text"` | `users.full_name` | Stored as full name |
| Phone Number | `type="tel"` | `users.phone_number` | Added in migration `002_add_phone_number`; nullable |
| Email Address | `type="email"` | `users.email` | UNIQUE, indexed |
| Password | `type="password"` | `users.hashed_password` | Backend hashes with bcrypt |
| Confirm Password | `type="password"` | *(UI only)* | Frontend validation only; not stored |

> **Backend Integration Notes for the FastAPI team:**
> - Role values from the login dropdown must be normalized to lowercase DB values (`citizen`, `policy_officer`, `admin`) before querying.
> - Password must be hashed using `passlib[bcrypt]` before insertion.
> - `phone_number` is nullable — a user may register without providing one (make it optional in the Pydantic schema).
> - `is_verified` defaults to `FALSE`; the backend should implement an email verification flow to set it to `TRUE`.
