import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime, date

from models import UserRole


# ==================== USER / AUTH SCHEMAS ====================

class UserCreate(BaseModel):
    """Schema registrasi user baru."""
    email: EmailStr = Field(..., examples=["karyawan@perusahaan.com"])
    name: str = Field(..., min_length=2, max_length=100, examples=["Budi Santoso"])
    password: str = Field(..., min_length=8, examples=["Password123!"])
    role: UserRole = Field(UserRole.karyawan, examples=["karyawan"])
    department: Optional[str] = Field(None, max_length=100, examples=["Teknologi Informasi"])
    position: Optional[str] = Field(None, max_length=100, examples=["Software Engineer"])
    phone: Optional[str] = Field(None, max_length=20, examples=["081234567890"])
    leave_quota: int = Field(12, ge=0, le=365, examples=[12])
    work_start_date: Optional[date] = Field(None, examples=["2022-01-15"])

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password minimal 8 karakter.")
        return v


class UserUpdate(BaseModel):
    """Schema update profil user — semua field opsional."""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    department: Optional[str] = Field(None, max_length=100)
    position: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    leave_quota: Optional[int] = Field(None, ge=0, le=365)
    work_start_date: Optional[date] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    """Schema response profil user (tanpa password)."""
    id: int
    email: str
    name: str
    role: UserRole
    department: Optional[str] = None
    position: Optional[str] = None
    phone: Optional[str] = None
    leave_quota: int
    leave_used: int
    leave_remaining: int = 0
    work_start_date: Optional[date] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_remaining(cls, user) -> "UserResponse":
        data = cls.model_validate(user)
        data.leave_remaining = max(0, user.leave_quota - user.leave_used)
        return data


class UserListResponse(BaseModel):
    total: int
    users: list[UserResponse]


class TokenResponse(BaseModel):
    """Schema response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse