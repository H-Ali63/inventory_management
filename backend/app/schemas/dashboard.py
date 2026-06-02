from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class LowStockProduct(BaseModel):
    id: int
    name: str
    sku: str
    stock_quantity: int
    price: Decimal


class DashboardResponse(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: Decimal
    low_stock_products: list[LowStockProduct]
    low_stock_threshold: int
