"""Tests for Item Stats endpoint."""
from models import Item


def test_get_items_stats_empty(client):
    """Degraded mode tanpa data — aggregate kosong."""
    response = client.get("/items/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 0
    assert data["total_value"] == 0.0
    assert data["most_expensive"] is None
    assert data["cheapest"] is None


def test_get_items_stats_with_data(client, sample_items, auth_headers):
    """Full mode dengan auth — stats milik user login (owner_id=1)."""
    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_items"] == 3
    assert data["total_value"] == 3575.0
    assert data["most_expensive"]["name"] == "Laptop"
    assert data["cheapest"]["name"] == "Mouse"


def test_get_items_stats_single_item(client, db, auth_headers):
    """Full mode — satu item milik user 1."""
    item = Item(
        name="Test Item",
        description="Single test item",
        price=100.0,
        quantity=10,
        owner_id=1,
    )
    db.add(item)
    db.commit()

    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_items"] == 1
    assert data["total_value"] == 1000.0
    assert data["most_expensive"]["name"] == "Test Item"
    assert data["cheapest"]["name"] == "Test Item"


def test_get_items_stats_multiple_users_full_mode(client, db, auth_headers):
    """Full mode dengan auth — hanya item milik user yang login."""
    db.add(
        Item(
            name="User1 Item",
            description="Item for user 1",
            price=100.0,
            quantity=2,
            owner_id=1,
        )
    )
    db.add(
        Item(
            name="User2 Item",
            description="Item for user 2",
            price=500.0,
            quantity=3,
            owner_id=2,
        )
    )
    db.commit()

    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_items"] == 1
    assert data["total_value"] == 200.0
    assert data["most_expensive"]["name"] == "User1 Item"
    assert data["cheapest"]["name"] == "User1 Item"


def test_get_items_stats_degraded_multiple_users(client, db):
    """Degraded mode tanpa auth — aggregate semua items."""
    db.add(
        Item(
            name="User1 Item",
            price=100.0,
            quantity=2,
            owner_id=1,
        )
    )
    db.add(
        Item(
            name="User2 Item",
            price=500.0,
            quantity=3,
            owner_id=2,
        )
    )
    db.commit()

    response = client.get("/items/stats")
    assert response.status_code == 200

    data = response.json()
    assert data["total_items"] == 2
    assert data["total_value"] == 200.0 + 1500.0  # 100*2 + 500*3


def test_get_items_stats_different_prices(client, db, auth_headers):
    """Full mode — berbagai harga untuk user 1."""
    items_data = [
        ("Item A", 50.0, 10),
        ("Item B", 100.0, 5),
        ("Item C", 75.0, 2),
        ("Item D", 200.0, 1),
    ]

    for name, price, quantity in items_data:
        db.add(
            Item(
                name=name,
                description=f"Description for {name}",
                price=price,
                quantity=quantity,
                owner_id=1,
            )
        )
    db.commit()

    response = client.get("/items/stats", headers=auth_headers)
    assert response.status_code == 200

    data = response.json()
    assert data["total_items"] == 4
    assert data["total_value"] == 1350.0
    assert data["most_expensive"]["name"] == "Item D"
    assert data["cheapest"]["name"] == "Item A"
