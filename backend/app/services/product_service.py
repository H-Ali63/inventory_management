from sqlalchemy.orm import Session
from sqlalchemy import or_, func, asc, desc
from typing import Optional
from decimal import Decimal
import math

from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductListResponse, ProductResponse
from app.core.exceptions import NotFoundException, ConflictException
from app.core.logging import get_logger

logger = get_logger(__name__)

LOW_STOCK_THRESHOLD = 5


def get_product(db: Session, product_id: int) -> Product:
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise NotFoundException("Product", product_id)
    return product


def get_products(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    min_price: Optional[Decimal] = None,
    max_price: Optional[Decimal] = None,
    in_stock_only: bool = False,
) -> ProductListResponse:
    query = db.query(Product)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Product.name.ilike(search_term),
                Product.sku.ilike(search_term),
            )
        )

    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if in_stock_only:
        query = query.filter(Product.stock_quantity > 0)

    allowed_sort_fields = {"id", "name", "sku", "price", "stock_quantity", "created_at", "updated_at"}
    if sort_by not in allowed_sort_fields:
        sort_by = "created_at"

    sort_col = getattr(Product, sort_by)
    if sort_order.lower() == "asc":
        query = query.order_by(asc(sort_col))
    else:
        query = query.order_by(desc(sort_col))

    total = query.count()
    total_pages = math.ceil(total / per_page) if per_page > 0 else 1
    offset = (page - 1) * per_page
    items = query.offset(offset).limit(per_page).all()

    return ProductListResponse(
        items=items,
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def create_product(db: Session, payload: ProductCreate) -> Product:
    existing = db.query(Product).filter(Product.sku == payload.sku.upper()).first()
    if existing:
        raise ConflictException(f"A product with SKU '{payload.sku}' already exists.")

    product = Product(
        name=payload.name,
        sku=payload.sku.upper(),
        price=payload.price,
        stock_quantity=payload.stock_quantity,
    )
    db.add(product)
    db.commit()
    db.refresh(product)
    logger.info("Product created", product_id=product.id, sku=product.sku)
    return product


def update_product(db: Session, product_id: int, payload: ProductUpdate) -> Product:
    product = get_product(db, product_id)

    if payload.sku is not None and payload.sku.upper() != product.sku:
        existing = db.query(Product).filter(Product.sku == payload.sku.upper()).first()
        if existing:
            raise ConflictException(f"A product with SKU '{payload.sku}' already exists.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if field == "sku" and value is not None:
            value = value.upper()
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    logger.info("Product updated", product_id=product_id)
    return product


def delete_product(db: Session, product_id: int) -> None:
    product = get_product(db, product_id)
    db.delete(product)
    db.commit()
    logger.info("Product deleted", product_id=product_id)


def get_low_stock_products(db: Session, threshold: int = LOW_STOCK_THRESHOLD) -> list[Product]:
    return (
        db.query(Product)
        .filter(Product.stock_quantity <= threshold)
        .order_by(Product.stock_quantity.asc())
        .all()
    )
