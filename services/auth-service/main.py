"""
Auth Service — Handles authentication and user management.
Microservice yang bertanggung jawab untuk:
- User registration
- User login (JWT token generation)
- Token verification (dipanggil oleh service lain)
"""
import os
import logging
from datetime import datetime, timedelta, timezone
from fastapi import FastAPI, Depends, HTTPException, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from passlib.context import CryptContext
import jwt

from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics
from error_alerting import error_alerting
from database import engine, get_db, Base
from models import User
from schemas import (
    UserCreate, UserResponse, LoginRequest,
    TokenResponse, TokenVerifyResponse
)

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Auth Service",
    description="Authentication microservice — register, login, verify tokens",
    version="2.0.0",
)

# CORS
CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging middleware (dengan correlation ID dan metrics)
app.add_middleware(RequestLoggingMiddleware)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT config
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY:
    raise ValueError(
        "❌ FATAL: SECRET_KEY not set in environment variables. "
        "Set SECRET_KEY env var with a random string (min 32 chars)"
    )
ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = int(os.getenv("TOKEN_EXPIRE_MINUTES", "30"))


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "auth-service",
        "version": "2.0.0",
    }


@app.get("/metrics")
def get_metrics():
    """Return application metrics."""
    return {
        "service": "auth-service",
        **metrics.get_metrics(),
        "error_alerting": {
            "error_rate_percent": error_alerting.get_error_rate(),
            "alert_active": error_alerting.is_alert_active(),
        },
    }


@app.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register user baru.
    
    Validasi:
    - Email harus unik dan format valid (EmailStr)
    - Password: min 8 chars, 1 uppercase, 1 digit, max 128 chars
    - Name: 2-200 karakter
    
    Args:
        user_data: Data register (email, password, name)
        db: Database session
    
    Returns:
        UserResponse dengan data user yang terbuat
        
    Raises:
        400: Email sudah terdaftar atau validasi gagal
        422: Validation error dari Pydantic
    """
    # Check duplicate email
    existing = db.query(User).filter(User.email == user_data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=user_data.email,
        name=user_data.name,
        hashed_password=pwd_context.hash(user_data.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post("/login", response_model=TokenResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """
    Login dan dapatkan JWT token.
    
    Process:
    1. Cari user by email
    2. Verify password dengan bcrypt
    3. Generate JWT token (expire dalam TOKEN_EXPIRE_MINUTES)
    
    Args:
        login_data: Email dan password
        db: Database session
    
    Returns:
        TokenResponse dengan access_token (JWT) dan token_type
        
    Raises:
        401: Email tidak ditemukan atau password salah
        
    Note:
        Token berlaku selama TOKEN_EXPIRE_MINUTES. Setelah expired, user harus login lagi.
    """
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not pwd_context.verify(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({
        "sub": str(user.id),
        "email": user.email,
        "name": user.name,
    })
    return TokenResponse(access_token=token)


@app.get("/verify", response_model=TokenVerifyResponse)
def verify_token(authorization: str = Header(...)):
    """
    Verifikasi JWT token — dipanggil oleh service lain (inter-service).
    
    INTERNAL ENDPOINT: Tidak boleh diakses oleh frontend, hanya oleh services lain.
    
    Request format:
        Header: Authorization: Bearer <access_token>
    
    Process:
    1. Extract token dari header
    2. Decode JWT (check signature dan expiry)
    3. Return user info (user_id, email, name)
    
    Args:
        authorization: Authorization header dalam format "Bearer <token>"
    
    Returns:
        TokenVerifyResponse dengan user_id, email, name
        
    Raises:
        401: Token invalid, expired, atau format header salah
    
    Note:
        Dipanggil oleh Item Service untuk verifikasi sebelum CRUD operations.
        Circuit Breaker di Item Service menangani jika Auth Service down.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split("Bearer ")[1]
    payload = decode_token(token)

    return TokenVerifyResponse(
        user_id=int(payload["sub"]),
        email=payload.get("email", ""),
        name=payload.get("name", ""),
    )