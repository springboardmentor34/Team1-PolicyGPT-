import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # App Settings
    PROJECT_NAME: str = "PolicyGPT API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = ""

    # Database Configuration
    POSTGRES_USER: str = os.getenv("POSTGRES_USER", "policygpt_user")
    POSTGRES_PASSWORD: str = os.getenv("POSTGRES_PASSWORD", "policygpt_password")
    POSTGRES_HOST: str = os.getenv("POSTGRES_HOST", "localhost")
    POSTGRES_PORT: int = int(os.getenv("POSTGRES_PORT", "5432"))
    POSTGRES_DB: str = os.getenv("POSTGRES_DB", "policygpt_db")
    
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_HOST}:{POSTGRES_PORT}/{POSTGRES_DB}"
    )

    # JWT Configuration
    SECRET_KEY: str = os.getenv("SECRET_KEY", "policygpt_super_secret_jwt_key_change_in_production_2026")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    # CORS Settings
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:4200,http://127.0.0.1:4200")

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]


settings = Settings()
