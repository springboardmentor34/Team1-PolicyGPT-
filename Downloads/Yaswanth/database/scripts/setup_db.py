"""
PolicyGPT - PostgreSQL Initial Setup Script
============================================
Run this ONCE as a user who knows the postgres superuser password.
It creates the policygpt_user role and policygpt_db database.

Usage:
    python scripts/setup_db.py
    python scripts/setup_db.py --postgres-password YOUR_POSTGRES_PASSWORD
"""

import sys
import os
import argparse

# Add root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def setup_database(postgres_password: str) -> None:
    """Create policygpt_user role and policygpt_db database."""
    try:
        import psycopg2
        from psycopg2 import sql
        from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
    except ImportError:
        print("ERROR: psycopg2-binary not installed. Run: pip install psycopg2-binary")
        sys.exit(1)

    app_user = "policygpt_user"
    app_password = "policygpt_password"
    app_db = "policygpt_db"

    print("=" * 60)
    print("PolicyGPT PostgreSQL Setup")
    print("=" * 60)

    # Connect as postgres superuser to the default 'postgres' database
    try:
        conn = psycopg2.connect(
            host="localhost",
            port=5432,
            dbname="postgres",
            user="postgres",
            password=postgres_password,
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        print(f"[✓] Connected to PostgreSQL as postgres superuser.")
    except psycopg2.OperationalError as e:
        print(f"\n[✗] Could not connect as postgres superuser:\n    {e}")
        print("\nTip: Make sure PostgreSQL is running and the postgres password is correct.")
        print("     Retry with:  python scripts/setup_db.py --postgres-password <password>")
        sys.exit(1)

    # --- Create role ---
    cur.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (app_user,))
    if cur.fetchone():
        cur.execute(
            sql.SQL("ALTER ROLE {} WITH PASSWORD %s").format(sql.Identifier(app_user)),
            (app_password,)
        )
        print(f"[✓] Role '{app_user}' already exists — password updated to match .env.")
    else:
        cur.execute(
            sql.SQL("CREATE ROLE {} WITH LOGIN PASSWORD %s").format(sql.Identifier(app_user)),
            (app_password,)
        )
        print(f"[✓] Role '{app_user}' created with password from .env.")

    # --- Create database ---
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (app_db,))
    if cur.fetchone():
        print(f"[✓] Database '{app_db}' already exists — skipping creation.")
    else:
        cur.execute(
            sql.SQL("CREATE DATABASE {} OWNER {}").format(
                sql.Identifier(app_db), sql.Identifier(app_user)
            )
        )
        print(f"[✓] Database '{app_db}' created and owned by '{app_user}'.")

    # --- Grant privileges ---
    cur.execute(
        sql.SQL("GRANT ALL PRIVILEGES ON DATABASE {} TO {}").format(
            sql.Identifier(app_db), sql.Identifier(app_user)
        )
    )
    print(f"[✓] All privileges on '{app_db}' granted to '{app_user}'.")

    cur.close()
    conn.close()

    print("\n" + "=" * 60)
    print("Setup complete! Run the following to finish:")
    print("  alembic upgrade head")
    print("  python scripts/seed_data.py")
    print("=" * 60)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Create policygpt_user role and policygpt_db database."
    )
    parser.add_argument(
        "--postgres-password",
        default="",
        help="Password for the postgres superuser (default: empty string)",
    )
    args = parser.parse_args()
    setup_database(args.postgres_password)
