import os
from datetime import datetime

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User, UserRole
from schemas import UserCreate, UserUpdate, UserResponse, UserListResponse, TokenResponse
from auth import create_access_token, get_current_user
import crud

load_dotenv()

# Buat tabel di database secara otomatis saat startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="SIMCUTI API",
    description=(
        "REST API untuk Sistem Informasi Manajemen Cuti (SIMCUTI). "
        "Tahap 1: Modul Karyawan — Auth & Profil."
    ),
    version="1.0.0",
)

# ==================== CORS ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [o.strip() for o in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== DEPENDENCY ====================

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != UserRole.admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Hanya Admin yang dapat mengakses endpoint ini.",
        )
    return current_user


# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["System"], summary="Cek status API")
def health_check():
    return {
        "status": "healthy",
        "service": "SIMCUTI API",
        "version": "1.0.0",
        "tahap": "1 — Modul Karyawan",
        "timestamp": datetime.now().isoformat(),
    }


@app.get("/team", tags=["System"], summary="Informasi tim pengembang")
def team_info():
    return {
        "team": "cc-kelompok-taskete_7",
        "members": [
            {"name": "Noviansyah", "nim": "10231072", "role": "Lead Backend"},
            {"name": "Irwan Maulana", "nim": "10231046", "role": "Lead Frontend"},
            {"name": "Rayhan Iqbal", "nim": "10231080", "role": "Lead DevOps"},
            {"name": "Amalia Tiara Rezfani", "nim": "10231012", "role": "Lead QA & Docs"},
        ],
    }


# ==================== AUTH ====================

@app.post(
    "/auth/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["Auth"],
    summary="Daftar akun baru (Karyawan atau Admin)",
)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email sudah terdaftar.",
        )
    return UserResponse.from_orm_with_remaining(user)


@app.post(
    "/auth/login",
    response_model=TokenResponse,
    tags=["Auth"],
    summary="Login dan dapatkan JWT token",
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email atau password salah.",
        )
    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserResponse.from_orm_with_remaining(user),
    }


@app.get(
    "/auth/me",
    response_model=UserResponse,
    tags=["Auth"],
    summary="Lihat profil saya",
)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.from_orm_with_remaining(current_user)


@app.put(
    "/auth/me",
    response_model=UserResponse,
    tags=["Auth"],
    summary="Update profil saya",
)
def update_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    updated = crud.update_user(db=db, user_id=current_user.id, user_data=user_data)
    return UserResponse.from_orm_with_remaining(updated)


# ==================== ADMIN — USERS ====================

@app.get(
    "/users",
    response_model=UserListResponse,
    tags=["Admin — Users"],
    summary="[Admin] Daftar semua user",
)
def list_users(
    role: str | None = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = crud.get_all_users(db=db, role=role, skip=skip, limit=limit)
    result["users"] = [UserResponse.from_orm_with_remaining(u) for u in result["users"]]
    return result


@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    tags=["Admin — Users"],
    summary="[Admin] Detail user",
)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    user = crud.get_user_by_id(db=db, user_id=user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return UserResponse.from_orm_with_remaining(user)


@app.put(
    "/users/{user_id}",
    response_model=UserResponse,
    tags=["Admin — Users"],
    summary="[Admin] Update data user",
)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_admin),
):
    updated = crud.update_user(db=db, user_id=user_id, user_data=user_data)
    if not updated:
        raise HTTPException(status_code=404, detail="User tidak ditemukan.")
    return UserResponse.from_orm_with_remaining(updated)

# ==================== TEAM INFO ====================

@app.get("/team", tags=["System"])
def team_info():
    return {
        "team": "cc-kelompok-taskete_7",
        "members": [
            {"name": "Noviansyah", "nim": "10231072", "role": "Lead Backend"},
            {"name": "Irwan Maulana", "nim": "10231046", "role": "Lead Frontend"},
            {"name": "Rayhan Iqbal", "nim": "10231080", "role": "Lead DevOps"},
            {"name": "Amalia Tiara Rezfani", "nim": "10231012", "role": "Lead QA & Docs"},
        ],
    }