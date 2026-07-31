# PolicyGPT - Full Database Setup Script (PowerShell)
# =====================================================
# Run this script from the `database` folder.
# It will:
#   1. Create the policygpt_user role in PostgreSQL
#   2. Create the policygpt_db database
#   3. Run all Alembic migrations
#   4. Seed the database with sample data
#
# Usage:
#   .\scripts\setup_full.ps1 -PostgresPassword "your_postgres_password"
#
# If your postgres superuser has no password:
#   .\scripts\setup_full.ps1 -PostgresPassword ""

param(
    [Parameter(Mandatory=$true)]
    [string]$PostgresPassword
)

$PSQL = ""
# Detect psql path
$candidates = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\18\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "psql"
)
foreach ($c in $candidates) {
    if (Test-Path $c -ErrorAction SilentlyContinue) {
        $PSQL = $c
        break
    }
    if ($c -eq "psql") {
        if (Get-Command psql -ErrorAction SilentlyContinue) {
            $PSQL = "psql"
            break
        }
    }
}

if (-not $PSQL) {
    Write-Error "psql not found. Make sure PostgreSQL is installed."
    exit 1
}

Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  PolicyGPT Database Setup" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Using: $PSQL"

# Set PGPASSWORD so psql doesn't prompt interactively
$env:PGPASSWORD = $PostgresPassword

# ---- Step 1: Create role and database ----
Write-Host "`n[1/4] Creating PostgreSQL role and database..." -ForegroundColor Yellow

$setupSQL = @"
DO `$`$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'policygpt_user') THEN
        CREATE ROLE policygpt_user WITH LOGIN PASSWORD 'policygpt_password';
        RAISE NOTICE 'Created role policygpt_user';
    ELSE
        ALTER ROLE policygpt_user WITH PASSWORD 'policygpt_password';
        RAISE NOTICE 'Updated password for policygpt_user';
    END IF;
END
`$`$;

SELECT 'CREATE DATABASE policygpt_db OWNER policygpt_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'policygpt_db')\gexec

GRANT ALL PRIVILEGES ON DATABASE policygpt_db TO policygpt_user;
"@

$setupSQL | & $PSQL -U postgres -p 5432 -h localhost

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n[!] Could not connect as 'postgres' superuser on port 5432." -ForegroundColor Red
    Write-Host "    Make sure the password you passed with -PostgresPassword is correct." -ForegroundColor Red
    exit 1
}

Write-Host "[✓] Role 'policygpt_user' and database 'policygpt_db' are ready." -ForegroundColor Green

# ---- Step 2: Install Python dependencies ----
Write-Host "`n[2/4] Installing Python dependencies..." -ForegroundColor Yellow
pip install -r requirements.txt --quiet
Write-Host "[✓] Python packages installed." -ForegroundColor Green

# ---- Step 3: Run Alembic migrations ----
Write-Host "`n[3/4] Running Alembic migrations (alembic upgrade head)..." -ForegroundColor Yellow
alembic upgrade head
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Alembic migration failed." -ForegroundColor Red
    exit 1
}
Write-Host "[✓] All migrations applied successfully." -ForegroundColor Green

# ---- Step 4: Seed the database ----
Write-Host "`n[4/4] Seeding the database..." -ForegroundColor Yellow
python scripts/seed_data.py
if ($LASTEXITCODE -ne 0) {
    Write-Host "[!] Seed data script failed." -ForegroundColor Red
    exit 1
}
Write-Host "[✓] Seed data loaded successfully." -ForegroundColor Green

# ---- Verify ----
Write-Host "`n==================================================" -ForegroundColor Cyan
Write-Host "  Verification" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

$env:PGPASSWORD = "policygpt_password"
Write-Host "`nConnecting as policygpt_user and listing tables:`n"
& $PSQL -U policygpt_user -d policygpt_db -p 5432 -h localhost -c "\dt"

Write-Host "`nSample user records:`n"
& $PSQL -U policygpt_user -d policygpt_db -p 5432 -h localhost -c "SELECT email, full_name, phone_number, role FROM users ORDER BY role;"

Write-Host "`n==================================================" -ForegroundColor Green
Write-Host "  SUCCESS! Database is ready for backend dev." -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
