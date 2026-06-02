from sqlalchemy.orm import Session
from typing import Optional
import math

from app.models.customer import Customer
from app.schemas.customer import CustomerCreate, CustomerListResponse
from app.core.exceptions import NotFoundException, ConflictException
from app.core.logging import get_logger

logger = get_logger(__name__)


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise NotFoundException("Customer", customer_id)
    return customer


def get_customers(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
) -> CustomerListResponse:
    query = db.query(Customer)

    if search:
        search_term = f"%{search.strip()}%"
        from sqlalchemy import or_
        query = query.filter(
            or_(
                Customer.full_name.ilike(search_term),
                Customer.email.ilike(search_term),
            )
        )

    query = query.order_by(Customer.created_at.desc())
    total = query.count()
    total_pages = math.ceil(total / per_page) if per_page > 0 else 1
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return CustomerListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    existing = db.query(Customer).filter(
        Customer.email == payload.email.lower()
    ).first()
    if existing:
        raise ConflictException(f"A customer with email '{payload.email}' already exists.")

    customer = Customer(
        full_name=payload.full_name,
        email=payload.email.lower(),
        phone=payload.phone,
    )
    db.add(customer)
    db.commit()
    db.refresh(customer)
    logger.info("Customer created", customer_id=customer.id, email=customer.email)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()
    logger.info("Customer deleted", customer_id=customer_id)
