"""Items CRUD — Item Service (auth mocked)."""


def test_create_and_list_items(client):
    create = client.post(
        "/items",
        json={
            "name": "Laptop",
            "description": "Dev machine",
            "price": 10000000,
            "quantity": 1,
        },
        headers={"Authorization": "Bearer fake-token"},
    )
    assert create.status_code == 201
    assert create.json()["name"] == "Laptop"
    assert create.json()["owner_id"] == 1

    listing = client.get(
        "/items",
        headers={"Authorization": "Bearer fake-token"},
    )
    assert listing.status_code == 200
    data = listing.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
