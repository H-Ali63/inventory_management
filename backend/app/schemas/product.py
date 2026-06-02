from pydantic import BaseModel, field_validator, ConfigDict
from decimal import Decimal
from datetime import datetime
from typing import Optional


class ProductBase(BaseModel):
    name: str
    sku: str
    price: Decimal
    stock_quantity: int

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: Decimal) -> Decimal:
        if v <= 0:
            raise ValueError("Price must be greater than zero.")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def stock_cannot_be_negative(cls, v: int) -> int:
        if v < 0:
            raise ValueError("Stock quantity cannot be negative.")
        return v

    @field_validator("name")
    @classmethod
    def name_must_not_be_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Product name cannot be empty.")
        return v

    @field_validator("sku")
    @classmethod
    def sku_must_not_be_empty(cls, v: str) -> str:
        v = v.strip().upper()
        if not v:
            raise ValueError("SKU cannot be empty.")
        return v


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    price: Optional[Decimal] = None
    stock_quantity: Optional[int] = None

    @field_validator("price")
    @classmethod
    def price_must_be_positive(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        if v is not None and v <= 0:
            raise ValueError("Price must be greater than zero.")
        return v

    @field_validator("stock_quantity")
    @classmethod
    def stock_cannot_be_negative(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v < 0:
            raise ValueError("Stock quantity cannot be negative.")
        return v

    @field_validator("sku")
    @classmethod
    def sku_uppercase(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
        return v


class ProductResponse(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductResponse]
    total: int
    page: int
    per_page: int
    total_pages: int
