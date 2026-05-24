"""Test fixtures — Item Service (SQLite + mock Auth Service)."""
import pytest
from fastapi import Header
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import database

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

database.engine = engine
database.SessionLocal = TestingSessionLocal

from database import Base, get_db  # noqa: E402
from main import app  # noqa: E402
from auth_client import verify_token_with_auth_service  # noqa: E402


async def _mock_verify_token(authorization: str = Header(...)) -> dict:
    return {"user_id": 1, "email": "test@example.com", "name": "Test User"}


@pytest.fixture(scope="function")
def db_session():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[verify_token_with_auth_service] = _mock_verify_token
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
