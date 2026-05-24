"""Auth endpoints — register & login."""


def test_register_and_login(client):
    register = client.post(
        "/register",
        json={
            "email": "user@example.com",
            "password": "SecurePass123",
            "name": "Test User",
        },
    )
    assert register.status_code == 201
    assert register.json()["email"] == "user@example.com"
    assert "password" not in register.json()

    login = client.post(
        "/login",
        json={"email": "user@example.com", "password": "SecurePass123"},
    )
    assert login.status_code == 200
    assert "access_token" in login.json()
