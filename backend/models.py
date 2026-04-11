<<<<<<< HEAD
"""
SIMCUTI — Database Models
Sistem Informasi Manajemen Cuti Karyawan
"""
from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from database import Base


=======
from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from database import Base


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    karyawan = "karyawan"
    admin = "admin"


# ==================== MODELS ====================

>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
class User(Base):
    """Model tabel 'users' — karyawan & admin SIMCUTI."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
<<<<<<< HEAD
    role = Column(String(20), nullable=False, default="karyawan")  # 'karyawan' | 'admin'
    department = Column(String(100), nullable=True)
    join_date = Column(Date, nullable=True)
    annual_leave_quota = Column(Integer, nullable=False, default=12)  # Jatah cuti tahunan (hari)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    leave_requests = relationship("LeaveRequest", back_populates="user", foreign_keys="LeaveRequest.user_id")
    handled_requests = relationship("LeaveRequest", back_populates="admin", foreign_keys="LeaveRequest.admin_id")


class LeaveRequest(Base):
    """Model untuk tabel 'leave_requests' — pengajuan cuti."""
    __tablename__ = "leave_requests"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    working_days = Column(Integer, nullable=False)  # Hari kerja efektif (exclude libur & weekend)
    reason = Column(Text, nullable=False)
    emergency_contact = Column(String(200), nullable=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Admin yang memproses
    status = Column(String(20), nullable=False, default="pending")  # 'pending'|'approved'|'rejected'
    rejection_note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="leave_requests", foreign_keys=[user_id])
    admin = relationship("User", back_populates="handled_requests", foreign_keys=[admin_id])


class Holiday(Base):
    """Model untuk tabel 'holidays' — hari libur nasional & cuti bersama."""
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    date = Column(Date, nullable=False, unique=True)
    name = Column(String(200), nullable=False)
    type = Column(String(50), nullable=False, default="nasional")  # 'nasional'|'cuti_bersama'
    created_at = Column(DateTime(timezone=True), server_default=func.now())
=======
    role = Column(SAEnum(UserRole), default=UserRole.karyawan, nullable=False)
    department = Column(String(100), nullable=True)
    position = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)
    leave_quota = Column(Integer, default=12, nullable=False)
    leave_used = Column(Integer, default=0, nullable=False)
    work_start_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
