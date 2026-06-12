# SIMCUTI Architecture - Quick Reference & Visual Guides

**Last Updated**: 2026-06-12

---

## Quick Reference Card

### Service Inventory

```
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE SUMMARY TABLE                         │
├──────────────┬──────────┬─────────┬──────────┬──────────────────┤
│ Service      │ Port     │ Type    │ Database │ Key Dependencies │
├──────────────┼──────────┼─────────┼──────────┼──────────────────┤
│ Auth         │ 8001     │ FastAPI │ auth_db  │ JWT, bcrypt      │
│ Cuti/Items   │ 8002     │ FastAPI │ cuti_db  │ httpx, Auth API  │
│ Frontend     │ 3000/80  │ React   │ None     │ Axios, localStorage
│ Gateway      │ 80       │ Nginx   │ None     │ None             │
│ Databases    │ 5432*    │ PG      │ N/A      │ None             │
└──────────────┴──────────┴─────────┴──────────┴──────────────────┘
* Internal only in production
```

### Port Mapping Matrix

```
                    DEV ACCESS          INTERNAL (Docker)      PROD PUBLIC
────────────────────────────────────────────────────────────────────────
Auth Service        :8001              auth-service:8001       :80/auth
Cuti Service        :8002              cuti-service:8002       :80/items
Frontend            :3000              frontend:80             :80/
Frontend HMR        :5173              N/A                     N/A
Gateway             :80                gateway:80              :80
auth-db             N/A                auth-db:5432            N/A (closed)
cuti-db             N/A                cuti-db:5432            N/A (closed)
```

---

## Communication Flows

### 1. User Registration Flow

```
User (Browser)
    │
    ├─ POST /auth/register
    │  └─> Nginx Gateway (:80)
    │      └─> Auth Service (:8001)
    │          └─> auth_db (5432)
    │              ├─ Check: email unique?
    │              ├─ Hash password with bcrypt
    │              └─ INSERT user
    │
    └─ Response: 201 Created
       └─ { id, email, name, created_at }
```

### 2. User Login & Token Flow

```
User (Browser)
    │
    ├─ POST /auth/login (email, password)
    │  └─> Nginx Gateway (:80/auth)
    │      └─> Auth Service (:8001)
    │          ├─ Query auth_db: SELECT * FROM users WHERE email=?
    │          ├─ Verify password (bcrypt)
    │          ├─ Create JWT token
    │          │  └─ Payload: { user_id, email, exp: now+30min }
    │          │  └─ Signed with SECRET_KEY (HS256)
    │          └─ Return token
    │
    ├─ Response: 200 OK
    │  └─ { access_token: "eyJhbGc...", token_type: "bearer", user: {...} }
    │
    └─ Frontend Action:
       └─ localStorage.setItem('simcuti_token', access_token)
```

### 3. Create Item (Authenticated Request)

```
User (Browser)
    │
    ├─ POST /items { name, price, quantity }
    │  └─ Header: Authorization: Bearer <token>
    │     └─> Nginx Gateway (:80/items)
    │         └─> Cuti Service (:8002)
    │             │
    │             ├─ [VERIFY TOKEN]
    │             │  ├─ Check: Circuit Breaker can execute?
    │             │  │  └─ If OPEN: Return 503, fail fast
    │             │  │
    │             │  ├─ Retry Loop (max 3 attempts):
    │             │  │  │
    │             │  │  ├─ Attempt 1 (timeout: 5s):
    │             │  │  │  └─ GET http://auth-service:8001/verify
    │             │  │  │     Header: Authorization: Bearer <token>
    │             │  │  │     Header: X-Correlation-ID: abc123
    │             │  │  │
    │             │  │  ├─ If 200 OK:
    │             │  │  │  └─ Circuit.record_success()
    │             │  │  │
    │             │  │  ├─ If 401 Unauthorized:
    │             │  │  │  └─ Fail immediately (non-retryable)
    │             │  │  │
    │             │  │  ├─ If 5xx or timeout:
    │             │  │  │  └─ If attempt < 3:
    │             │  │  │     ├─ Wait: 0.5 * 2^(attempt-1) seconds
    │             │  │  │     └─ Retry
    │             │  │  │  └─ Else:
    │             │  │  │     ├─ Circuit.record_failure()
    │             │  │  │     └─ Return 503
    │             │  │
    │             │  └─ Response: { user_id, email, exp }
    │             │
    │             ├─ [CREATE ITEM]
    │             │  ├─ INSERT INTO items (name, price, quantity, owner_id)
    │             │  │  └─ owner_id from verified token
    │             │  │
    │             │  └─ SELECT * FROM items WHERE id=?
    │             │
    │             └─ [METRICS & LOGGING]
    │                ├─ metrics.record_request("POST", "/items", 201, 45ms)
    │                ├─ error_alerting.record_request(201, correlation_id)
    │                └─ logger.info("Item created", correlation_id=abc123)
    │
    └─ Response: 201 Created
       └─ { id, name, price, quantity, owner_id, created_at, updated_at }
```

### 4. Health Check Chain

```
External Check (e.g., monitoring service)
    │
    └─ GET http://localhost/health (or gateway)
       └─> Nginx Gateway (:80)
           └─ Returns: { status: "healthy" }

Frontend Check (optional, periodic)
    │
    └─ GET http://localhost/auth/health
       └─> Nginx Gateway (:80/auth)
           └─> Auth Service (:8001)
               └─> Database check (pg_isready)
                   └─ Response: { status, service, version }

Cuti Service Self-Check
    │
    ├─ Auth Service Status:
    │  └─ Circuit Breaker state (CLOSED/OPEN/HALF_OPEN)
    │  └─ Failure count, success count, total rejected
    │
    └─ Database Check:
       └─ SELECT 1 (connection test)
       └─ Status: connected/disconnected
```

---

## Dependency Graphs

### Service Dependencies

```
                    ┌─────────────────┐
                    │  User (Browser) │
                    └────────┬────────┘
                             │ HTTP/HTTPS
                             ▼
                    ┌─────────────────┐
                    │  Nginx Gateway  │ (Port 80)
                    └────┬────┬───────┘
                         │    │
          ┌──────────────┘    └──────────────┐
          │                                  │
          ▼ /auth                       /items, /items/*
    ┌──────────────┐            ┌──────────────────┐
    │ Auth Service │            │ Cuti Service     │
    │  (Port 8001) │            │  (Port 8002)     │
    └──────┬───────┘            └────┬─┬──────────┘
           │                         │ │
           │ JWT Verify             │ ▼
           │ (internal HTTP)         │ ┌─────────────────┐
           │                        └─┤ Auth Service    │
           │                          │ (for /verify)   │
           │ Database                └─────────────────┘
           ▼                              │
    ┌──────────────┐              Database
    │   auth_db    │                   ▼
    │ (PostgreSQL) │          ┌──────────────┐
    └──────────────┘          │   cuti_db    │
                              │ (PostgreSQL) │
                              └──────────────┘
```

### Data Flow Dependencies

```
Frontend Request Chain:
├─ Browser → localStorage (get token)
├─ Axios.interceptor.request (add Authorization header)
├─ Nginx Gateway (route)
├─ Service:
│  ├─ Extract token from header
│  ├─ Call Auth Service /verify (with retry & circuit breaker)
│  │  └─ Auth Service → auth_db (verify token)
│  ├─ Process request in service
│  ├─ Access service database
│  └─ Log (with correlation ID)
├─ Service → Nginx Gateway (response)
└─ Axios.interceptor.response:
   ├─ Check for 401 → localStorage.removeItem(token)
   ├─ Check for 503 → dispatch('api-service-unavailable')
   └─ Return response to component
```

---

## Request Lifecycle Timeline

### Scenario: Create Item Request

```
Timeline (in milliseconds):

T+0ms     │ Browser: User clicks "Create Item"
          │ Action: POST /items { name, desc, price, qty }

T+5ms     │ Axios Interceptor:
          │ - Get token from localStorage
          │ - Add: Authorization: Bearer <token>

T+10ms    │ Request reaches Nginx Gateway (Port 80)
          │ - Route: /items → cuti-service:8002

T+15ms    │ Cuti Service receives request
          │ - Extract Authorization header
          │ - Generate correlation_id (abc123def456)
          │ - Start request logging middleware

T+20ms    │ Circuit Breaker check (auth-service)
          │ - CB state: CLOSED → Proceed
          │ - Can execute: true

T+25ms    │ Attempt 1: Verify token
          │ - Call: GET http://auth-service:8001/verify
          │ - Headers: Authorization: Bearer <token>
          │ - Headers: X-Correlation-ID: abc123def456
          │ - Timeout: 5000ms

T+40ms    │ Auth Service receives verify request
          │ - Decode JWT token
          │ - Validate signature (HS256)
          │ - Check expiry
          │ - Response: 200 OK { user_id: 5, email: ... }

T+50ms    │ Cuti Service receives auth response
          │ - Circuit.record_success()
          │ - Store user_id from response

T+55ms    │ Cuti Service: Insert item
          │ - SQL: INSERT INTO items (...)
          │ - Get database connection
          │ - Execute query

T+65ms    │ Database responds (PostgreSQL)
          │ - New item created with id=42

T+70ms    │ Cuti Service: Generate response
          │ - SELECT * FROM items WHERE id=42
          │ - Format JSON response
          │ - Record metrics:
          │    metrics.record_request("POST", "/items", 201, 65)
          │ - Log: { correlation_id, status: 201, duration: 65ms }

T+75ms    │ Response sent to Nginx Gateway
          │ - Status: 201 Created
          │ - Body: { id, name, description, price, qty, owner_id, ... }

T+80ms    │ Response reaches Frontend
          │ - Axios interceptor checks response.status
          │ - Status 201 (not 401, 502, 503) → Success

T+85ms    │ Frontend updates UI
          │ - Add new item to list
          │ - Show success notification
          │ - Dispatch state update

Total Round-trip Time: ~85ms
```

---

## Failure Scenario Timeline

### Scenario: Auth Service Down

```
T+0ms     │ Browser: User creates item
          │ Cuti Service: Receive request

T+20ms    │ Circuit Breaker check: CLOSED → Can execute

T+25ms    │ Attempt 1: GET /auth-service:8001/verify
          │ → Timeout after 5000ms (connection refused)

T+5030ms  │ Retry Logic:
          │ - Status: Non-retryable OR retryable? → Retryable (timeout)
          │ - Wait: 0.5s
          │ - Attempt count: 1/3

T+5531ms  │ Attempt 2: GET /auth-service:8001/verify
          │ → Timeout after 5000ms (still down)

T+10531ms │ Retry Logic:
          │ - Wait: 1.0s (0.5 * 2^1)
          │ - Attempt count: 2/3

T+11531ms │ Attempt 3: GET /auth-service:8001/verify
          │ → Timeout after 5000ms (still down)

T+16531ms │ All retries exhausted:
          │ - Circuit.record_failure() (count = 1)
          │ - Failure threshold: 5 (not yet reached)
          │ - Circuit state: CLOSED (still)

T+16540ms │ Response to Frontend:
          │ - Status: 503 Service Unavailable
          │ - Detail: "Auth Service circuit breaker OPEN"
          │
          │ [AFTER 5 FAILURES]
          │ - Circuit state: OPEN
          │ - Next requests rejected immediately (no wait)

T+16545ms │ Frontend receives 503
          │ - Axios interceptor:
          │   - Status 503 → dispatch('api-service-unavailable')
          │   - Show error to user: "Service temporarily unavailable"
          │ - localStorage token NOT removed (might retry)

T+30000ms │ [AFTER 30s COOLDOWN]
          │ - Circuit state: OPEN → HALF_OPEN
          │ - Next request allowed to test recovery
          │ - If Auth Service recovered: HALF_OPEN → CLOSED
          │ - If still down: HALF_OPEN → OPEN (extended cooldown)
```

---

## Error Handling Decision Tree

```
                    Request arrives at Cuti Service
                              │
                ┌─────────────┴─────────────┐
                │                           │
        [Circuit Breaker]          [Verify Token]
        check can_execute()        (Auth Service)
                │                           │
        ┌───────┴────────┐         ┌────────┴────────┐
        │                │         │                 │
    CLOSED/        OPEN &        200 OK           401/400
    HALF_OPEN    Cooldown     (valid token)     (invalid)
        │            │              │                │
        ▼            ▼              ▼                ▼
     Continue     Return         Extract          Fail
     (execute     503           user_id          Immediately
      request)    (fail-fast)                    (no retry)
                                   │
                            ┌──────┴──────┐
                            │             │
                       [Business Logic]   │
                       (create item,      │
                        DB access,        │
                        etc)              │
                            │             │
                    ┌───────┴──────┐     │
                    │              │     │
                200 OK        5xx Error  │
                (success)     (DB error) │
                    │              │     │
                    ▼              ▼     ▼
              Record Success   Record      Circuit.record_failure()
              Circuit.record_  Failure     If failure_count >= 5:
              success()        (retry      → state = OPEN
                               logic)      (fail future requests)
                    │              │
                    └──────┬───────┘
                           │
                    Response to Frontend
```

---

## Network Topology

### Docker Network: simcuti-network

```
        ┌─────────────────────────────────────┐
        │   Docker Bridge Network             │
        │   simcuti-network                   │
        │   Driver: bridge                    │
        │                                     │
        │   ┌──────────────────────────────┐  │
        │   │  auth-service:8001           │  │
        │   │  └─> auth-db:5432            │  │
        │   │      (Private connection)    │  │
        │   └──────────┬───────────────────┘  │
        │              │                      │
        │   ┌──────────▼───────────────────┐  │
        │   │  cuti-service:8002           │  │
        │   │  ├─> cuti-db:5432            │  │
        │   │  │   (Private connection)    │  │
        │   │  ├─> auth-service:8001       │  │
        │   │  │   (HTTP calls, with CB)   │  │
        │   │  └─> Logging & Metrics       │  │
        │   └──────────┬───────────────────┘  │
        │              │                      │
        │   ┌──────────▼───────────────────┐  │
        │   │  frontend:80 (Nginx)         │  │
        │   │  (Static content)            │  │
        │   └──────────┬───────────────────┘  │
        │              │                      │
        │   ┌──────────▼───────────────────┐  │
        │   │  gateway:80 (Nginx)          │  │
        │   │  ├─ Routes requests          │  │
        │   │  ├─ Proxies to services     │  │
        │   │  └─ Exposes: 0.0.0.0:80    │  │
        │   └──────────────────────────────┘  │
        │                                     │
        └─────────────────────────────────────┘
                          │
                          │ Exposed to Host
                          ▼
                   0.0.0.0:80 (External)
                   localhost:8001 (dev)
                   localhost:8002 (dev)
                   localhost:5173 (dev HMR)
                   localhost:3000 (dev)
```

---

## Scalability Considerations

### Current Single-Instance Limitations

```
                    Bottlenecks & Limits

Auth Service:
├─ Single instance (:8001)
├─ Connection pool: Default SQLAlchemy (5 connections)
├─ Max concurrent requests: ~100-200
└─ Circuit breaker to Auth: 5 failure threshold

Cuti Service:
├─ Single instance (:8002)
├─ Dependency: Auth Service availability
├─ Connection pool: Default SQLAlchemy (5 connections)
└─ Circuit breaker provides degradation, not scaling

Database:
├─ Single PostgreSQL instance (per DB)
├─ Memory: 512MB limit (auth_db), 512MB limit (cuti_db)
├─ Concurrent connections: ~20 (default)
└─ Disk: Volume size limited

Nginx Gateway:
├─ Single instance
├─ Worker processes: Default (auto)
├─ Connection limit: ~1024 (OS file descriptors)
└─ No load balancing between services
```

### Future Scaling Strategy

```
Horizontal Scaling (replicas):
├─ Multiple Auth Service instances
│  ├─ Load balancer in front
│  ├─ Shared PostgreSQL database
│  └─ Session store (Redis) for session replication
│
├─ Multiple Cuti Service instances
│  ├─ Load balancer in front
│  ├─ Service discovery (Consul, Eureka, or K8s)
│  └─ Circuit breaker per instance
│
└─ Multiple Nginx instances
   ├─ Upstream load balancing
   └─ Geo-distribution option

Vertical Scaling (resource increase):
├─ Increase database memory/CPU
├─ Increase service container limits
└─ Optimize queries & connection pooling

Caching Layer:
├─ Redis for token caching (reduce Auth calls)
├─ Redis for frequently accessed items
└─ Nginx page caching for static content

Database Optimization:
├─ Connection pooling (PgBouncer)
├─ Read replicas for cuti_db
├─ Query optimization & indexing
└─ Sharding if data grows large
```

---

## Monitoring & Observability Points

### Key Metrics to Monitor

```
Per-Service Metrics (/metrics endpoint):

Auth Service:
├─ request_count
├─ error_count & error_rate_percent
├─ response latency (avg, p95, p99)
├─ status code distribution (200, 201, 400, 401, 500)
├─ active database connections
└─ token generation rate

Cuti Service:
├─ request_count
├─ error_count & error_rate_percent
├─ response latency (avg, p95, p99)
├─ per-endpoint stats (POST /items, GET /items, etc)
├─ circuit breaker state & rejection rate
├─ auth-service call success rate
├─ database query time
└─ active database connections

Gateway (Nginx):
├─ request_count per route (/auth, /items, /)
├─ upstream response time
├─ upstream active connections
├─ error rates (4xx, 5xx)
└─ cache hit/miss ratio

Frontend:
├─ API error rate (per endpoint)
├─ service degradation events
├─ token expiry/refresh rate
└─ page load time
```

### Alert Thresholds (Recommended)

```
Auth Service:
├─ Error rate > 5% → Alert
├─ Response time p99 > 2s → Warning
└─ Database connection pool exhausted → Critical

Cuti Service:
├─ Circuit breaker state = OPEN → Alert
├─ Error rate > 5% → Alert
├─ Auth service unavailable > 30s → Critical
└─ Response time p99 > 2s → Warning

Database:
├─ Connection pool > 80% → Warning
├─ Disk usage > 80% → Warning
├─ Query time > 5s → Alert
└─ Replication lag > 10s (if replicated) → Alert

Gateway:
├─ Error rate (5xx) > 1% → Alert
├─ Response time > 1s → Warning
└─ Connection queue > 100 → Alert

Frontend:
├─ API error rate > 10% (from user perspective) → Alert
├─ Service degradation events > 3/hour → Alert
└─ Page load time > 3s → Warning
```

---

## Security Considerations

### Authentication & Authorization

```
JWT Token Flow:
├─ Issued by: Auth Service (/login endpoint)
├─ Algorithm: HS256 (HMAC SHA-256)
├─ Secret: SECRET_KEY environment variable
├─ Expiry: 30 minutes (configurable)
├─ Payload: { user_id, email, exp, iat }
│
├─ Transmission: Authorization: Bearer <token> header
├─ Storage (Frontend): localStorage (simcuti_token)
│  ├─ ⚠️  Vulnerable to XSS attacks
│  ├─ Mitigation: Content Security Policy (CSP)
│  └─ Better: HTTP-only cookies (requires CORS adjustment)
│
└─ Verification:
   ├─ Frontend: Sends token with every request
   ├─ Cuti Service: Calls Auth Service /verify endpoint
   └─ Auth Service: Decodes & validates signature + expiry

Database Access Control:
├─ PostgreSQL users: Default (postgres/postgres123)
├─ ⚠️  Should be changed in production
├─ Recommendation: Different credentials per service
└─ Network: Internal-only (no external exposure in prod)

Secrets Management:
├─ Current: Environment variables (docker-compose)
├─ ⚠️  Not suitable for production
├─ Recommendation:
│  ├─ Vault (HashiCorp Vault)
│  ├─ AWS Secrets Manager
│  ├─ K8s Secrets
│  └─ Environment-specific secret injection

CORS Configuration:
├─ Auth Service: CORS_ORIGINS=http://localhost:5173 (dev)
├─ Cuti Service: CORS_ORIGINS=http://localhost:5173 (dev)
├─ Frontend: Served from same domain (no CORS issue)
└─ Production: Set to exact frontend domain
```

### Network Security

```
Current Architecture:
├─ Nginx Gateway: Listens on 0.0.0.0:80 (all interfaces)
├─ Services (dev): Exposed on localhost:8001/8002
├─ Services (prod): Internal-only via Docker network
├─ Databases: Internal-only (no external exposure)
└─ No encryption (HTTP, not HTTPS)

Recommendations:
├─ SSL/TLS Termination:
│  ├─ Install certificate on Nginx
│  ├─ Redirect HTTP → HTTPS
│  └─ Use reverse proxy with SSL
│
├─ Rate Limiting:
│  ├─ Nginx: limit_req directive
│  ├─ Per IP: max requests/sec
│  └─ Per-endpoint protection
│
├─ DDoS Protection:
│  ├─ Cloudflare or similar CDN
│  ├─ WAF rules
│  └─ Traffic shaping
│
├─ Secrets in Logs:
│  ├─ Never log Authorization header (contains token)
│  ├─ Sanitize user passwords from request logs
│  └─ Use structured logging with sensitive field masking
│
└─ Database Encryption:
   ├─ PostgreSQL SSL: Force encrypted connections
   ├─ Data at rest: Enable encryption
   └─ Backup encryption: Encrypt backup files
```

---

## Troubleshooting Guide

### Common Issues & Solutions

```
Issue: 503 Service Unavailable
├─ Cause 1: Auth Service Down
│  ├─ Check: docker ps | grep auth-service
│  ├─ Check: curl http://localhost:8001/health
│  └─ Solution: docker-compose restart auth-service
│
├─ Cause 2: Circuit Breaker OPEN
│  ├─ Indication: Cuti Service /health shows CB state=OPEN
│  ├─ Cause: 5+ failures to Auth Service
│  ├─ Solution: Wait 30s for cooldown, or restart Auth Service
│  └─ Check: curl http://localhost:8002/health
│
└─ Cause 3: Auth Database Down
   ├─ Check: curl http://localhost:8001/health
   ├─ Check: docker logs simcuti-auth-db
   └─ Solution: docker-compose restart auth-db

Issue: 401 Unauthorized
├─ Cause 1: Missing token
│  ├─ Check: localStorage.getItem('simcuti_token') in browser console
│  └─ Solution: Login again
│
├─ Cause 2: Token expired
│  ├─ Check: JWT expiry time (30 minutes default)
│  ├─ Solution: Login again to refresh
│  └─ Future: Implement token refresh endpoint
│
└─ Cause 3: Invalid signature
   ├─ Cause: SECRET_KEY mismatch or token tampered
   └─ Solution: Use fresh token from login

Issue: Database Connection Error
├─ Cause 1: PostgreSQL not running
│  ├─ Check: docker ps | grep auth-db
│  └─ Solution: docker-compose up -d auth-db
│
├─ Cause 2: Wrong database URL
│  ├─ Check: echo $DATABASE_URL in service container
│  └─ Solution: Verify environment variables in docker-compose.yml
│
├─ Cause 3: Connection pool exhausted
│  ├─ Check: Active connections in PostgreSQL
│  ├─ Cause: Slow queries or connection leak
│  └─ Solution: Restart service or optimize queries
│
└─ Cause 4: Disk full or memory limit
   ├─ Check: docker stats
   └─ Solution: Increase resource limits or clean up

Issue: Slow Response Time
├─ Cause 1: Network latency
│  ├─ Check: Latency metrics from /metrics endpoint
│  └─ Solution: Check Docker network, optimize routes
│
├─ Cause 2: Database query slow
│  ├─ Check: PostgreSQL logs
│  ├─ Solution: Add indexes, optimize SQL
│  └─ Check: EXPLAIN ANALYZE <query>
│
├─ Cause 3: Circuit breaker retry delays
│  ├─ Check: Cuti Service /health for CB state
│  ├─ Cause: Auth Service slow/unavailable
│  └─ Solution: Fix Auth Service performance
│
└─ Cause 4: Request logging overhead
   ├─ Solution: Disable verbose logging in production
   └─ Switch to async logging

Issue: CORS Error
├─ Cause 1: Frontend not in CORS_ORIGINS
│  ├─ Check: docker-compose.yml CORS_ORIGINS env var
│  ├─ Solution: Add frontend URL to CORS_ORIGINS
│  └─ Restart services: docker-compose restart
│
└─ Cause 2: Nginx not proxying headers
   ├─ Check: services/gateway/nginx.conf
   ├─ Solution: Ensure proxy_set_header directives present
   └─ Test: curl -v http://localhost/auth/health

Issue: Cuti Service Can't Reach Auth Service
├─ Cause 1: Service name mismatch
│  ├─ Check: AUTH_SERVICE_URL=http://auth-service:8001
│  ├─ Check: docker network inspect simcuti-network
│  └─ Solution: Verify service name in docker-compose.yml
│
├─ Cause 2: Network isolation
│  ├─ Check: Both services on simcuti-network?
│  ├─ Solution: Verify docker-compose networks section
│  └─ Test: docker exec simcuti-cuti-service ping auth-service
│
└─ Cause 3: Auth Service not ready
   ├─ Check: depends_on health check passing
   └─ Solution: Wait for health check before starting Cuti Service
```

---

## Environment Variable Reference

### All Required Environment Variables

```bash
# Auth Service
export DATABASE_URL="postgresql://postgres:postgres123@auth-db:5432/auth_db"
export SECRET_KEY="super-secret-key"  # Change in production!
export SERVICE_NAME="auth-service"
export LOG_LEVEL="INFO"
export TOKEN_EXPIRE_MINUTES="30"
export CORS_ORIGINS="http://localhost:5173"

# Cuti Service
export DATABASE_URL="postgresql://postgres:postgres123@cuti-db:5432/cuti_db"
export AUTH_SERVICE_URL="http://auth-service:8001"
export SERVICE_NAME="item-service"
export LOG_LEVEL="INFO"
export CORS_ORIGINS="http://localhost:5173"

# Frontend
export VITE_API_URL="http://localhost"
export VITE_API_PROXY_TARGET="http://localhost:8000"

# Database (PostgreSQL)
export POSTGRES_USER="postgres"
export POSTGRES_PASSWORD="postgres123"  # Change in production!
export POSTGRES_DB="auth_db" or "cuti_db"

# Docker Compose
export COMPOSE_PROJECT_NAME="simcuti"
```

---

**Document Version**: 1.0  
**Purpose**: Quick reference for architecture, troubleshooting, and visualization  
**Status**: Complete
