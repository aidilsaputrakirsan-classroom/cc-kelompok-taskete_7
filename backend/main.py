import os
from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm # Import baru
from sqlalchemy.orm import Session

from database import engine, get_db
from models import Base, User
from schemas import (
    ItemCreate, ItemUpdate, ItemResponse, ItemListResponse, ItemStatsResponse,
    UserCreate, UserResponse, TokenResponse, # LoginRequest dihapus dari sini jika hanya dipakai di login
)
from auth import create_access_token, get_current_user
import crud

load_dotenv()

# Inisialisasi Database
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud App API",
    description="REST API untuk mata kuliah Komputasi Awan — SI ITK. "
                "Implementasi Integrasi Full-Stack & JWT Auth.",
    version="0.4.2",
)

# ==================== CORS (FIXED) ====================
allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
origins_list = [origin.strip() for origin in allowed_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== HEALTH CHECK ====================

@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "version": "0.4.2"}


# ==================== AUTH ENDPOINTS (PUBLIC) ====================

@app.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED, tags=["Auth"])
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Registrasi user baru.
    """
    user = crud.create_user(db=db, user_data=user_data)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Pendaftaran gagal. Email mungkin sudah terdaftar."
        )
    return user


@app.post("/auth/login", response_model=TokenResponse, tags=["Auth"])
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Login menggunakan OAuth2 Form Data (Kompatibel dengan tombol Authorize Swagger).
    
    - **username**: Masukkan email mahasiswa Anda.
    - **password**: Masukkan password Anda.
    """
    # OAuth2RequestForm menggunakan field 'username' untuk identitas
    user = crud.authenticate_user(db=db, email=form_data.username, password=form_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Email atau password salah."
        )

    token = create_access_token(data={"sub": str(user.id)})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
    }


@app.get("/auth/me", response_model=UserResponse, tags=["Auth"])
def get_me(current_user: User = Depends(get_current_user)):
    """Ambil profil user yang sedang login berdasarkan token."""
    return current_user


# ==================== ITEM ENDPOINTS (PROTECTED) ====================

@app.get("/items/stats", response_model=ItemStatsResponse, tags=["Items"])
def get_item_statistics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """**TUGAS 4: Get Statistics**"""
    try:
        return crud.get_item_stats(db=db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Gagal memuat statistik: {str(e)}"
        )


@app.post("/items", response_model=ItemResponse, status_code=status.HTTP_201_CREATED, tags=["Items"])
def create_item(
    item: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Buat item baru."""
    return crud.create_item(db=db, item_data=item)


@app.get("/items", response_model=ItemListResponse, tags=["Items"])
def list_items(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil daftar items."""
    return crud.get_items(db=db, skip=skip, limit=limit, search=search)


@app.get("/items/{item_id}", response_model=ItemResponse, tags=["Items"])
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ambil detail item."""
    item = crud.get_item(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item tidak ditemukan.")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse, tags=["Items"])
def update_item(
    item_id: int,
    item: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update data item."""
    updated = crud.update_item(db=db, item_id=item_id, item_data=item)
    if not updated:
        raise HTTPException(status_code=404, detail="Gagal update.")
    return updated


@app.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Items"])
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hapus item."""
    success = crud.delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Gagal menghapus.")
    return None


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