import re
from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional
from datetime import datetime

# ==================== ITEM SCHEMAS ====================

class ItemBase(BaseModel):
    """Base schema — field yang dipakai untuk create & update."""
    name: str = Field(..., min_length=1, max_length=100, examples=["Laptop"])
    description: Optional[str] = Field(None, examples=["Laptop untuk cloud computing"])
    price: float = Field(..., gt=0, examples=[15000000])
    quantity: int = Field(0, ge=0, examples=[10])


class ItemCreate(ItemBase):
    """Schema untuk membuat item baru."""
    pass


class ItemUpdate(BaseModel):
    """Schema untuk update item (semua field optional)."""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity: Optional[int] = Field(None, ge=0)


class ItemResponse(ItemBase):
    """Schema untuk response item dari database."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ItemListResponse(BaseModel):
    """Schema untuk response list items dengan metadata."""
    total: int
    items: list[ItemResponse]


class ItemStatsResponse(BaseModel):
    """
    TUGAS 4: Schema untuk endpoint statistik.
    Memberikan informasi ringkas mengenai inventaris.
    """
    total_items: int
    total_stock: int
    average_price: float


# ==================== USER / AUTH SCHEMAS ====================

class UserCreate(BaseModel):
    """
    TUGAS 4: Schema registrasi dengan validasi format & keamanan.
    """
    email: EmailStr = Field(..., examples=["nama@student.itk.ac.id"])
    name: str = Field(..., min_length=2, max_length=100, examples=["John Doe"])
    password: str = Field(..., min_length=8, examples=["StrongPass123!"])

    @field_validator("email")
    @classmethod
    def validate_itk_email(cls, v: str) -> str:
        """Validasi format email khusus domain ITK."""
        if not v.endswith("@student.itk.ac.id"):
            raise ValueError("Email harus menggunakan domain resmi @student.itk.ac.id")
        return v

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        """Validasi kekuatan password menggunakan Regex."""
        # Pola: Min 8 karakter, 1 Huruf Besar, 1 Huruf Kecil, 1 Angka, 1 Simbol
        pattern = r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
        if not re.match(pattern, v):
            raise ValueError(
                "Password terlalu lemah! Gunakan minimal 8 karakter dengan kombinasi "
                "huruf besar, huruf kecil, angka, dan simbol (@$!%*?&)."
            )
        return v


class UserResponse(BaseModel):
    """Schema untuk profil user (tanpa password)."""
    id: int
    email: str
    name: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    """Schema untuk permintaan login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """Schema untuk response setelah login berhasil."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse