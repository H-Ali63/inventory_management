from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from typing import Optional

from app.database.session import get_db
from app.schemas.customer import CustomerCreate, CustomerResponse, CustomerListResponse
from app.services import customer_service

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.get("", response_model=CustomerListResponse, summary="List all customers")
def list_customers(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    search: Optional[str] = Query(None, description="Search by name or email"),
    db: Session = Depends(get_db),
):
    return customer_service.get_customers(db=db, page=page, per_page=per_page, search=search)


@router.post("", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED, summary="Create a customer")
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return customer_service.create_customer(db, payload)


@router.get("/{customer_id}", response_model=CustomerResponse, summary="Get a customer by ID")
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    return customer_service.get_customer(db, customer_id)


@router.delete("/{customer_id}", status_code=status.HTTP_204_NO_CONTENT, summary="Delete a customer")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    customer_service.delete_customer(db, customer_id)
