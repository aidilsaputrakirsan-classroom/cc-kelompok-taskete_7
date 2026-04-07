from sqlalchemy.orm import Session
from passlib.context import CryptContext

from models import User, UserRole
from schemas import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# ==================== PASSWORD ====================

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


# ==================== USER CRUD ====================

def get_user_by_email(db: Session, email: str) -> User | None:
    return db.query(User).filter(User.email == email).first()


def get_user_by_id(db: Session, user_id: int) -> User | None:
    return db.query(User).filter(User.id == user_id).first()


def create_user(db: Session, user_data: UserCreate) -> User | None:
    """Buat user baru. Return None jika email sudah terdaftar."""
    if get_user_by_email(db, user_data.email):
        return None

    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
        department=user_data.department,
        position=user_data.position,
        phone=user_data.phone,
        leave_quota=user_data.leave_quota,
        work_start_date=user_data.work_start_date,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> User | None:
    """Verifikasi email & password. Return user jika valid."""
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.hashed_password):
        return None
    if not user.is_active:
        return None
    return user


def update_user(db: Session, user_id: int, user_data: UserUpdate) -> User | None:
    """Update data user. Hanya field yang dikirim yang diupdate."""
    user = get_user_by_id(db, user_id)
    if not user:
        return None

    update_fields = user_data.model_dump(exclude_unset=True)
    for field, value in update_fields.items():
        setattr(user, field, value)

    db.commit()
    db.refresh(user)
    return user


def get_all_users(
    db: Session,
    role: str | None = None,
    skip: int = 0,
    limit: int = 50,
) -> dict:
    """Ambil semua user dengan filter role opsional."""
    query = db.query(User)
    if role:
        try:
            query = query.filter(User.role == UserRole(role))
        except ValueError:
            pass
    total = query.count()
    users = query.offset(skip).limit(limit).all()
    return {"total": total, "users": users}