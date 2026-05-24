"""Tests for Item Stats endpoint."""
import pytest


def test_get_items_stats_empty(client):
    """Test stats endpoint dengan data kosong."""
    response = client.get("/items/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["total_items"] == 0
    assert data["total_value"] == 0.0
    assert data["most_expensive"] is None
    assert data["cheapest"] is None


def test_get_items_stats_with_data(client, sample_items):
    """Test stats endpoint dengan sample data."""
    response = client.get("/items/stats")
    assert response.status_code == 200
    
    data = response.json()
    
    # Check total items
    assert data["total_items"] == 3
    
    # Check total value (1500*2 + 25*5 + 150*3 = 3000 + 125 + 450 = 3575)
    assert data["total_value"] == 3575.0
    
    # Check most expensive (Laptop at 1500)
    assert data["most_expensive"]["name"] == "Laptop"
    assert data["most_expensive"]["price"] == 1500.0
    
    # Check cheapest (Mouse at 25)
    assert data["cheapest"]["name"] == "Mouse"
    assert data["cheapest"]["price"] == 25.0


def test_get_items_stats_single_item(client, db):
    """Test stats endpoint dengan single item."""
    from models import Item
    
    item = Item(
        name="Test Item",
        description="Single test item",
        price=100.0,
        quantity=10,
        owner_id=1,
    )
    db.add(item)
    db.commit()
    
    response = client.get("/items/stats")
    assert response.status_code == 200
    
    data = response.json()
    assert data["total_items"] == 1
    assert data["total_value"] == 1000.0  # 100 * 10
    assert data["most_expensive"]["name"] == "Test Item"
    assert data["cheapest"]["name"] == "Test Item"


def test_get_items_stats_multiple_users(client, db):
    """Test stats endpoint — hanya return data milik user yang login."""
    from models import Item
    
    # Add items untuk user 1 (yang login)
    item1 = Item(
        name="User1 Item",
        description="Item for user 1",
        price=100.0,
        quantity=2,
        owner_id=1,
    )
    
    # Add items untuk user 2 (bukan yang login)
    item2 = Item(
        name="User2 Item",
        description="Item for user 2",
        price=500.0,
        quantity=3,
        owner_id=2,
    )
    
    db.add(item1)
    db.add(item2)
    db.commit()
    
    response = client.get("/items/stats")
    assert response.status_code == 200
    
    data = response.json()
    
    # Should only count items dari user 1
    assert data["total_items"] == 1
    assert data["total_value"] == 200.0  # 100 * 2
    assert data["most_expensive"]["name"] == "User1 Item"
    assert data["cheapest"]["name"] == "User1 Item"


def test_get_items_stats_different_prices(client, db):
    """Test stats dengan items dengan berbagai harga."""
    from models import Item
    
    items_data = [
        ("Item A", 50.0, 10),
        ("Item B", 100.0, 5),
        ("Item C", 75.0, 2),
        ("Item D", 200.0, 1),
    ]
    
    for name, price, quantity in items_data:
        item = Item(
            name=name,
            description=f"Description for {name}",
            price=price,
            quantity=quantity,
            owner_id=1,
        )
        db.add(item)
    db.commit()
    
    response = client.get("/items/stats")
    assert response.status_code == 200
    
    data = response.json()
    
    # Total items = 4
    assert data["total_items"] == 4
    
    # Total value = (50*10) + (100*5) + (75*2) + (200*1) = 500 + 500 + 150 + 200 = 1350
    assert data["total_value"] == 1350.0
    
    # Most expensive = Item D (price 200.0)
    assert data["most_expensive"]["name"] == "Item D"
    assert data["most_expensive"]["price"] == 200.0
    
    # Cheapest = Item A (price 50.0)
    assert data["cheapest"]["name"] == "Item A"
    assert data["cheapest"]["price"] == 50.0
