from sqlalchemy import Column, Integer, String, Boolean, Date, DateTime, Enum as SAEnum
from sqlalchemy.sql import func
import enum

from database import Base


# ==================== ENUMS ====================

class UserRole(str, enum.Enum):
    karyawan = "karyawan"
    admin = "admin"


# ==================== MODELS ====================

class User(Base):
    """Model tabel 'users' — karyawan & admin SIMCUTI."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
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