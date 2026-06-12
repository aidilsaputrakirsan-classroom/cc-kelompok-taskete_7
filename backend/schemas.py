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


class UserResponse(BaseModel):
    id: int
    email: str
    name: str
    role: str
    department: Optional[str] = None
    join_date: Optional[date] = None
    annual_leave_quota: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


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


class LeaveUpdate(BaseModel):
    """Schema untuk update pengajuan cuti (hanya untuk status pending)."""
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


# ===================== ITEM SCHEMAS =====================

class ItemCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    quantity: int


class ItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None


class ItemResponse(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    price: float
    quantity: int
    created_by: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    total: int
    items: List[ItemResponse]


class ItemStatsResponse(BaseModel):
    total_items: int
    total_value: float
    avg_price: float
    total_quantity: int
    avg_quantity: float


# ===================== DASHBOARD SCHEMAS =====================

class DashboardStats(BaseModel):
    """Statistik lengkap untuk dashboard admin."""
    total_karyawan: int
    total_pengajuan: int
    pending_count: int
    approved_count: int
    rejected_count: int
    total_hari_cuti_approved: int
    avg_leave_per_employee: float
    quota_utilization_percent: float


class MonthlyTrendItem(BaseModel):
    month: int
    month_name: str
    year: int
    total_requests: int
    approved: int
    rejected: int
    pending: int
    total_working_days: int


class DepartmentStats(BaseModel):
    department: str
    employee_count: int
    total_requests: int
    approved_count: int
    total_days_taken: int
    avg_days_per_employee: float


class DashboardResponse(BaseModel):
    stats: DashboardStats
    monthly_trends: List[MonthlyTrendItem]
    department_summary: List[DepartmentStats]
    recent_pending: List[LeaveResponse]


# ===================== DATE BREAKDOWN SCHEMAS =====================

class DateBreakdownItem(BaseModel):
    date: date
    day_name: str
    is_working_day: bool
    is_weekend: bool
    is_holiday: bool
    holiday_name: Optional[str] = None


class LeaveCalculationResponse(BaseModel):
    """Preview kalkulasi hari kerja sebelum submit pengajuan cuti."""
    start_date: date
    end_date: date
    total_calendar_days: int
    working_days: int
    weekend_days: int
    holiday_days: int
    breakdown: List[DateBreakdownItem]