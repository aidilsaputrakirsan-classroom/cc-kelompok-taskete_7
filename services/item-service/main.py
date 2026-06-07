"""
Item Service — Handles inventory management.
Berkomunikasi dengan Auth Service untuk verifikasi token.
"""
import os
import logging
from fastapi import FastAPI, Depends, HTTPException, Header, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text

from logging_config import setup_logging
from logging_middleware import RequestLoggingMiddleware
from metrics import metrics
from error_alerting import error_alerting
from database import engine, get_db, Base
from models import Item
from schemas import ItemCreate, ItemUpdate, ItemResponse, ItemListResponse, ItemStatsResponse
from auth_client import verify_token_with_auth_service, auth_circuit

# Setup structured logging
setup_logging()
logger = logging.getLogger(__name__)

# Create tables (skip dalam test environment)
if os.getenv("TESTING") != "true":
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Item Service",
    description="Inventory microservice — CRUD items with auth via Auth Service",
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


# =====================
# ENDPOINTS
# =====================

@app.get("/health")
def health_check():
    """
    Health check dengan aggregated dependency status.
    
    Returns:
    - status: healthy, degraded, atau unhealthy
    - dependencies:
        - auth-service: circuit breaker status
        - database: connection status
    """
    cb_status = auth_circuit.get_status()
    
    # Check database
    db_status = "connected"
    db_error = None
    try:
        db = next(get_db())
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        db_status = "disconnected"
        db_error = str(e)
        logger.error(f"Database check failed: {e}")
    
    # Determine overall health
    overall_status = "healthy"
    
    if cb_status["state"] != "CLOSED":
        overall_status = "degraded"
        logger.warning(
            f"Health check: auth-service circuit breaker is {cb_status['state']}"
        )
    
    if db_status != "connected":
        overall_status = "unhealthy"
        logger.error("Health check: database disconnected")
    
    return {
        "status": overall_status,
        "service": "item-service",
        "version": "2.1.0",
        "dependencies": {
            "auth-service": {
                "status": "available" if cb_status["state"] == "CLOSED" else "unavailable",
                "circuit_breaker": cb_status,
            },
            "database": {
                "status": db_status,
                "error": db_error,
            },
        },
    }


@app.get("/metrics")
def get_metrics():
    """Return application metrics."""
    return {
        "service": "item-service",
        **metrics.get_metrics(),
        "error_alerting": {
            "error_rate_percent": error_alerting.get_error_rate(),
            "alert_active": error_alerting.is_alert_active(),
        },
    }


@app.post("/items", response_model=ItemResponse, status_code=201)
async def create_item(
    item_data: ItemCreate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Buat item baru — requires authentication."""
    item = Item(
        **item_data.model_dump(),
        owner_id=user["user_id"],
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@app.get("/items", response_model=ItemListResponse)
async def get_items(
    search: str = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil daftar items milik user yang login."""
    query = db.query(Item).filter(Item.owner_id == user["user_id"])
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return ItemListResponse(total=total, items=items)


@app.get("/items/stats", response_model=ItemStatsResponse)
async def get_items_stats(
    db: Session = Depends(get_db),
    authorization: str | None = Header(default=None),
):
    """
    Ambil statistik items dengan GRACEFUL DEGRADATION.
    
    Full Mode (Auth OK):
    - Return stats untuk items milik user yang login
    
    Degraded Mode (Auth down atau tidak ada token):
    - Return aggregate stats untuk semua items (public view)
    """
    user = None
    
    # 🔄 Coba verifikasi token (optional)
    if authorization:
        try:
            # Import here to avoid circular imports
            from auth_client import _call_auth_service
            user = await _call_auth_service(authorization)
            logger.info(f"Stats requested by user {user.get('user_id')} (FULL MODE)")
        except HTTPException as e:
            # Auth failed — graceful degradation
            logger.warning(
                f"Auth failed for stats endpoint: {e.detail}. "
                f"Returning degraded response (aggregate stats)."
            )
            user = None
    
    if user:
        # 🟢 FULL MODE: Stats untuk user yang login
        query = db.query(Item).filter(Item.owner_id == user["user_id"])
    else:
        # 📉 DEGRADED MODE: Aggregate stats untuk semua items (public)
        query = db.query(Item)
        logger.info("Stats requested without auth (DEGRADED MODE)")
    
    # Total items
    total_items = query.count()
    
    # Total value (sum of price * quantity)
    all_items = query.all()
    total_value = sum(item.price * item.quantity for item in all_items)
    
    # Most expensive item
    most_expensive = query.order_by(Item.price.desc()).first()
    
    # Cheapest item
    cheapest = query.order_by(Item.price.asc()).first()
    
    return ItemStatsResponse(
        total_items=total_items,
        total_value=total_value,
        most_expensive=most_expensive,
        cheapest=cheapest,
    )


@app.get("/items/public", response_model=ItemListResponse)
async def get_public_items(
    search: str = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Ambil daftar items publik — TIDAK BUTUH AUTENTIKASI.
    
    Ini adalah bagian dari graceful degradation:
    - Saat Auth Service down, user tetap bisa melihat item publik
    - Dalam production, bisa ada flag 'is_public' di model Item
    
    Untuk sekarang, return semua items (simulate public items).
    """
    logger.info("Public items requested (no auth required)")
    
    query = db.query(Item)
    if search:
        query = query.filter(Item.name.ilike(f"%{search}%"))
    
    total = query.count()
    items = query.offset(skip).limit(limit).all()
    
    return ItemListResponse(total=total, items=items)


@app.get("/items/{item_id}", response_model=ItemResponse)
async def get_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Ambil item by ID."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item


@app.put("/items/{item_id}", response_model=ItemResponse)
async def update_item(
    item_id: int,
    update_data: ItemUpdate,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Update item."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@app.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: int,
    user: dict = Depends(verify_token_with_auth_service),
    db: Session = Depends(get_db),
):
    """Hapus item."""
    item = db.query(Item).filter(
        Item.id == item_id, Item.owner_id == user["user_id"]
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    db.delete(item)
    db.commit()