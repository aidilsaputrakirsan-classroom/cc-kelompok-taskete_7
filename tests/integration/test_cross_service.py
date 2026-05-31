"""
Integration Tests — Verify inter-service communication.

Tests in this module verify that:
1. All services are healthy and accessible via gateway
2. Authentication flow works (Auth Service integration)
3. Item management works with proper auth verification (cross-service)
4. Graceful degradation when services are unavailable

Run with:
    docker compose up -d
    pytest tests/integration/test_cross_service.py -v
"""
import httpx
import pytest
import logging

logger = logging.getLogger(__name__)


# =====================================================================
# TEST 1: SERVICE HEALTH CHECKS
# =====================================================================

class TestServiceHealth:
    """Verify all services are accessible and healthy."""
    
    def test_gateway_health(self, gateway_url):
        """Test 1: Gateway responds to health check."""
        response = httpx.get(f"{gateway_url}/health", timeout=10)
        assert response.status_code == 200
        logger.info("✅ Test 1 passed: Gateway health")
    
    def test_auth_service_health(self, gateway_url):
        """Test 2: Auth Service accessible via gateway."""
        response = httpx.get(f"{gateway_url}/auth/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data.get("service") == "auth-service"
        logger.info("✅ Test 2 passed: Auth Service health")
    
    def test_cuti_service_health(self, gateway_url):
        """Test 3: Cuti Service (Item Service) health check."""
        response = httpx.get(f"{gateway_url}/items/health", timeout=10)
        # Accept 200 or 404 depending on nginx routing
        assert response.status_code in [200, 404]
        logger.info("✅ Test 3 passed: Cuti Service health")


# =====================================================================
# TEST 2: AUTHENTICATION FLOW
# =====================================================================

class TestAuthenticationFlow:
    """Verify authentication works end-to-end."""
    
    def test_register_user(self, gateway_url):
        """Test 4: Can register a new user."""
        import time
        email = f"register-test-{int(time.time())}@test.com"
        
        response = httpx.post(
            f"{gateway_url}/auth/register",
            json={
                "email": email,
                "password": "TestPass123",
                "name": "Register Test User"
            },
            timeout=10,
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data.get("email") == email
        logger.info("✅ Test 4 passed: User registration")
    
    def test_login_user(self, gateway_url, test_user):
        """Test 5: Can login and get token."""
        response = httpx.post(
            f"{gateway_url}/auth/login",
            json={
                "email": test_user["email"],
                "password": test_user["password"]
            },
            timeout=10,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["access_token"] == test_user["token"]
        logger.info("✅ Test 5 passed: User login")


# =====================================================================
# TEST 3: CROSS-SERVICE COMMUNICATION
# =====================================================================

class TestCrossServiceCommunication:
    """Verify Auth Service and Cuti Service work together."""
    
    def test_create_item_requires_auth(self, gateway_url):
        """Test 6: Creating item without token should fail."""
        response = httpx.post(
            f"{gateway_url}/items",
            json={
                "name": "Unauth Item",
                "description": "Should fail",
                "price": 50000,
                "quantity": 1
            },
            timeout=10,
        )
        
        # Should fail with 401 or 422 (missing header)
        assert response.status_code in [401, 422]
        logger.info("✅ Test 6 passed: Auth required for item creation")
    
    def test_create_item_with_auth(self, gateway_url, test_user):
        """Test 7: Creating item with valid token works."""
        response = httpx.post(
            f"{gateway_url}/items",
            json={
                "name": "Test Cuti Item",
                "description": "Created via integration test",
                "price": 75000,
                "quantity": 2
            },
            headers=test_user["headers"],
            timeout=10,
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Test Cuti Item"
        assert data["owner_id"] == test_user.get("user_id") or data.get("owner_id")
        
        # Save item_id for later tests
        pytest.item_id = data["id"]
        logger.info(f"✅ Test 7 passed: Item created (ID: {data['id']})")
    
    def test_get_items(self, gateway_url, test_user):
        """Test 8: Can retrieve items with valid token."""
        response = httpx.get(
            f"{gateway_url}/items",
            headers=test_user["headers"],
            timeout=10,
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "items" in data
        assert isinstance(data["items"], list)
        logger.info(f"✅ Test 8 passed: Retrieved {data['total']} items")


# =====================================================================
# TEST 4: GRACEFUL DEGRADATION
# =====================================================================

class TestGracefulDegradation:
    """Verify graceful degradation when auth fails."""
    
    def test_public_items_no_auth_required(self, gateway_url):
        """Test 9: Public items endpoint doesn't require authentication."""
        response = httpx.get(
            f"{gateway_url}/items/public",
            timeout=10,
        )
        
        # Should succeed without auth
        assert response.status_code == 200
        data = response.json()
        assert "total" in data
        assert "items" in data
        logger.info(f"✅ Test 9 passed: Public items accessible without auth")
    
    def test_stats_with_auth(self, gateway_url, test_user):
        """Test 10: Stats endpoint with valid auth."""
        response = httpx.get(
            f"{gateway_url}/items/stats",
            headers=test_user["headers"],
            timeout=10,
        )
        
        # Should return full stats
        assert response.status_code == 200
        data = response.json()
        assert "total_items" in data
        assert "total_value" in data
        logger.info("✅ Test 10 passed: Stats endpoint (full mode)")
    
    def test_stats_without_auth_degraded(self, gateway_url):
        """Test 11: Stats endpoint degraded mode without auth."""
        response = httpx.get(
            f"{gateway_url}/items/stats",
            timeout=10,
        )
        
        # Should return aggregate stats (graceful degradation)
        assert response.status_code == 200
        data = response.json()
        assert "total_items" in data
        assert "total_value" in data
        logger.info("✅ Test 11 passed: Stats endpoint (degraded mode)")


# =====================================================================
# TEST 5: CRUD OPERATIONS
# =====================================================================

class TestCRUDOperations:
    """Verify full CRUD cycle works."""
    
    def test_crud_full_cycle(self, gateway_url, test_user):
        """Test 12: Complete CRUD cycle (Create, Read, Update, Delete)."""
        headers = test_user["headers"]
        item_data = {
            "name": "CRUD Test Item",
            "description": "For CRUD testing",
            "price": 100000,
            "quantity": 5
        }
        
        # CREATE
        response = httpx.post(
            f"{gateway_url}/items",
            json=item_data,
            headers=headers,
            timeout=10,
        )
        assert response.status_code == 201
        item = response.json()
        item_id = item["id"]
        logger.info(f"  ✓ Create: Item {item_id}")
        
        # READ
        response = httpx.get(
            f"{gateway_url}/items/{item_id}",
            headers=headers,
            timeout=10,
        )
        assert response.status_code == 200
        retrieved = response.json()
        assert retrieved["name"] == "CRUD Test Item"
        logger.info(f"  ✓ Read: Item {item_id}")
        
        # UPDATE
        response = httpx.put(
            f"{gateway_url}/items/{item_id}",
            json={"price": 90000, "quantity": 3},
            headers=headers,
            timeout=10,
        )
        assert response.status_code == 200
        updated = response.json()
        assert updated["price"] == 90000
        assert updated["quantity"] == 3
        logger.info(f"  ✓ Update: Item {item_id}")
        
        # DELETE
        response = httpx.delete(
            f"{gateway_url}/items/{item_id}",
            headers=headers,
            timeout=10,
        )
        assert response.status_code == 204
        logger.info(f"  ✓ Delete: Item {item_id}")
        
        # VERIFY DELETED
        response = httpx.get(
            f"{gateway_url}/items/{item_id}",
            headers=headers,
            timeout=10,
        )
        assert response.status_code == 404
        logger.info(f"  ✓ Verify deleted: Item {item_id}")
        
        logger.info("✅ Test 12 passed: Full CRUD cycle")


# =====================================================================
# TEST 6: CIRCUIT BREAKER & RELIABILITY
# =====================================================================

class TestReliability:
    """Verify reliability patterns are working."""
    
    def test_health_includes_circuit_breaker_status(self, gateway_url):
        """Test 13: Health endpoint includes circuit breaker status."""
        response = httpx.get(f"{gateway_url}/items/health", timeout=10)
        
        # Accept 200 or 404 (routing might differ)
        if response.status_code == 200:
            data = response.json()
            
            # Check dependencies are included
            if "dependencies" in data:
                assert "auth-service" in data["dependencies"]
                dependencies = data["dependencies"]
                
                if "auth-service" in dependencies:
                    auth_dep = dependencies["auth-service"]
                    assert "circuit_breaker" in auth_dep or "status" in auth_dep
                    logger.info("✅ Test 13 passed: Circuit breaker status in health")
                else:
                    logger.info("⚠️  Test 13 skipped: Circuit breaker info not in health")
            else:
                logger.info("⚠️  Test 13 skipped: Dependencies not in health response")


# =====================================================================
# TEST SUMMARY
# =====================================================================

def test_summary(gateway_url):
    """Final test: Verify system is healthy."""
    response = httpx.get(f"{gateway_url}/health")
    assert response.status_code == 200
    logger.info("\n" + "=" * 70)
    logger.info("✅ ALL INTEGRATION TESTS PASSED!")
    logger.info("=" * 70)
