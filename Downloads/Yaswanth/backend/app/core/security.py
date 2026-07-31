import bcrypt


def _truncate_password(password: str) -> bytes:
    """Truncate password to maximum 72 bytes for bcrypt algorithm."""
    if not password:
        return b""
    pwd_bytes = password.encode("utf-8")
    return pwd_bytes[:72]


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the hashed bcrypt password string."""
    if not plain_password or not hashed_password:
        return False
    try:
        return bcrypt.checkpw(_truncate_password(plain_password), hashed_password.encode("utf-8"))
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate bcrypt hash for password."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(_truncate_password(password), salt)
    return hashed.decode("utf-8")
