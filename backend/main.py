"""
SIMCUTI — Main Application Entry Point
FastAPI app dengan semua endpoint SIMCUTI.
"""
import os
from dotenv import load_dotenv
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base
from schemas import (
    UserCreate, UserResponse, TokenResponse, LoginRequest,
    LeaveCreate, LeaveResponse, LeaveListResponse, LeaveApproveReject,
    HolidayCreate, HolidayResponse, HolidayListResponse,
    SAWResponse, SummaryStats,
)
from auth import create_access_token, get_current_user, require_admin
from models import User
import crud

load_dotenv()

# ==================== INISIALISASI DB TABLES ====================
Base.metadata.create_all(bind=engine)

# ==================== FASTAPI APP ====================
app = FastAPI(
    title="SIMCUTI API",
    description="""
## 🏢 SIMCUTI — Sistem Informasi Manajemen Cuti Karyawan

REST API untuk platform manajemen cuti digital berbasis cloud.

**Fitur Utama:**
- 🔐 Autentikasi JWT dengan Role-Based Access Control (Karyawan & Admin)
- 📋 Pengajuan & Approval Cuti dengan kalkulasi hari kerja otomatis
- 📅 Manajemen Kalender Hari Libur Nasional
- 📊 Sistem Pendukung Keputusan dengan Metode SAW

**Tim:** cc-kelompok-taskete_7 | Institut Teknologi Kalimantan
    """,
    version="1.0.0",
    contact={
        "name": "Tim Taskete 7",
        "email": "10231046@student.itk.ac.id",
    },
)

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
origins_list = [o.strip() for o in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== SYSTEM ENDPOINTS ====================

@app.get("/health", tags=["System"], summary="Health Check")
def health_check():
    """Cek status server dan API."""
    return {
        "status": "healthy",
        "app": "SIMCUTI",
        "version": "1.0.0",
        "description": "Sistem Informasi Manajemen Cuti Karyawan",
    }


@app.get("/team", tags=["System"], summary="Info Tim Pengembang")
def team_info():
    """Informasi tim pengembang SIMCUTI."""
    return {
        "team": "cc-kelompok-taskete_7",
        "project": "SIMCUTI — Sistem Informasi Manajemen Cuti Karyawan",
        "university": "Institut Teknologi Kalimantan",
        "course": "Komputasi Awan",
        "members": [
            {"name": "Noviansyah", "nim": "10231072", "role": "Lead Backend"},
            {"name": "Irwan Maulana", "nim": "10231046", "role": "Lead Frontend"},
            {"name": "Rayhan Iqbal", "nim": "10231080", "role": "Lead DevOps"},
            {"name": "Amalia Tiara Rezfani", "nim": "10231012", "role": "Lead QA & Docs"},
        ],
    }


# ==================== AUTH ENDPOINTS ====================

@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
    summary="Register User Baru",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Daftarkan user baru ke sistem SIMCUTI.
    - **role**: `karyawan` (default) atau `admin`
    - **email**: Harus unik
    """
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pendaftaran gagal. Email sudah terdaftar di sistem.",
        )
    return user


@app.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["Auth"],
    summary="Login & Dapatkan Token",
)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dengan email dan password. Mengembalikan JWT access token.
    Token berlaku selama 12 jam.
    """
    user = crud.authenticate_user(db=db, email=login_data.email, password=login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return TokenResponse(access_token=token, token_type="bearer", user=user)


@app.get(
    "/auth/me",
    response_model=UserResponse,
    tags=["Auth"],
    summary="Profil User Saat Ini",
)
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil data profil user yang sedang login."""
    return current_user


# ==================== LEAVE REQUEST ENDPOINTS ====================

@app.post(
    "/leaves",
    response_model=LeaveResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Pengajuan Cuti"],
    summary="Ajukan Cuti Baru",
)
def create_leave(
    leave_data: LeaveCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ajukan cuti baru.
    
    Sistem akan otomatis:
    - Menghitung hari kerja efektif (exclude Sabtu, Minggu, dan hari libur nasional)
    - Memvalidasi sisa kuota cuti mencukupi
    - Menolak jika ada pengajuan pending yang tanggalnya tumpang tindih
    """
    leave = crud.create_leave_request(db=db, leave_data=leave_data, user=current_user)
    if leave is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                "Pengajuan gagal. Kemungkinan penyebab: "
                "(1) Sisa kuota cuti tidak mencukupi, "
                "(2) Semua hari yang dipilih adalah hari libur/weekend, "
                "atau (3) Ada pengajuan pending dengan tanggal yang tumpang tindih."
            ),
        )
    return leave


@app.get(
    "/leaves",
    response_model=LeaveListResponse,
    tags=["Pengajuan Cuti"],
    summary="Riwayat Cuti Saya",
)
def my_leaves(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil riwayat pengajuan cuti milik user yang login."""
    return crud.get_leave_requests_by_user(
        db=db, user_id=current_user.id, skip=skip, limit=limit, status_filter=status_filter
    )


@app.get(
    "/leaves/all",
    response_model=LeaveListResponse,
    tags=["Pengajuan Cuti"],
    summary="[ADMIN] Semua Pengajuan Cuti",
)
def all_leaves(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=200),
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Ambil semua pengajuan cuti dari seluruh karyawan."""
    return crud.get_all_leave_requests(db=db, skip=skip, limit=limit, status_filter=status_filter)


@app.get(
    "/leaves/{leave_id}",
    response_model=LeaveResponse,
    tags=["Pengajuan Cuti"],
    summary="Detail Pengajuan Cuti",
)
def get_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Ambil detail satu pengajuan cuti.
    Karyawan hanya bisa melihat miliknya sendiri. Admin bisa melihat semua.
    """
    leave = crud.get_leave_by_id(db=db, leave_id=leave_id)
    if not leave:
        raise HTTPException(status_code=404, detail="Pengajuan cuti tidak ditemukan.")
    if current_user.role != "admin" and leave.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Akses ditolak.")
    return leave


@app.put(
    "/leaves/{leave_id}/approve",
    response_model=LeaveResponse,
    tags=["Pengajuan Cuti"],
    summary="[ADMIN] Setujui Pengajuan Cuti",
)
def approve_leave(
    leave_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Setujui pengajuan cuti yang masih pending."""
    leave = crud.approve_leave(db=db, leave_id=leave_id, admin=current_user)
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pengajuan tidak ditemukan atau sudah diproses sebelumnya.",
        )
    return leave


@app.put(
    "/leaves/{leave_id}/reject",
    response_model=LeaveResponse,
    tags=["Pengajuan Cuti"],
    summary="[ADMIN] Tolak Pengajuan Cuti",
)
def reject_leave(
    leave_id: int,
    data: LeaveApproveReject,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Tolak pengajuan cuti yang masih pending dengan catatan penolakan."""
    leave = crud.reject_leave(db=db, leave_id=leave_id, admin=current_user, data=data)
    if not leave:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Pengajuan tidak ditemukan atau sudah diproses sebelumnya.",
        )
    return leave


# ==================== HOLIDAY ENDPOINTS ====================

@app.get(
    "/holidays",
    response_model=HolidayListResponse,
    tags=["Hari Libur"],
    summary="Daftar Hari Libur Nasional",
)
def get_holidays(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Ambil daftar semua hari libur nasional dan cuti bersama."""
    holidays = crud.get_holidays(db=db)
    return {"total": len(holidays), "items": holidays}


@app.post(
    "/holidays",
    response_model=HolidayResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Hari Libur"],
    summary="[ADMIN] Tambah Hari Libur",
)
def add_holiday(
    data: HolidayCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Tambahkan hari libur nasional atau cuti bersama ke sistem."""
    holiday = crud.create_holiday(db=db, data=data)
    if not holiday:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tanggal tersebut sudah terdaftar sebagai hari libur.",
        )
    return holiday


@app.delete(
    "/holidays/{holiday_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["Hari Libur"],
    summary="[ADMIN] Hapus Hari Libur",
)
def remove_holiday(
    holiday_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Hapus data hari libur dari sistem."""
    success = crud.delete_holiday(db=db, holiday_id=holiday_id)
    if not success:
        raise HTTPException(status_code=404, detail="Hari libur tidak ditemukan.")
    return None


# ==================== ANALYTICS ENDPOINTS ====================

@app.get(
    "/analytics/saw",
    response_model=SAWResponse,
    tags=["Analytics"],
    summary="[ADMIN] Ranking SAW Karyawan",
)
def get_saw_ranking(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """
    **Admin only.** Hitung dan tampilkan ranking karyawan menggunakan
    **Metode SAW (Simple Additive Weighting)** berdasarkan 5 kriteria:
    
    | Kriteria | Bobot | Jenis |
    |---|---|---|
    | Sisa Kuota Cuti | 30% | Benefit |
    | Total Pengajuan | 20% | Cost |
    | Pengajuan Pending | 20% | Cost |
    | % Disetujui | 15% | Benefit |
    | Masa Kerja | 15% | Benefit |
    """
    return crud.calculate_saw(db=db)


@app.get(
    "/analytics/summary",
    response_model=SummaryStats,
    tags=["Analytics"],
    summary="[ADMIN] Statistik Ringkasan",
)
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """**Admin only.** Statistik ringkasan pengajuan cuti seluruh perusahaan."""
    return crud.get_summary_stats(db=db)