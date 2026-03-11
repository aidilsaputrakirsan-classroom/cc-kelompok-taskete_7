from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import engine, get_db
from models import Base
from schemas import ItemCreate, ItemUpdate, ItemResponse, ItemListResponse
import crud

# Buat semua tabel di database (jika belum ada)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Cloud App API",
    description="REST API untuk mata kuliah Komputasi Awan — SI ITK",
    version="0.2.0",
)

# Konfigurasi CORS agar bisa diakses oleh Frontend React (localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==================== ROOT & HEALTH CHECK ====================

@app.get("/")
def root():
    """Root endpoint."""
    return {
        "message": "Welcome to Cloud App API",
        "status": "running",
        "version": "0.2.0",
        "docs": "/docs",
    }


@app.get("/health")
def health_check():
    """Endpoint untuk mengecek status API yang digunakan di Header Frontend"""
    return {"status": "healthy", "version": "0.2.0"}


# ==================== CRUD ENDPOINTS ====================

@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Buat item baru"""
    return crud.create_item(db=db, item_data=item)


@app.get("/items", response_model=ItemListResponse)
def list_items(
    skip: int = Query(0, ge=0, description="Jumlah data yang di-skip"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    search: str = Query(None, description="Cari berdasarkan nama/deskripsi"),
    db: Session = Depends(get_db),
):
    """Ambil daftar items dengan fitur pagination (skip & limit) dan search"""
    return crud.get_items(db=db, skip=skip, limit=limit, search=search)


# TUGAS LEAD BACKEND: Endpoint statis digabung dan diletakkan di atas {item_id}
@app.get("/items/stats")
def get_items_stats(db: Session = Depends(get_db)):
    """
    Menghitung statistik lengkap untuk dashboard:
    - Menggunakan agregasi SQL (func) agar lebih ringan daripada menarik semua data ke memori.
    """
    total_count = db.query(crud.Item).count()
    
    if total_count == 0:
        return {
            "total_count": 0,
            "total_stock": 0,
            "total_value": 0,
            "average_price": 0,
            "most_expensive": None,
            "cheapest": None
        }

    # Menghitung agregat menggunakan fungsi database
    total_stock = db.query(func.sum(crud.Item.quantity)).scalar() or 0
    total_value = db.query(func.sum(crud.Item.price * crud.Item.quantity)).scalar() or 0
    avg_price = db.query(func.avg(crud.Item.price)).scalar() or 0
    
    # Mencari item termahal dan termurah dengan ordering
    most_expensive = db.query(crud.Item).order_by(crud.Item.price.desc()).first()
    cheapest = db.query(crud.Item).order_by(crud.Item.price.asc()).first()
    
    return {
        "total_count": total_count,
        "total_stock": int(total_stock),
        "total_value": float(total_value),
        "average_price": round(float(avg_price), 2),
        "most_expensive": {
            "name": most_expensive.name, 
            "price": most_expensive.price
        },
        "cheapest": {
            "name": cheapest.name,
            "price": cheapest.price
        },
    }


@app.get("/items/{item_id}", response_model=ItemResponse)
def get_item(item_id: int, db: Session = Depends(get_db)):
    """Ambil satu item berdasarkan ID."""
    item = crud.get_item(db=db, item_id=item_id)
    if not item:
        raise HTTPException(status_code=404, detail=f"Item dengan id={item_id} tidak ditemukan")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
def update_item(item_id: int, item: ItemUpdate, db: Session = Depends(get_db)):
    """Update item (Partial Update)"""
    updated = crud.update_item(db=db, item_id=item_id, item_data=item)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Item dengan id={item_id} tidak ditemukan")
    return updated


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Hapus item berdasarkan ID"""
    success = crud.delete_item(db=db, item_id=item_id)
    if not success:
        raise HTTPException(status_code=404, detail=f"Item dengan id={item_id} tidak ditemukan")
    return None


# ==================== TEAM INFO ====================

@app.get("/team")
def team_info():
    """Informasi identitas tim cc-kelompok-taskete_7."""
    return {
        "team": "cc-kelompok-taskete_7",
        "members": [
            {"name": "Noviansyah", "nim": "10231072", "role": "Lead Backend"},
            {"name": "Irwan Maulana", "nim": "10231046", "role": "Lead Frontend"},
            {"name": "Rayhan Iqbal", "nim": "10231080", "role": "Lead DevOps"},
            {"name": "Amalia Tiara Rezfani", "nim": "10231012", "role": "Lead QA & Docs"},
        ],
    }