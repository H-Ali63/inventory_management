from sqlalchemy import Column, Integer, String, DateTime, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.session import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    orders = relationship("Order", back_populates="customer", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_customers_email", "email", unique=True),
        Index("ix_customers_full_name", "full_name"),
    )

    def __repr__(self):
        return f"<Customer id={self.id} email={self.email}>"
