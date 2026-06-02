from sqlalchemy.orm import Session, joinedload
from decimal import Decimal
import math

from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderListResponse, OrderResponse, OrderItemResponse
from app.core.exceptions import NotFoundException, InsufficientStockException, BadRequestException
from app.core.logging import get_logger

logger = get_logger(__name__)


def _build_order_response(order: Order) -> OrderResponse:
    items = [
        OrderItemResponse.from_orm_with_product(item) for item in order.items
    ]
    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        total_amount=order.total_amount,
        created_at=order.created_at,
        customer_name=order.customer.full_name if order.customer else None,
        items=items,
    )


def get_order(db: Session, order_id: int) -> OrderResponse:
    order = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .filter(Order.id == order_id)
        .first()
    )
    if not order:
        raise NotFoundException("Order", order_id)
    return _build_order_response(order)


def get_orders(
    db: Session,
    page: int = 1,
    per_page: int = 20,
    customer_id: int = None,
) -> OrderListResponse:
    query = (
        db.query(Order)
        .options(
            joinedload(Order.customer),
            joinedload(Order.items).joinedload(OrderItem.product),
        )
        .order_by(Order.created_at.desc())
    )

    if customer_id is not None:
        query = query.filter(Order.customer_id == customer_id)

    total = db.query(Order).filter(
        Order.customer_id == customer_id if customer_id else True
    ).count()

    total_pages = math.ceil(total / per_page) if per_page > 0 else 1
    offset = (page - 1) * per_page
    orders = query.offset(offset).limit(per_page).all()

    return OrderListResponse(
        items=[_build_order_response(o) for o in orders],
        total=total,
        page=page,
        per_page=per_page,
        total_pages=total_pages,
    )


def create_order(db: Session, payload: OrderCreate) -> OrderResponse:
    from app.models.customer import Customer

    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise NotFoundException("Customer", payload.customer_id)

    product_ids = [item.product_id for item in payload.items]
    if len(product_ids) != len(set(product_ids)):
        raise BadRequestException("Duplicate products in order. Combine quantities instead.")

    products = {
        p.id: p
        for p in db.query(Product).filter(Product.id.in_(product_ids)).with_for_update().all()
    }

    for item in payload.items:
        if item.product_id not in products:
            raise NotFoundException("Product", item.product_id)

    for item in payload.items:
        product = products[item.product_id]
        if product.stock_quantity < item.quantity:
            raise InsufficientStockException(product.name, product.stock_quantity, item.quantity)

    total_amount = Decimal("0.00")
    order_items_data = []

    for item in payload.items:
        product = products[item.product_id]
        unit_price = product.price
        total_amount += unit_price * item.quantity
        order_items_data.append(
            OrderItem(
                product_id=item.product_id,
                quantity=item.quantity,
                unit_price=unit_price,
            )
        )
        product.stock_quantity -= item.quantity

    order = Order(
        customer_id=payload.customer_id,
        total_amount=total_amount,
        items=order_items_data,
    )
    db.add(order)

    try:
        db.commit()
        db.refresh(order)
    except Exception as e:
        db.rollback()
        logger.error("Failed to create order, rolled back", error=str(e))
        raise

    logger.info("Order created", order_id=order.id, total=str(total_amount))

    return get_order(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise NotFoundException("Order", order_id)
    db.delete(order)
    db.commit()
    logger.info("Order deleted", order_id=order_id)


def get_order_history_by_customer(
    db: Session, customer_id: int, page: int = 1, per_page: int = 20
) -> OrderListResponse:
    from app.models.customer import Customer
    customer = db.query(Customer).filter(Customer.id == customer_id).first()
    if not customer:
        raise NotFoundException("Customer", customer_id)
    return get_orders(db, page=page, per_page=per_page, customer_id=customer_id)
