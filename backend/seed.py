"""
Seed script - populate the database with sample data.
Usage: python seed.py
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from decimal import Decimal
from app.database.session import SessionLocal
from app.models.product import Product
from app.models.customer import Customer
from app.models.order import Order, OrderItem


def seed():
    db = SessionLocal()
    try:
        existing_products = db.query(Product).count()
        if existing_products > 0:
            print("Database already seeded. Skipping.")
            return

        print("Seeding products...")
        products = [
            Product(name="Laptop Pro 15", sku="LAPRO15", price=Decimal("1299.99"), stock_quantity=50),
            Product(name="Wireless Mouse", sku="WMOUSE01", price=Decimal("29.99"), stock_quantity=200),
            Product(name="Mechanical Keyboard", sku="MKEYB01", price=Decimal("89.99"), stock_quantity=75),
            Product(name="4K Monitor 27\"", sku="MON27K4", price=Decimal("499.99"), stock_quantity=30),
            Product(name="USB-C Hub", sku="USBCHUB", price=Decimal("49.99"), stock_quantity=4),
            Product(name="Webcam HD 1080p", sku="WEBCAM1080", price=Decimal("79.99"), stock_quantity=3),
            Product(name="Noise Cancelling Headphones", sku="NCHP001", price=Decimal("249.99"), stock_quantity=40),
            Product(name="External SSD 1TB", sku="ESSD1TB", price=Decimal("109.99"), stock_quantity=5),
            Product(name="Laptop Stand", sku="LAPTST01", price=Decimal("39.99"), stock_quantity=100),
            Product(name="Cable Management Kit", sku="CBLMGMT", price=Decimal("19.99"), stock_quantity=2),
        ]
        db.add_all(products)
        db.flush()

        print("Seeding customers...")
        customers = [
            Customer(full_name="Alice Johnson", email="alice@example.com", phone="+1-555-0101"),
            Customer(full_name="Bob Smith", email="bob@example.com", phone="+1-555-0102"),
            Customer(full_name="Carol White", email="carol@example.com", phone="+1-555-0103"),
            Customer(full_name="David Brown", email="david@example.com", phone="+1-555-0104"),
            Customer(full_name="Eva Martinez", email="eva@example.com", phone="+1-555-0105"),
        ]
        db.add_all(customers)
        db.flush()

        print("Seeding orders...")
        order1 = Order(
            customer_id=customers[0].id,
            total_amount=Decimal("1329.98"),
            items=[
                OrderItem(product_id=products[0].id, quantity=1, unit_price=Decimal("1299.99")),
                OrderItem(product_id=products[1].id, quantity=1, unit_price=Decimal("29.99")),
            ],
        )
        products[0].stock_quantity -= 1
        products[1].stock_quantity -= 1

        order2 = Order(
            customer_id=customers[1].id,
            total_amount=Decimal("589.98"),
            items=[
                OrderItem(product_id=products[3].id, quantity=1, unit_price=Decimal("499.99")),
                OrderItem(product_id=products[2].id, quantity=1, unit_price=Decimal("89.99")),
            ],
        )
        products[3].stock_quantity -= 1
        products[2].stock_quantity -= 1

        db.add_all([order1, order2])
        db.commit()

        print("✅ Database seeded successfully!")
        print(f"   - {len(products)} products")
        print(f"   - {len(customers)} customers")
        print(f"   - 2 orders")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
