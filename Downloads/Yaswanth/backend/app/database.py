import sys
import importlib.util
from pathlib import Path

CURRENT_FILE = Path(__file__).resolve()
BACKEND_DIR = CURRENT_FILE.parent.parent

# Resolve candidate paths to locate the existing database directory
candidates = [
    BACKEND_DIR.parent / "database",
    BACKEND_DIR.parent.parent / "database",
    BACKEND_DIR.parent / "Downloads" / "Yaswanth" / "database",
]

db_dir = None
for c in candidates:
    if c.exists() and (c / "app" / "database.py").exists():
        db_dir = c
        break

if not db_dir:
    raise RuntimeError("Could not locate existing database directory.")


def _import_file(module_name: str, file_path: Path):
    if module_name in sys.modules:
        return sys.modules[module_name]
    spec = importlib.util.spec_from_file_location(module_name, str(file_path))
    mod = importlib.util.module_from_spec(spec)
    sys.modules[module_name] = mod
    spec.loader.exec_module(mod)
    return mod


# Load database configuration, session, and ORM base
db_config = _import_file("db_config", db_dir / "app" / "config.py")
sys.modules["app.config"] = db_config

db_database = _import_file("db_database", db_dir / "app" / "database.py")
sys.modules["app.database"] = db_database

Base = db_database.Base
SessionLocal = db_database.SessionLocal
engine = db_database.engine
get_database_db = db_database.get_db

# Register base models for internal relative imports inside user.py, policy.py, etc.
db_base_model = _import_file("db_base_model", db_dir / "app" / "models" / "base.py")
sys.modules["app.models.base"] = db_base_model

User = _import_file("db_user", db_dir / "app" / "models" / "user.py").User
Policy = _import_file("db_policy", db_dir / "app" / "models" / "policy.py").Policy
Scheme = _import_file("db_scheme", db_dir / "app" / "models" / "scheme.py").Scheme
EligibilityRule = _import_file("db_eligibility", db_dir / "app" / "models" / "eligibility.py").EligibilityRule
Notification = _import_file("db_notification", db_dir / "app" / "models" / "notification.py").Notification
Feedback = _import_file("db_feedback", db_dir / "app" / "models" / "feedback.py").Feedback
Report = _import_file("db_report", db_dir / "app" / "models" / "report.py").Report
AuditLog = _import_file("db_audit", db_dir / "app" / "models" / "audit.py").AuditLog
SearchHistory = _import_file("db_search", db_dir / "app" / "models" / "search.py").SearchHistory

# Attach model attributes directly to db_database module
models_dict = {
    "User": User,
    "Policy": Policy,
    "Scheme": Scheme,
    "EligibilityRule": EligibilityRule,
    "Notification": Notification,
    "Feedback": Feedback,
    "Report": Report,
    "AuditLog": AuditLog,
    "SearchHistory": SearchHistory,
}

for name, model_cls in models_dict.items():
    setattr(db_database, name, model_cls)


def get_db():
    """
    FastAPI Session Dependency.
    Yields database session lifecycle.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
