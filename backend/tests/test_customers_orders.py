import pytest


def _create_product(client, name="Product", sku="SKU001", price="10.00", stock=50):
    resp = client.post(
        "/api/v1/products",
        json={"name": name, "sku": sku, "price": price, "stock_quantity": stock},
    )
    return resp.json()


def _create_customer(client, name="Test User", email="test@example.com", phone="555-0000"):
    resp = client.post(
        "/api/v1/customers",
        json={"full_name": name, "email": email, "phone": phone},
    )
    return resp.json()


# ── Customer tests ────────────────────────────────────────────────────────────

def test_create_customer(client):
    resp = client.post(
        "/api/v1/customers",
        json={"full_name": "Jane Doe", "email": "jane@example.com", "phone": "555-1234"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["full_name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"


def test_create_customer_duplicate_email(client):
    _create_customer(client)
    resp = client.post(
        "/api/v1/customers",
        json={"full_name": "Another User", "email": "test@example.com"},
    )
    assert resp.status_code == 409


def test_create_customer_invalid_email(client):
    resp = client.post(
        "/api/v1/customers",
        json={"full_name": "Bad Email", "email": "not-an-email"},
    )
    assert resp.status_code == 422


def test_get_customers(client):
    _create_customer(client, email="a@example.com")
    _create_customer(client, email="b@example.com")
    resp = client.get("/api/v1/customers")
    assert resp.status_code == 200
    assert resp.json()["total"] == 2


def test_get_customer_by_id(client):
    customer = _create_customer(client, email="c@example.com")
    resp = client.get(f"/api/v1/customers/{customer['id']}")
    assert resp.status_code == 200
    assert resp.json()["id"] == customer["id"]


def test_get_customer_not_found(client):
    resp = client.get("/api/v1/customers/99999")
    assert resp.status_code == 404


def test_delete_customer(client):
    customer = _create_customer(client, email="del@example.com")
    resp = client.delete(f"/api/v1/customers/{customer['id']}")
    assert resp.status_code == 204


# ── Order tests ───────────────────────────────────────────────────────────────

def test_create_order(client):
    product = _create_product(client, stock=10)
    customer = _create_customer(client)
    resp = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert float(data["total_amount"]) == 20.00
    assert len(data["items"]) == 1

    # Verify stock was reduced
    p_resp = client.get(f"/api/v1/products/{product['id']}")
    assert p_resp.json()["stock_quantity"] == 8


def test_create_order_insufficient_stock(client):
    product = _create_product(client, sku="LOWSTK", stock=3)
    customer = _create_customer(client, email="ord2@example.com")
    resp = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 10}]},
    )
    assert resp.status_code == 422


def test_create_order_invalid_customer(client):
    product = _create_product(client, sku="PROD2", stock=10)
    resp = client.post(
        "/api/v1/orders",
        json={"customer_id": 99999, "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_create_order_invalid_product(client):
    customer = _create_customer(client, email="ord3@example.com")
    resp = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": 99999, "quantity": 1}]},
    )
    assert resp.status_code == 404


def test_create_order_empty_items(client):
    customer = _create_customer(client, email="ord4@example.com")
    resp = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": []},
    )
    assert resp.status_code == 422


def test_get_orders(client):
    product = _create_product(client, sku="ORD01", stock=50)
    customer = _create_customer(client, email="ord5@example.com")
    client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    resp = client.get("/api/v1/orders")
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_delete_order(client):
    product = _create_product(client, sku="ORD02", stock=10)
    customer = _create_customer(client, email="ord6@example.com")
    order_resp = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 1}]},
    )
    order_id = order_resp.json()["id"]
    resp = client.delete(f"/api/v1/orders/{order_id}")
    assert resp.status_code == 204


def test_dashboard(client):
    resp = client.get("/api/v1/dashboard")
    assert resp.status_code == 200
    data = resp.json()
    assert "total_products" in data
    assert "total_customers" in data
    assert "total_orders" in data
    assert "low_stock_products" in data
