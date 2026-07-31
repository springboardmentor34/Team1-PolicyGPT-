-- =============================================================================
-- PolicyGPT - PostgreSQL Database Setup Script
-- Run this ONCE as the postgres superuser to create the role and database.
--
-- Usage (PowerShell):
--   & "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -f setup_postgres.sql
-- =============================================================================

-- 1. Create the application user (role) if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'policygpt_user') THEN
        CREATE ROLE policygpt_user WITH LOGIN PASSWORD 'policygpt_password';
        RAISE NOTICE 'Role policygpt_user created.';
    ELSE
        -- Ensure password matches .env even if role already exists
        ALTER ROLE policygpt_user WITH PASSWORD 'policygpt_password';
        RAISE NOTICE 'Role policygpt_user already exists - password updated.';
    END IF;
END
$$;

-- 2. Create the database if it doesn't exist
SELECT 'CREATE DATABASE policygpt_db OWNER policygpt_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'policygpt_db')\gexec

-- 3. Grant privileges
GRANT ALL PRIVILEGES ON DATABASE policygpt_db TO policygpt_user;

\echo ''
\echo '======================================================'
\echo 'Setup complete! policygpt_user and policygpt_db ready.'
\echo 'Next steps:'
\echo '  cd database'
\echo '  alembic upgrade head'
\echo '  python scripts/seed_data.py'
\echo '======================================================'
