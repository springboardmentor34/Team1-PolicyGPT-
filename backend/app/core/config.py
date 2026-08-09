import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PolicyGPT: Government Policy & Public Scheme Intelligence Platform"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = "policygpt_super_secret_jwt_key_change_in_production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours

    DATABASE_URL: str = "postgresql://policygpt_user:policygpt_pass@localhost:5432/policygpt_db"
    SQLITE_FALLBACK_URL: str = "sqlite:///./policygpt.db"

    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = "notifications@policygpt.gov.in"
    SMTP_PASSWORD: str = "sample_app_password"

    TWILIO_ACCOUNT_SID: str = "sample_sid"
    TWILIO_AUTH_TOKEN: str = "sample_token"
    TWILIO_PHONE_NUMBER: str = "+1234567890"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
