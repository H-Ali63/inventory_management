import pytest


def test_health_check(client):
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"


def test_create_product(client):
    payload = {"name": "Test Product", "sku": "TEST001", "price": "9.99", "stock_quantity": 10}
    resp = client.post("/api/v1/products", json=payload)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Test Product"
    assert data["sku"] == "TEST001"
    assert float(data["price"]) == 9.99
    assert data["stock_quantity"] == 10
    assert "id" in data


def test_create_product_duplicate_sku(client):
    payload = {"name": "Product A", "sku": "DUPSKU", "price": "10.00", "stock_quantity": 5}
    client.post("/api/v1/products", json=payload)
    resp = client.post("/api/v1/products", json=payload)
    assert resp.status_code == 409


def test_create_product_negative_price(client):
    payload = {"name": "Bad Product", "sku": "BADSKU", "price": "-5.00", "stock_quantity": 0}
    resp = client.post("/api/v1/products", json=payload)
    assert resp.status_code == 422


def test_create_product_negative_stock(client):
    payload = {"name": "Bad Product", "sku": "BADSTK", "price": "5.00", "stock_quantity": -1}
    resp = client.post("/api/v1/products", json=payload)
    assert resp.status_code == 422


def test_get_products(client):
    client.post("/api/v1/products", json={"name": "P1", "sku": "P1", "price": "1.00", "stock_quantity": 1})
    client.post("/api/v1/products", json={"name": "P2", "sku": "P2", "price": "2.00", "stock_quantity": 2})
    resp = client.get("/api/v1/products")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    assert len(data["items"]) == 2


def test_get_product_by_id(client):
    create_resp = client.post(
        "/api/v1/products",
        json={"name": "Single", "sku": "SNG1", "price": "5.00", "stock_quantity": 5},
    )
    product_id = create_resp.json()["id"]
    resp = client.get(f"/api/v1/products/{product_id}")
    assert resp.status_code == 200
    assert resp.json()["id"] == product_id


def test_get_product_not_found(client):
    resp = client.get("/api/v1/products/99999")
    assert resp.status_code == 404


def test_update_product(client):
    create_resp = client.post(
        "/api/v1/products",
        json={"name": "Original", "sku": "ORIG1", "price": "10.00", "stock_quantity": 10},
    )
    product_id = create_resp.json()["id"]
    resp = client.put(f"/api/v1/products/{product_id}", json={"name": "Updated", "price": "15.00"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["name"] == "Updated"
    assert float(data["price"]) == 15.00


def test_delete_product(client):
    create_resp = client.post(
        "/api/v1/products",
        json={"name": "ToDelete", "sku": "DEL1", "price": "1.00", "stock_quantity": 1},
    )
    product_id = create_resp.json()["id"]
    resp = client.delete(f"/api/v1/products/{product_id}")
    assert resp.status_code == 204
    resp = client.get(f"/api/v1/products/{product_id}")
    assert resp.status_code == 404


def test_search_products(client):
    client.post("/api/v1/products", json={"name": "Blue Widget", "sku": "BWID1", "price": "5.00", "stock_quantity": 5})
    client.post("/api/v1/products", json={"name": "Red Gadget", "sku": "RGAD1", "price": "5.00", "stock_quantity": 5})
    resp = client.get("/api/v1/products?search=blue")
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 1
    assert data["items"][0]["name"] == "Blue Widget"
