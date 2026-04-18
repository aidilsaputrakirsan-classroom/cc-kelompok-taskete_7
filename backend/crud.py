"""
SIMCUTI — Business Logic (CRUD + SAW Algorithm)
Semua operasi database dan kalkulasi ada di sini.
"""
from datetime import date, datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_

from models import User, LeaveRequest, Holiday
from schemas import (
    UserCreate, LeaveCreate, LeaveApproveReject,
    HolidayCreate, KaryawanSAWData, SAWResponse
)
from auth import hash_password, verify_password


# ==================== UTILS KALKULASI HARI KERJA ====================

def get_holiday_dates(db: Session) -> set:
    """Ambil semua tanggal hari libur dari database sebagai set."""
    holidays = db.query(Holiday.date).all()
    return {h.date for h in holidays}


def count_working_days(start_date: date, end_date: date, db: Session) -> int:
    """
    Hitung hari kerja efektif antara start_date dan end_date (inclusive).
    EXCLUDE: Sabtu, Minggu, dan hari libur nasional/cuti bersama dari DB.
    
    Catatan: Hari libur nasional TIDAK dihitung sebagai cuti karyawan
    karena merupakan hari libur wajib untuk semua.
    """
    if end_date < start_date:
        return 0

    holiday_dates = get_holiday_dates(db)
    working_days = 0
    current = start_date

    while current <= end_date:
        # Exclude Sabtu (weekday=5) dan Minggu (weekday=6)
        if current.weekday() < 5:
            # Exclude hari libur nasional & cuti bersama
            if current not in holiday_dates:
                working_days += 1
        current += timedelta(days=1)

    return working_days


def get_used_leave_days(user_id: int, db: Session) -> int:
    """
    Hitung total hari cuti yang sudah digunakan (approved) oleh user pada tahun berjalan.
    Menggunakan sum() untuk efisiensi jika dalam satu tahun, 
    dan recalculate hanya jika melintasi tahun.
    """
    current_year = datetime.now().year
    year_start = date(current_year, 1, 1)
    year_end = date(current_year, 12, 31)

    leaves = db.query(LeaveRequest).filter(
        LeaveRequest.user_id == user_id,
        LeaveRequest.status == "approved",
        or_(
            and_(LeaveRequest.start_date >= year_start, LeaveRequest.start_date <= year_end),
            and_(LeaveRequest.end_date >= year_start, LeaveRequest.end_date <= year_end),
            and_(LeaveRequest.start_date < year_start, LeaveRequest.end_date > year_end)
        )
    ).all()

    total_days = 0
    for l in leaves:
        if l.start_date >= year_start and l.end_date <= year_end:
            # Full dalam tahun ini, gunakan yang tersimpan
            total_days += l.working_days
        else:
            # Melintasi batas tahun, hitung proporsional
            effective_start = max(l.start_date, year_start)
            effective_end = min(l.end_date, year_end)
            total_days += count_working_days(effective_start, effective_end, db)
        
    return total_days


# ==================== USER CRUD ====================

def create_user(db: Session, user_data: UserCreate) -> Optional[User]:
    """Buat user baru. Return None jika email sudah terdaftar."""
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        return None

    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=user_data.role or "karyawan",
        department=user_data.department,
        join_date=user_data.join_date or date.today(),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Verifikasi email + password. Return user jika valid, None jika tidak."""
    user = db.query(User).filter(User.email == email, User.is_active == True).first()
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user


def get_all_karyawan(db: Session) -> List[User]:
    """Ambil semua user yang berperan sebagai karyawan."""
    return db.query(User).filter(User.role == "karyawan", User.is_active == True).all()


# ==================== LEAVE REQUEST CRUD ====================

def create_leave_request(
    db: Session,
    leave_data: LeaveCreate,
    user: User,
) -> Optional[LeaveRequest]:
    """
    Buat pengajuan cuti baru.
    Validasi: sisa kuota mencukupi, tidak ada pengajuan pending yang overlapping.
    """
    # Hitung hari kerja efektif
    working_days = count_working_days(leave_data.start_date, leave_data.end_date, db)
    if working_days == 0:
        return None  # Semua hari adalah libur/weekend

    # Cek sisa kuota
    used = get_used_leave_days(user.id, db)
    remaining = user.annual_leave_quota - used
    if working_days > remaining:
        return None  # Kuota tidak cukup

    # Cek apakah ada pengajuan pending yang overlapping
    overlap = db.query(LeaveRequest).filter(
        LeaveRequest.user_id == user.id,
        LeaveRequest.status == "pending",
        or_(
            and_(LeaveRequest.start_date <= leave_data.start_date, LeaveRequest.end_date >= leave_data.start_date),
            and_(LeaveRequest.start_date <= leave_data.end_date, LeaveRequest.end_date >= leave_data.end_date),
            and_(LeaveRequest.start_date >= leave_data.start_date, LeaveRequest.end_date <= leave_data.end_date),
        )
    ).first()
    if overlap:
        return None  # Ada overlap dengan pengajuan pending

    leave = LeaveRequest(
        user_id=user.id,
        start_date=leave_data.start_date,
        end_date=leave_data.end_date,
        working_days=working_days,
        reason=leave_data.reason,
        emergency_contact=leave_data.emergency_contact,
        status="pending",
    )
    db.add(leave)
    db.commit()
    db.refresh(leave)
    return leave


def get_leave_requests_by_user(
    db: Session,
    user_id: int,
    skip: int = 0,
    limit: int = 50,
    status_filter: Optional[str] = None,
) -> dict:
    """Ambil daftar pengajuan cuti milik user tertentu."""
    query = db.query(LeaveRequest).filter(LeaveRequest.user_id == user_id)
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    total = query.count()
    items = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


def get_all_leave_requests(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    status_filter: Optional[str] = None,
) -> dict:
    """Ambil semua pengajuan cuti (untuk admin)."""
    query = db.query(LeaveRequest)
    if status_filter:
        query = query.filter(LeaveRequest.status == status_filter)
    total = query.count()
    items = query.order_by(LeaveRequest.created_at.desc()).offset(skip).limit(limit).all()
    return {"total": total, "items": items}


def get_leave_by_id(db: Session, leave_id: int) -> Optional[LeaveRequest]:
    """Ambil satu pengajuan cuti berdasarkan ID."""
    return db.query(LeaveRequest).filter(LeaveRequest.id == leave_id).first()


def approve_leave(
    db: Session,
    leave_id: int,
    admin: User,
) -> Optional[LeaveRequest]:
    """Admin: Approve pengajuan cuti."""
    leave = get_leave_by_id(db, leave_id)
    if not leave or leave.status != "pending":
        return None
    leave.status = "approved"
    leave.admin_id = admin.id
    db.commit()
    db.refresh(leave)
    return leave


def reject_leave(
    db: Session,
    leave_id: int,
    admin: User,
    data: LeaveApproveReject,
) -> Optional[LeaveRequest]:
    """Admin: Reject pengajuan cuti dengan catatan penolakan."""
    leave = get_leave_by_id(db, leave_id)
    if not leave or leave.status != "pending":
        return None
    leave.status = "rejected"
    leave.admin_id = admin.id
    leave.rejection_note = data.rejection_note
    db.commit()
    db.refresh(leave)
    return leave


# ==================== HOLIDAY CRUD ====================

def get_holidays(db: Session) -> List[Holiday]:
    """Ambil semua hari libur, diurutkan berdasarkan tanggal."""
    return db.query(Holiday).order_by(Holiday.date.asc()).all()


def create_holiday(db: Session, data: HolidayCreate) -> Optional[Holiday]:
    """Tambah hari libur baru. Return None jika tanggal sudah ada."""
    existing = db.query(Holiday).filter(Holiday.date == data.date).first()
    if existing:
        return None
    holiday = Holiday(date=data.date, name=data.name, type=data.type or "nasional")
    db.add(holiday)
    db.commit()
    db.refresh(holiday)
    return holiday


def delete_holiday(db: Session, holiday_id: int) -> bool:
    """Hapus hari libur berdasarkan ID."""
    holiday = db.query(Holiday).filter(Holiday.id == holiday_id).first()
    if not holiday:
        return False
    db.delete(holiday)
    db.commit()
    return True


# ==================== ANALYTICS & SAW ====================

def get_summary_stats(db: Session) -> dict:
    """Hitung statistik ringkasan cuti."""
    total_karyawan = db.query(User).filter(User.role == "karyawan", User.is_active == True).count()
    total_pengajuan = db.query(LeaveRequest).count()
    pending_count = db.query(LeaveRequest).filter(LeaveRequest.status == "pending").count()
    approved_count = db.query(LeaveRequest).filter(LeaveRequest.status == "approved").count()
    rejected_count = db.query(LeaveRequest).filter(LeaveRequest.status == "rejected").count()
    total_hari = db.query(func.sum(LeaveRequest.working_days)).filter(
        LeaveRequest.status == "approved"
    ).scalar() or 0

    return {
        "total_karyawan": total_karyawan,
        "total_pengajuan": total_pengajuan,
        "pending_count": pending_count,
        "approved_count": approved_count,
        "rejected_count": rejected_count,
        "total_hari_cuti_approved": total_hari,
    }


def calculate_saw(db: Session) -> SAWResponse:
    """
    Algoritma SAW (Simple Additive Weighting) untuk ranking karyawan.
    
    Kriteria & Bobot:
    - C1: Sisa Kuota Cuti (Benefit)   — 0.30
    - C2: Total Pengajuan (Cost)       — 0.20
    - C3: Jumlah Pending (Cost)        — 0.20
    - C4: % Approved (Benefit)         — 0.15
    - C5: Masa Kerja/hari (Benefit)    — 0.15
    
    Catatan: Semakin TINGGI skor SAW = karyawan lebih "disiplin" cuti
    (sisa kuota banyak, jarang pending berlebihan, approval rate tinggi, masa kerja lama)
    """
    BOBOT = {
        "sisa_kuota": 0.30,      # Benefit
        "total_pengajuan": 0.20, # Cost
        "pending": 0.20,         # Cost
        "approval_rate": 0.15,   # Benefit
        "masa_kerja": 0.15,      # Benefit
    }

    karyawans = get_all_karyawan(db)
    if not karyawans:
        return SAWResponse(bobot=BOBOT, data=[])

    today = date.today()
    raw_data = []

    for k in karyawans:
        # Hitung statistik pengajuan
        total_requests = db.query(LeaveRequest).filter(LeaveRequest.user_id == k.id).count()
        pending = db.query(LeaveRequest).filter(
            LeaveRequest.user_id == k.id, LeaveRequest.status == "pending"
        ).count()
        approved = db.query(LeaveRequest).filter(
            LeaveRequest.user_id == k.id, LeaveRequest.status == "approved"
        ).count()
        rejected = db.query(LeaveRequest).filter(
            LeaveRequest.user_id == k.id, LeaveRequest.status == "rejected"
        ).count()

        # Approval rate (dari non-pending, neutral 50% jika belum ada data)
        non_pending = total_requests - pending
        approval_rate = (approved / non_pending * 100) if non_pending > 0 else 50.0

        # Total hari cuti yang sudah digunakan
        used_days = get_used_leave_days(k.id, db)
        remaining_quota = max(k.annual_leave_quota - used_days, 0)

        # Masa kerja dalam hari
        jd = k.join_date if k.join_date else today
        masa_kerja = max((today - jd).days, 1)

        raw_data.append({
            "user": k,
            "total_requests": total_requests,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": approval_rate,
            "remaining_quota": remaining_quota,
            "used_days": used_days,
            "masa_kerja": masa_kerja,
        })

    if not raw_data:
        return SAWResponse(bobot=BOBOT, data=[])

    # ===== LANGKAH 1: Normalisasi Matriks =====
    # Benefit: nilai / max(nilai)
    # Cost: min(nilai) / nilai

    # ===== LANGKAH 1: Normalisasi Matriks (Linear Scale) =====
    max_sisa_kuota = max(r["remaining_quota"] for r in raw_data) or 1
    min_sisa_kuota = min(r["remaining_quota"] for r in raw_data)
    
    max_total_req = max(r["total_requests"] for r in raw_data) or 1
    min_total_req = min(r["total_requests"] for r in raw_data)
    
    max_pending = max(r["pending"] for r in raw_data) or 1
    min_pending = min(r["pending"] for r in raw_data)
    
    max_approval_rate = max(r["approval_rate"] for r in raw_data) or 1
    min_approval_rate = min(r["approval_rate"] for r in raw_data)
    
    max_masa_kerja = max(r["masa_kerja"] for r in raw_data) or 1
    min_masa_kerja = min(r["masa_kerja"] for r in raw_data)

    # ===== LANGKAH 2: Hitung Skor SAW =====
    result_data = []
    for i, r in enumerate(raw_data):
        k = r["user"]

        # Normalisasi Sisa Kuota (Benefit)
        n_sisa_kuota = (r["remaining_quota"] - min_sisa_kuota) / (max_sisa_kuota - min_sisa_kuota) if max_sisa_kuota > min_sisa_kuota else 1.0

        # Normalisasi Total Pengajuan (Cost)
        n_total_req = (max_total_req - r["total_requests"]) / (max_total_req - min_total_req) if max_total_req > min_total_req else 1.0

        # Normalisasi Pending (Cost)
        n_pending = (max_pending - r["pending"]) / (max_pending - min_pending) if max_pending > min_pending else 1.0

        # Normalisasi Approval Rate (Benefit)
        n_approval_rate = (r["approval_rate"] - min_approval_rate) / (max_approval_rate - min_approval_rate) if max_approval_rate > min_approval_rate else 1.0

        # Normalisasi Masa Kerja (Benefit)
        n_masa_kerja = (r["masa_kerja"] - min_masa_kerja) / (max_masa_kerja - min_masa_kerja) if max_masa_kerja > min_masa_kerja else 1.0

        # Skor SAW = Σ(bobot * nilai_normalisasi)
        saw_score = (
            BOBOT["sisa_kuota"] * n_sisa_kuota +
            BOBOT["total_pengajuan"] * n_total_req +
            BOBOT["pending"] * n_pending +
            BOBOT["approval_rate"] * n_approval_rate +
            BOBOT["masa_kerja"] * n_masa_kerja
        )

        result_data.append(KaryawanSAWData(
            user_id=k.id,
            name=k.name,
            email=k.email,
            department=k.department,
            join_date=k.join_date,
            annual_leave_quota=k.annual_leave_quota,
            total_leave_taken=r["used_days"],
            total_requests=r["total_requests"],
            pending_requests=r["pending"],
            approved_requests=r["approved"],
            rejected_requests=r["rejected"],
            approval_rate=round(r["approval_rate"], 2),
            remaining_quota=r["remaining_quota"],
            working_days=r["masa_kerja"],
            saw_score=round(saw_score, 4),
            rank=0,  # Akan diisi setelah sort
        ))

    # ===== LANGKAH 3: Rank berdasarkan skor (tertinggi = rank 1) =====
    result_data.sort(key=lambda x: x.saw_score, reverse=True)
    for i, item in enumerate(result_data):
        item.rank = i + 1

    return SAWResponse(bobot=BOBOT, data=result_data)