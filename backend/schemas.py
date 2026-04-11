<<<<<<< HEAD
"""
SIMCUTI — Pydantic Schemas (Request & Response Validation)
"""
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional, List
from datetime import date, datetime


# ===================== USER SCHEMAS =====================

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: Optional[str] = "karyawan"
    department: Optional[str] = None
    join_date: Optional[date] = None
=======
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
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2


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
<<<<<<< HEAD
    id: int
    email: str
    name: str
    role: str
    department: Optional[str] = None
    join_date: Optional[date] = None
    annual_leave_quota: int
=======
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
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_remaining(cls, user) -> "UserResponse":
        data = cls.model_validate(user)
        data.leave_remaining = max(0, user.leave_quota - user.leave_used)
        return data


<<<<<<< HEAD
class UserPublic(BaseModel):
    """Versi ringkas UserResponse untuk relasi."""
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
=======
class UserListResponse(BaseModel):
    total: int
    users: list[UserResponse]


class TokenResponse(BaseModel):
    """Schema response setelah login berhasil."""
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ===================== LEAVE REQUEST SCHEMAS =====================

class LeaveCreate(BaseModel):
    start_date: date
    end_date: date
    reason: str
    emergency_contact: Optional[str] = None

    @field_validator("end_date")
    @classmethod
    def end_after_start(cls, v, info):
        if "start_date" in info.data and v < info.data["start_date"]:
            raise ValueError("Tanggal selesai harus setelah tanggal mulai.")
        return v


class LeaveApproveReject(BaseModel):
    rejection_note: Optional[str] = None


class LeaveResponse(BaseModel):
    id: int
    user_id: int
    start_date: date
    end_date: date
    working_days: int
    reason: str
    emergency_contact: Optional[str] = None
    admin_id: Optional[int] = None
    status: str
    rejection_note: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    user: Optional[UserPublic] = None
    admin: Optional[UserPublic] = None

    class Config:
        from_attributes = True


class LeaveListResponse(BaseModel):
    total: int
    items: List[LeaveResponse]


# ===================== HOLIDAY SCHEMAS =====================

class HolidayCreate(BaseModel):
    date: date
    name: str
    type: Optional[str] = "nasional"


class HolidayResponse(BaseModel):
    id: int
    date: date
    name: str
    type: str
    created_at: datetime

    class Config:
        from_attributes = True


class HolidayListResponse(BaseModel):
    total: int
    items: List[HolidayResponse]


# ===================== ANALYTICS / SAW SCHEMAS =====================

class KaryawanSAWData(BaseModel):
    user_id: int
    name: str
    email: str
    department: Optional[str] = None
    join_date: Optional[date] = None
    annual_leave_quota: int
    total_leave_taken: int       # Hari cuti yang sudah approved
    total_requests: int          # Total pengajuan
    pending_requests: int        # Jumlah yang masih pending
    approved_requests: int       # Jumlah yang approved
    rejected_requests: int       # Jumlah yang rejected
    approval_rate: float         # % approved dari total non-pending
    remaining_quota: int         # Sisa kuota cuti
    working_days: int            # Masa kerja (hari dari join_date)
    saw_score: float             # Skor SAW akhir (0–1)
    rank: int                    # Peringkat


class SAWResponse(BaseModel):
    bobot: dict
    data: List[KaryawanSAWData]


class SummaryStats(BaseModel):
    total_karyawan: int
    total_pengajuan: int
    pending_count: int
    approved_count: int
    rejected_count: int
    total_hari_cuti_approved: int