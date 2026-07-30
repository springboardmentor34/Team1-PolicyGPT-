import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

try:
    from pydantic_settings import BaseSettings

    class Settings(BaseSettings):
        POSTGRES_USER: str = os.getenv("POSTGRES_USER", "policygpt_user")
        POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "policygpt_password")
        POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
        POSTGRES_DB: str = os.getenv("POSTGRES_DB", "policygpt_db")
        
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
        )

        class Config:
            env_file = ".env"
            extra = "ignore"

    settings = Settings()

except ImportError:
    # Fallback to plain class if pydantic_settings is not available
    class Settings:
        POSTGRES_USER: str = os.getenv("POSTGRES_USER", "policygpt_user")
        POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "policygpt_password")
        POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
        POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
        POSTGRES_DB: str = os.getenv("POSTGRES_DB", "policygpt_db")
        DATABASE_URL: str = os.getenv(
            "DATABASE_URL", 
            f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
        )

    settings = Settings()
