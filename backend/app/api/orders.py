from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderListResponse
from app.services import order_service

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=OrderListResponse, summary="List all orders")
def list_orders(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    customer_id: Optional[int] = Query(None, description="Filter by customer ID"),
    db: Session = Depends(get_db),
):
    return order_service.get_orders(db=db, page=page, per_page=per_page, customer_id=customer_id)


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED, summary="Create an order")
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return order_service.create_order(db, payload)


@router.get("/{order_id}", response_model=OrderResponse, summary="Get an order by ID")
def get_order(order_id: int, db: Session = Depends(get_db)):
    return order_service.get_order(db, order_id)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete an order")
def delete_order(order_id: int, db: Session = Depends(get_db)):
    order_service.delete_order(db, order_id)
