from typing import Optional
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field, ConfigDict, model_validator


def normalize_role(role_raw: str) -> str:
    """Normalize role string from frontend variants to database canonical role."""
    if not role_raw:
        return "citizen"
    role_lower = str(role_raw).strip().lower()
    if role_lower in ["citizen", "user"]:
        return "citizen"
    elif role_lower in ["officer", "government officer", "policy_officer", "policy officer"]:
        return "policy_officer"
    elif role_lower in ["admin", "administrator"]:
        return "admin"
    return role_lower


class SignupRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    full_name: Optional[str] = Field(None, alias="username")
    email: EmailStr
    phone_number: Optional[str] = Field(None, alias="phone")
    password: str
    confirm_password: str
    role: str = "citizen"

    @model_validator(mode="before")
    @classmethod
    def check_aliases_and_role(cls, data: dict) -> dict:
        if isinstance(data, dict):
            # Check full_name / username
            fn = data.get("full_name") or data.get("username")
            if fn:
                data["full_name"] = fn

            # Check phone_number / phone
            phone = data.get("phone_number") or data.get("phone")
            if phone:
                data["phone_number"] = phone

            # Normalize role
            if "role" in data:
                data["role"] = normalize_role(data["role"])
            else:
                data["role"] = "citizen"
        return data


class LoginRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    email: EmailStr
    password: str
    role: str = "citizen"

    @model_validator(mode="before")
    @classmethod
    def check_role(cls, data: dict) -> dict:
        if isinstance(data, dict) and "role" in data:
            data["role"] = normalize_role(data["role"])
        return data


class UserAuthResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    email: str
    role: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserAuthResponse
