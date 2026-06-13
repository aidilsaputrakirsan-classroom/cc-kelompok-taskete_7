"""
Integration Test Configuration.
Tests ini membutuhkan SEMUA services running di Docker Compose.

Jalankan dengan:
    docker compose up -d
    pytest tests/integration/ -v
"""
import os
import time
import pytest
import httpx
import logging

logger = logging.getLogger(__name__)

# =====================
# Configuration
# =====================
GATEWAY_URL = os.getenv("GATEWAY_URL", "http://localhost")
AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://localhost:8001")
CUTI_SERVICE_URL = os.getenv("CUTI_SERVICE_URL", "http://localhost:8002")

# Timeout untuk wait services ready
WAIT_TIMEOUT = 30
WAIT_INTERVAL = 2


@pytest.fixture(scope="session")
def gateway_url():
    """Base URL for API Gateway."""
    return GATEWAY_URL


@pytest.fixture(scope="session")
def auth_service_url():
    """Base URL for Auth Service."""
    return AUTH_SERVICE_URL


@pytest.fixture(scope="session")
def cuti_service_url():
    """Base URL for Cuti Service."""
    return CUTI_SERVICE_URL


@pytest.fixture(scope="session", autouse=True)
def wait_for_services(gateway_url):
    """
    Wait for all services to be ready.
    This runs automatically before any tests.
    """
    logger.info("Waiting for services to be ready...")
    
    endpoints = [
        ("Gateway", f"{gateway_url}/health"),
        ("Auth Service", f"{gateway_url}/auth/health"),
        ("Cuti Service", f"{gateway_url}/items/health"),
    ]
    
    start_time = time.time()
    
    for name, url in endpoints:
        ready = False
        while time.time() - start_time < WAIT_TIMEOUT:
            try:
                response = httpx.get(url, timeout=5)
                if response.status_code == 200:
                    logger.info(f"✅ {name}: Ready")
                    ready = True
                    break
            except Exception:
                pass
            
            time.sleep(WAIT_INTERVAL)
        
        if not ready:
            pytest.fail(f"{name} not ready after {WAIT_TIMEOUT}s — run: docker compose up -d")
    
    logger.info("Ready to run tests!")


@pytest.fixture(scope="session")
def test_user(gateway_url):
    """
    Register a test user and return credentials + token.
    
    Fixture scope=session means this runs once per test session,
    reducing unnecessary registrations.
    """
    # Generate unique email
    timestamp = int(time.time() * 1000)
    email = f"test-{timestamp}@example.com"
    password = "IntegrationTest123"
    name = "Integration Test User"
    
    logger.info(f"Registering test user: {email}")
    
    # Register
    try:
        response = httpx.post(
            f"{gateway_url}/auth/register",
            json={"email": email, "password": password, "name": name},
            timeout=10,
        )
        assert response.status_code == 201, f"Register failed: {response.text}"
        logger.info(f"✅ User registered: {email}")
    except Exception as e:
        logger.error(f"Register failed: {e}")
        raise
    
    # Login
    try:
        response = httpx.post(
            f"{gateway_url}/auth/login",
            data={"username": email, "password": password},
            timeout=10,
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        token = data.get("access_token")
        assert token, "No access_token in login response"
        logger.info(f"✅ User logged in, token: {token[:20]}...")
    except Exception as e:
        logger.error(f"Login failed: {e}")
        raise
    
    return {
        "email": email,
        "password": password,
        "name": name,
        "token": token,
        "headers": {"Authorization": f"Bearer {token}"},
    }


@pytest.fixture
def client():
    """HTTP client for making requests."""
    with httpx.Client() as c:
        yield c
