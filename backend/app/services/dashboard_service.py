from sqlalchemy.orm import Session
from sqlalchemy import func
from decimal import Decimal

from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order
from app.schemas.dashboard import DashboardResponse, LowStockProduct

LOW_STOCK_THRESHOLD = 5


def get_dashboard_data(db: Session) -> DashboardResponse:
    total_products = db.query(func.count(Product.id)).scalar() or 0
    total_customers = db.query(func.count(Customer.id)).scalar() or 0
    total_orders = db.query(func.count(Order.id)).scalar() or 0
    total_revenue = db.query(func.sum(Order.total_amount)).scalar() or Decimal("0.00")

    low_stock = (
        db.query(Product)
        .filter(Product.stock_quantity <= LOW_STOCK_THRESHOLD)
        .order_by(Product.stock_quantity.asc())
        .all()
    )

    low_stock_items = [
        LowStockProduct(
            id=p.id,
            name=p.name,
            sku=p.sku,
            stock_quantity=p.stock_quantity,
            price=p.price,
        )
        for p in low_stock
    ]

    return DashboardResponse(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        total_revenue=total_revenue,
        low_stock_products=low_stock_items,
        low_stock_threshold=LOW_STOCK_THRESHOLD,
    )
