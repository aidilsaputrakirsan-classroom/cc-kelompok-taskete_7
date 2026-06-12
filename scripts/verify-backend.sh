#!/bin/bash
# Final Backend Verification Script — Test all endpoints

echo "============================================"
echo "  FINAL BACKEND VERIFICATION"
echo "============================================"

# Set base URL
API_URL="http://localhost"
AUTH_SERVICE="http://localhost:8001"
ITEM_SERVICE="http://localhost:8002"
UNIQUE_EMAIL="test-$(date +%s)@example.com"
UNIQUE_PASSWORD="TestPass123"
TEST_USER_NAME="Test User"

echo ""
echo "1️⃣  Auth Service - Health Check"
curl -s $AUTH_SERVICE/health | jq . || echo "❌ Failed"

echo ""
echo "2️⃣  Item Service - Health Check"
curl -s $ITEM_SERVICE/health | jq . || echo "❌ Failed"

echo ""
echo "3️⃣  Auth Service - Register New User"
REGISTER_RESPONSE=$(curl -s -X POST $API_URL/auth/register \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$UNIQUE_EMAIL\",
    \"password\":\"$UNIQUE_PASSWORD\",
    \"name\":\"$TEST_USER_NAME\"
  }")
echo "$REGISTER_RESPONSE" | jq .
USER_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.id // empty')

if [ -z "$USER_ID" ]; then
  echo "❌ Registration failed. Response: $REGISTER_RESPONSE"
  exit 1
fi
echo "✅ User registered: ID=$USER_ID, Email=$UNIQUE_EMAIL"

echo ""
echo "4️⃣  Auth Service - Login (Password Strength Check)"
echo "Testing weak password (should fail)..."
WEAK_LOGIN=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$UNIQUE_EMAIL\",
    \"password\":\"weak\"
  }")
echo "Response: $WEAK_LOGIN" | jq . || true

echo ""
echo "5️⃣  Auth Service - Login with Correct Password"
LOGIN_RESPONSE=$(curl -s -X POST $API_URL/auth/login \
  -H "Content-Type: application/json" \
  -d "{
    \"email\":\"$UNIQUE_EMAIL\",
    \"password\":\"$UNIQUE_PASSWORD\"
  }")
echo "$LOGIN_RESPONSE" | jq .
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.access_token // empty')

if [ -z "$ACCESS_TOKEN" ]; then
  echo "❌ Login failed"
  exit 1
fi
echo "✅ Login successful. Token obtained."

echo ""
echo "6️⃣  Item Service - Create Item (with validation)"
echo "Testing invalid item (negative price, should fail)..."
INVALID_ITEM=$(curl -s -X POST $API_URL/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"name\":\"Test Item\",
    \"description\":\"Test Description\",
    \"price\":-100,
    \"quantity\":5
  }")
echo "Response: $INVALID_ITEM" | jq . || true

echo ""
echo "7️⃣  Item Service - Create Valid Item"
CREATE_ITEM=$(curl -s -X POST $API_URL/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"name\":\"Laptop Gaming\",
    \"description\":\"High-performance laptop for gaming\",
    \"price\":15000000.50,
    \"quantity\":5
  }")
echo "$CREATE_ITEM" | jq .
ITEM_ID=$(echo "$CREATE_ITEM" | jq -r '.id // empty')

if [ -z "$ITEM_ID" ]; then
  echo "❌ Create item failed"
  exit 1
fi
echo "✅ Item created: ID=$ITEM_ID"

echo ""
echo "8️⃣  Item Service - Get Items List"
curl -s -X GET "$API_URL/items?search=Laptop&limit=10" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo ""
echo "9️⃣  Item Service - Get Item By ID"
curl -s -X GET "$API_URL/items/$ITEM_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo ""
echo "🔟 Item Service - Update Item"
UPDATE_ITEM=$(curl -s -X PUT $API_URL/items/$ITEM_ID \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -d "{
    \"price\":14500000.75,
    \"quantity\":3
  }")
echo "$UPDATE_ITEM" | jq .

echo ""
echo "1️⃣1️⃣  Item Service - Item Stats"
curl -s -X GET "$API_URL/items/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq .

echo ""
echo "1️⃣2️⃣  Item Service - Metrics"
curl -s $ITEM_SERVICE/metrics | jq '.service, .total_requests, .error_count'

echo ""
echo "1️⃣3️⃣  Auth Service - Metrics"
curl -s $AUTH_SERVICE/metrics | jq '.service, .total_requests, .error_count'

echo ""
echo "1️⃣4️⃣  Item Service - Delete Item"
DELETE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE $API_URL/items/$ITEM_ID \
  -H "Authorization: Bearer $ACCESS_TOKEN")
echo "Delete response code: $DELETE_STATUS"
if [ "$DELETE_STATUS" = "204" ]; then
  echo "✅ Item deleted successfully"
else
  echo "❌ Delete failed"
fi

echo ""
echo "============================================"
echo "  VERIFICATION COMPLETE ✅"
echo "============================================"
