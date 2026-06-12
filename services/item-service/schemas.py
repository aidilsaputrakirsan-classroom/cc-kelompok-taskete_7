"""Pydantic schemas for Item Service with strict validation."""
from pydantic import BaseModel, field_validator
from typing import Optional


class ItemCreate(BaseModel):
    """Schema untuk create item baru dengan validasi ketat."""
    name: str
    description: Optional[str] = ""
    price: float
    quantity: Optional[int] = 0

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        """Validasi nama item: 1-300 karakter, tidak boleh kosong."""
        v = v.strip() if v else v
        if not v or len(v) < 1:
            raise ValueError("Nama item tidak boleh kosong")
        if len(v) > 300:
            raise ValueError("Nama item maksimal 300 karakter")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        """Validasi deskripsi: maksimal 2000 karakter."""
        if v and len(v) > 2000:
            raise ValueError("Deskripsi maksimal 2000 karakter")
        return v or ""

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        """Validasi harga: tidak boleh negatif, maksimal 999.999.999."""
        if v < 0:
            raise ValueError("Harga tidak boleh negatif")
        if v > 999_999_999:
            raise ValueError("Harga terlalu besar (max 999.999.999)")
        return round(v, 2)

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        """Validasi quantity: tidak boleh negatif, maksimal 999.999."""
        if v is not None and v < 0:
            raise ValueError("Quantity tidak boleh negatif")
        if v is not None and v > 999_999:
            raise ValueError("Quantity terlalu besar (max 999.999)")
        return v if v is not None else 0


class ItemUpdate(BaseModel):
    """Schema untuk update item dengan validasi ketat."""
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = None
    quantity: Optional[int] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v):
        """Validasi nama item: 1-300 karakter, tidak boleh kosong."""
        if v is None:
            return v
        v = v.strip() if v else v
        if not v or len(v) < 1:
            raise ValueError("Nama item tidak boleh kosong")
        if len(v) > 300:
            raise ValueError("Nama item maksimal 300 karakter")
        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v):
        """Validasi deskripsi: maksimal 2000 karakter."""
        if v is None:
            return v
        if len(v) > 2000:
            raise ValueError("Deskripsi maksimal 2000 karakter")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v):
        """Validasi harga: tidak boleh negatif, maksimal 999.999.999."""
        if v is None:
            return v
        if v < 0:
            raise ValueError("Harga tidak boleh negatif")
        if v > 999_999_999:
            raise ValueError("Harga terlalu besar (max 999.999.999)")
        return round(v, 2)

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v):
        """Validasi quantity: tidak boleh negatif, maksimal 999.999."""
        if v is None:
            return v
        if v < 0:
            raise ValueError("Quantity tidak boleh negatif")
        if v > 999_999:
            raise ValueError("Quantity terlalu besar (max 999.999)")
        return v


class ItemResponse(BaseModel):
    id: int
    name: str
    description: str
    price: float
    quantity: int
    owner_id: int

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    total: int
    items: list[ItemResponse]


class ItemStatsResponse(BaseModel):
    total_items: int
    total_value: float
    most_expensive: Optional[ItemResponse] = None
    cheapest: Optional[ItemResponse] = None