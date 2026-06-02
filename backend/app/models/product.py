from sqlalchemy import Column, Integer, String, Numeric, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    order_items = relationship(
        "OrderItem", back_populates="product", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index("ix_products_name", "name"),
        Index("ix_products_sku", "sku", unique=True),
    )

    def __repr__(self):
        return f"<Product id={self.id} name={self.name} sku={self.sku}>"
