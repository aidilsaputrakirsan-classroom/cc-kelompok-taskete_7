"""
SIMCUTI — Authentication & Authorization Module
JWT token generation, verification, password hashing, RBAC dependency.
"""
import os
from datetime import datetime, timedelta, timezone

<<<<<<< HEAD
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import bcrypt
=======
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
from sqlalchemy.orm import Session

from database import get_db
from models import User

# ===================== KONFIGURASI =====================
SECRET_KEY = os.getenv("SECRET_KEY", "simcuti-super-secret-key-ganti-di-production-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "720"))  # 12 jam

<<<<<<< HEAD
# pwd_context diganti dengan direct bcrypt call karena isu kompatibilitas alpine/slim
# bcrypt secara internal menangani salt & rounds
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


# ===================== PASSWORD UTILS =====================

def hash_password(password: str) -> str:
    """Hash password dengan bcrypt secara langsung."""
    pwd_bytes = password.encode('utf-8')
    # Generate salt dan hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifikasi password plain vs hash menggunakan bcrypt."""
    try:
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)
    except Exception:
        return False


# ===================== JWT UTILS =====================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Buat JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (
        expires_delta if expires_delta else timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
=======
SECRET_KEY = os.getenv("SECRET_KEY", "simcuti-secret-key-minimum-32-chars")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(data: dict) -> str:
    """Buat JWT access token."""
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


<<<<<<< HEAD
def decode_token(token: str) -> dict:
    """Decode dan validasi JWT token. Raise HTTPException jika tidak valid."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid atau sudah kadaluarsa.",
            headers={"WWW-Authenticate": "Bearer"},
        )


# ===================== FASTAPI DEPENDENCIES =====================

=======
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
<<<<<<< HEAD
    """
    Dependency: Ambil current user dari JWT token.
    Digunakan di endpoint yang membutuhkan autentikasi.
    """
    payload = decode_token(token)
    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token tidak valid.",
        )

    user = db.query(User).filter(User.id == int(user_id)).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User tidak ditemukan atau tidak aktif.",
        )
    return user


def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency: Pastikan user yang login adalah Admin.
    Gunakan di endpoint khusus Admin.
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Hanya Admin yang dapat mengakses endpoint ini.",
        )
    return current_user


def require_karyawan(current_user: User = Depends(get_current_user)) -> User:
    """
    Dependency: Pastikan user yang login adalah Karyawan.
    """
    if current_user.role != "karyawan":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Endpoint ini khusus untuk Karyawan.",
        )
    return current_user
=======
    """Verifikasi JWT token dan kembalikan user yang sedang login."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token tidak valid atau sudah kadaluarsa.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id), User.is_active == True).first()
    if user is None:
        raise credentials_exception
    return user
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
