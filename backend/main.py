from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

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

# Konfigurasi CORS agar bisa diakses oleh Frontend nantinya
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
    """Endpoint untuk mengecek apakah API berjalan."""
    return {"status": "healthy", "version": "0.2.0"}


# ==================== CRUD ENDPOINTS ====================

@app.post("/items", response_model=ItemResponse, status_code=201)
def create_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Buat item baru dengan status code 201."""
    return crud.create_item(db=db, item_data=item)


@app.get("/items", response_model=ItemListResponse)
def list_items(
    skip: int = Query(0, ge=0, description="Jumlah data yang di-skip"),
    limit: int = Query(20, ge=1, le=100, description="Jumlah data per halaman"),
    search: str = Query(None, description="Cari berdasarkan nama/deskripsi"),
    db: Session = Depends(get_db),
):
    """Ambil daftar items dengan fitur pagination dan search."""
    return crud.get_items(db=db, skip=skip, limit=limit, search=search)


# TUGAS LEAD BACKEND: Endpoint statis harus di atas endpoint parameter {item_id}
@app.get("/items/stats")
def get_items_stats(db: Session = Depends(get_db)):
    """
    Menghitung statistik inventaris kelompok cc-kelompok-taskete_7:
    - Total items
    - Total value (Sum of price * quantity)
    - Item termahal & termurah
    """
    items = db.query(crud.Item).all()
    
    if not items:
        return {
            "total_items": 0, 
            "total_value": 0, 
            "most_expensive": None, 
            "cheapest": None
        }
    
    # Hitung total nilai ekonomi inventaris
    total_value = sum(item.price * item.quantity for item in items)
    
    # Cari item termahal dan termurah berdasarkan harga
    most_expensive_item = max(items, key=lambda x: x.price)
    cheapest_item = min(items, key=lambda x: x.price)
    
    return {
        "total_items": len(items),
        "total_value": total_value,
        "most_expensive": {
            "name": most_expensive_item.name, 
            "price": most_expensive_item.price
        },
        "cheapest": {
            "name": cheapest_item.name,
            "price": cheapest_item.price
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
    """Update item (Partial Update)."""
    updated = crud.update_item(db=db, item_id=item_id, item_data=item)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Item dengan id={item_id} tidak ditemukan")
    return updated


@app.delete("/items/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    """Hapus item berdasarkan ID."""
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