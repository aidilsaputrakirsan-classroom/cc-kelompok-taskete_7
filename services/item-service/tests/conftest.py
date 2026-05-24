"""Test configuration and fixtures for Item Service."""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Set TESTING environment variable
os.environ["TESTING"] = "true"

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base, get_db
from models import Item

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Create tables before importing app
Base.metadata.create_all(bind=engine)


def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


def override_verify_token():
    """Mock token verification — return test user."""
    return {"user_id": 1, "username": "testuser", "role": "user"}


# Import app after creating tables
from main import app
from auth_client import verify_token_with_auth_service


@pytest.fixture(scope="function")
def db():
    """Create test database session."""
    connection = engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)
    
    yield session
    
    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture(scope="function")
def client(db):
    """Create test client with mocked dependencies."""
    app.dependency_overrides[get_db] = lambda: db
    app.dependency_overrides[verify_token_with_auth_service] = override_verify_token
    
    yield TestClient(app)
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_items(db):
    """Create sample items for testing."""
    items = [
        Item(
            name="Laptop",
            description="High-end laptop",
            price=1500.00,
            quantity=2,
            owner_id=1,
        ),
        Item(
            name="Mouse",
            description="Wireless mouse",
            price=25.00,
            quantity=5,
            owner_id=1,
        ),
        Item(
            name="Keyboard",
            description="Mechanical keyboard",
            price=150.00,
            quantity=3,
            owner_id=1,
        ),
    ]
    
    for item in items:
        db.add(item)
    db.commit()
    
    for item in items:
        db.refresh(item)
    
    return items
