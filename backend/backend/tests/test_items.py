"""Test CRUD item endpoints."""


def test_create_item(client, auth_headers):
    """Test membuat item baru → 201."""
    response = client.post("/items", json={
        "name": "Laptop",
        "description": "Laptop untuk cloud computing",
        "price": 15000000,
        "quantity": 5
    }, headers=auth_headers)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Laptop"
    assert data["price"] == 15000000
    assert "id" in data


def test_create_item_unauthorized(client):
    """Test membuat item tanpa login → 401."""
    response = client.post("/items", json={
        "name": "Laptop",
        "price": 15000000,
        "quantity": 1
    })
    assert response.status_code == 401


def test_get_items(client, auth_headers):
    """Test mengambil daftar items → 200."""
    # Buat 2 items
    client.post("/items", json={
        "name": "Laptop", "price": 15000000, "quantity": 1
    }, headers=auth_headers)
    client.post("/items", json={
        "name": "Mouse", "price": 250000, "quantity": 3
    }, headers=auth_headers)

    response = client.get("/items", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 2


def test_get_item_not_found(client, auth_headers):
    """Test mengambil item yang tidak ada → 404."""
    response = client.get("/items/9999", headers=auth_headers)
    assert response.status_code == 404


def test_update_item(client, auth_headers):
    """Test update item → data berubah."""
    # Buat item
    create_resp = client.post("/items", json={
        "name": "Laptop", "price": 15000000, "quantity": 1
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    # Update
    response = client.put(f"/items/{item_id}", json={
        "price": 14000000
    }, headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["price"] == 14000000


def test_delete_item(client, auth_headers):
    """Test hapus item → 204, lalu GET → 404."""
    # Buat item
    create_resp = client.post("/items", json={
        "name": "Temporary", "price": 100, "quantity": 1
    }, headers=auth_headers)
    item_id = create_resp.json()["id"]

    # Hapus
    response = client.delete(f"/items/{item_id}", headers=auth_headers)
    assert response.status_code == 204

    # Verifikasi sudah tidak ada
    get_resp = client.get(f"/items/{item_id}", headers=auth_headers)
    assert get_resp.status_code == 404


def test_search_items(client, auth_headers):
    """Test search item berdasarkan nama."""
    client.post("/items", json={
        "name": "Laptop Gaming", "price": 20000000, "quantity": 1
    }, headers=auth_headers)
    client.post("/items", json={
        "name": "Mouse Wireless", "price": 350000, "quantity": 2
    }, headers=auth_headers)

    response = client.get("/items?search=laptop", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any("laptop" in item["name"].lower() for item in data["items"])


# ==================== EDGE CASES & VALIDATION ====================

def test_create_item_missing_name(client, auth_headers):
    """Test membuat item tanpa field name → 422."""
    response = client.post("/items", json={
        "description": "Laptop bagus",
        "price": 15000000,
        "quantity": 1
    }, headers=auth_headers)
    assert response.status_code == 422  # Validation error


def test_create_item_missing_price(client, auth_headers):
    """Test membuat item tanpa field price → 422."""
    response = client.post("/items", json={
        "name": "Laptop",
        "description": "Laptop bagus",
        "quantity": 1
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_item_missing_quantity(client, auth_headers):
    """Test membuat item tanpa field quantity → 422."""
    response = client.post("/items", json={
        "name": "Laptop",
        "description": "Laptop bagus",
        "price": 15000000
    }, headers=auth_headers)
    assert response.status_code == 422


def test_create_item_negative_price(client, auth_headers):
    """Test membuat item dengan price negatif."""
    response = client.post("/items", json={
        "name": "Laptop",
        "price": -100,
        "quantity": 1
    }, headers=auth_headers)
    # Bisa 201 atau 422 tergantung validasi, yang penting tidak 500
    assert response.status_code in [201, 422]


def test_create_item_negative_quantity(client, auth_headers):
    """Test membuat item dengan quantity negatif."""
    response = client.post("/items", json={
        "name": "Laptop",
        "price": 15000000,
        "quantity": -5
    }, headers=auth_headers)
    # Bisa 201 atau 422 tergantga validasi, yang penting tidak 500
    assert response.status_code in [201, 422]


def test_create_item_empty_name(client, auth_headers):
    """Test membuat item dengan nama kosong."""
    response = client.post("/items", json={
        "name": "",
        "price": 15000000,
        "quantity": 1
    }, headers=auth_headers)
    # Bisa 201 atau 422 tergantung validasi, yang penting tidak 500
    assert response.status_code in [201, 422]


# ==================== PAGINATION TESTS ====================

def test_pagination_items_limit(client, auth_headers):
    """Test pagination dengan limit parameter."""
    # Buat 5 items
    for i in range(5):
        client.post("/items", json={
            "name": f"Item {i+1}",
            "price": 100000 * (i+1),
            "quantity": i+1
        }, headers=auth_headers)
    
    # Get dengan limit 2
    response = client.get("/items?skip=0&limit=2", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert len(data["items"]) <= 2
    assert data["total"] >= 5


def test_pagination_items_skip(client, auth_headers):
    """Test pagination dengan skip parameter."""
    # Buat 3 items
    for i in range(3):
        client.post("/items", json={
            "name": f"Item {i+1}",
            "price": 100000 * (i+1),
            "quantity": i+1
        }, headers=auth_headers)
    
    # Get semua
    response_all = client.get("/items?skip=0&limit=100", headers=auth_headers)
    all_items = response_all.json()["items"]
    
    # Get dengan skip 1
    response_skip = client.get("/items?skip=1&limit=100", headers=auth_headers)
    skip_items = response_skip.json()["items"]
    
    assert len(skip_items) < len(all_items)


# ==================== STATS ENDPOINT TESTS ====================

def test_get_items_stats_empty(client, auth_headers):
    """Test endpoint /items/stats saat tidak ada items."""
    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 0
    assert data["total_value"] == 0.0


def test_get_items_stats_with_items(client, auth_headers):
    """Test endpoint /items/stats dengan beberapa items."""
    # Buat 2 items
    client.post("/items", json={
        "name": "Laptop", "price": 10000000, "quantity": 2
    }, headers=auth_headers)
    client.post("/items", json={
        "name": "Mouse", "price": 500000, "quantity": 4
    }, headers=auth_headers)
    
    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 2
    assert data["total_quantity"] == 6


def test_get_items_stats_unauthorized(client):
    """Test endpoint /items/stats tanpa login → 401."""
    response = client.get("/items/stats")
    assert response.status_code == 401