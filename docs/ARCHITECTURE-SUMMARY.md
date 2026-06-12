# SIMCUTI Architecture Analysis - Executive Summary

**Created**: 2026-06-12  
**Project**: SIMCUTI - Sistem Manajemen Cuti Karyawan (Leave Management System)  
**Deliverables**: Complete microservices architecture documentation for accurate diagram design

---

## 📋 Analysis Findings Summary

### ✅ Documentation Completed

This comprehensive analysis has produced **4 detailed documentation files**:

1. **[ARCHITECTURE-DETAILED.md](ARCHITECTURE-DETAILED.md)** ⭐ PRIMARY REFERENCE
   - Complete service breakdown
   - Port & hostname mapping
   - Database schemas
   - Health check endpoints
   - Reliability patterns
   - API endpoints reference
   - Deployment configurations

2. **[ARCHITECTURE-QUICK-REFERENCE.md](ARCHITECTURE-QUICK-REFERENCE.md)** ⭐ FOR DIAGRAMS
   - Service inventory matrix
   - Communication flows (visual)
   - Dependency graphs
   - Request lifecycle timeline
   - Failure scenarios
   - Network topology
   - Troubleshooting guide

3. **[SERVICE-COMMUNICATION-MATRIX.md](SERVICE-COMMUNICATION-MATRIX.md)** ⭐ API REFERENCE
   - Request/response examples
   - HTTP status codes
   - Error responses
   - Database queries
   - Latency expectations
   - Circuit breaker state machine

4. **This File**: Executive Summary

---

## 🏗️ System Architecture at a Glance

### Services Inventory

| Service | Port | Type | Database | Key Pattern |
|---------|------|------|----------|------------|
| Auth Service | 8001 | FastAPI | auth_db | JWT, Bcrypt |
| Cuti/Item Service | 8002 | FastAPI | cuti_db | HTTP calls, Circuit Breaker |
| Frontend | 3000/80 | React+Vite | None | SPA, Token storage |
| API Gateway | 80 | Nginx | None | Reverse proxy, routing |
| Databases | 5432 (internal) | PostgreSQL | N/A | Separate per service |

### Communication Architecture

```
Frontend (React/Browser)
    ↓ HTTP/REST via Nginx Gateway
    ├─ /auth/register, /login, /me → Auth Service
    ├─ /items → Cuti Service
    └─ / → Frontend Static

Cuti Service
    ↓ HTTP/REST with Retry & Circuit Breaker
    └─ GET /verify → Auth Service (for token validation)

Auth Service
    ↓ SQL
    └─ auth_db (PostgreSQL)

Cuti Service  
    ↓ SQL
    └─ cuti_db (PostgreSQL)
```

---

## 🔑 Critical Information for Diagram Design

### 1. Service Dependencies

**Layer 1 (Frontend)**
- React SPA
- Client-side token storage
- Auto-attach Bearer token to requests

**Layer 2 (API Gateway)**
- Nginx reverse proxy
- Routes requests to services
- No business logic

**Layer 3 (API Services)**
- Auth Service: User authentication
- Cuti Service: Leave management
- Inter-service communication: Cuti → Auth

**Layer 4 (Databases)**
- auth_db: User credentials & auth data
- cuti_db: Leave/item data
- No inter-database communication

### 2. Data Flow (Request Path)

**Create Item Example:**
```
Frontend
  ↓ POST /items + Bearer token
Nginx Gateway
  ↓ Route to :8002
Cuti Service (Request Middleware)
  ↓ Extract token
Circuit Breaker Check
  ↓ Can execute?
HTTP Call to Auth Service
  ↓ GET /verify + token
Auth Service
  ↓ Decode JWT
auth_db Query
  ↓ Validate token
Response to Cuti Service
  ↓ User ID extracted
Cuti Service: DB Insert
  ↓ INSERT into items
cuti_db
  ↓ Write complete
Response to Gateway
  ↓ 201 Created
Response to Frontend
  ↓ Display to user
```

**Total Time**: 15-30ms (normal), 11.5+ seconds (if retry triggered)

### 3. Reliability Patterns

**Circuit Breaker (Cuti Service → Auth Service)**
- States: CLOSED → OPEN → HALF_OPEN → CLOSED
- Threshold: 5 failures
- Cooldown: 30 seconds
- Effect: Fail-fast at 503 when OPEN

**Retry with Exponential Backoff**
- Attempts: 3 maximum
- Backoff: 0.5s, 1.0s, 2.0s
- Retryable: 5xx + timeout
- Non-retryable: 401, 400, 404

**Aggregated Health Checks**
- Status: healthy, degraded, unhealthy
- Includes: CB state + DB connection
- Endpoint: GET /health

**Correlation ID Tracing**
- Header: X-Correlation-ID
- Format: 12-char hex
- Forwarded: Cuti → Auth
- Logged: Every request

---

## 📊 Key Metrics & Thresholds

### Per-Service Metrics Available

```
Endpoint: GET /<service>:port/metrics

Metrics Collected:
├─ request_count (total requests)
├─ error_count (4xx + 5xx responses)
├─ error_rate_percent
├─ latency: avg, p95, p99 (milliseconds)
├─ status_codes: breakdown by code
├─ endpoint_stats: per-endpoint performance
└─ error_alerting: active alert status

Example Thresholds:
├─ Error Rate > 5% → Alert
├─ Response Time p99 > 2s → Warning
├─ Circuit Breaker OPEN → Alert
└─ Database Disconnected → Critical
```

---

## 🔐 Security Architecture

### Authentication Flow
```
User Input (email, password)
    ↓
Auth Service /login
    ├─ Query: Find user by email
    ├─ Compare: bcrypt password verification
    ├─ Generate: JWT token (HS256)
    └─ Return: access_token + user info
    ↓
Frontend: localStorage.setItem('simcuti_token')
    ↓
Subsequent Requests:
    ├─ Header: Authorization: Bearer <token>
    ├─ Cuti Service receives request
    ├─ Extract token from header
    ├─ Call Auth Service /verify
    ├─ Auth Service: Decode JWT
    ├─ Return: user_id + exp + payload
    └─ Cuti Service: Use user_id for queries

On 401 Response:
    ├─ Frontend: localStorage.removeItem('simcuti_token')
    ├─ Frontend: localStorage.removeItem('simcuti_user')
    └─ Redirect: Login page
```

### Current Security Gaps ⚠️
- Tokens in localStorage (XSS vulnerable)
- HTTP-only (no HTTPS in dev/current prod)
- Default credentials: postgres/postgres123
- No rate limiting
- No request signing/MAC

### Recommendations
- Implement HTTP-only secure cookies
- Add HTTPS/TLS encryption
- Rotate secrets regularly
- Add rate limiting at gateway
- Consider mutual TLS for service-to-service

---

## 🚀 Deployment Configurations

### Development (docker-compose.dev.yml)
```bash
# Hot-reload enabled
# Frontend HMR: localhost:5173
# Services accessible: localhost:8001, localhost:8002
# Gateway: localhost:80

Command:
make dev
or
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production (docker-compose.prod.yml)
```bash
# Auto-restart enabled
# Databases not exposed to host
# CORS restricted to production domain
# DEBUG mode disabled

Command:
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

### Resource Limits (Total: 3.75 CPU, 2.5GB RAM)
```
auth-db:     0.50 CPU, 512MB RAM
cuti-db:     0.50 CPU, 512MB RAM
auth-service: 1.00 CPU, 512MB RAM
cuti-service: 1.00 CPU, 512MB RAM
frontend:     0.50 CPU, 256MB RAM
gateway:      0.25 CPU, 128MB RAM
```

---

## 📈 Current Limitations & Scaling Path

### Single-Instance Bottlenecks
- Each service runs in 1 container
- No load balancing between replicas
- Single database instance per database
- Gateway is single point of entry

### Horizontal Scaling Approach
1. **Multiple service instances** + Load balancer
2. **Service discovery** (Consul, Eureka, K8s)
3. **Database replicas** for read scaling
4. **Redis caching** for token & frequent queries
5. **Connection pooling** (PgBouncer)

### Vertical Scaling
- Increase CPU/memory limits
- Optimize database queries
- Add indexes on frequently queried columns
- Implement query caching

---

## 🔍 Observability Strategy

### Logging
- Structured JSON logging
- Correlation ID tracking
- Per-request middleware
- Error rate monitoring

### Metrics
- In-memory collector (per service)
- Per-endpoint statistics
- Latency percentiles (p95, p99)
- Status code distribution

### Health Checks
- Service health endpoints (/health)
- Dependency aggregation
- Database connectivity
- Circuit breaker status

### Recommended Additions
- Centralized log aggregation (ELK, Loki)
- Distributed tracing (Jaeger, OpenTelemetry)
- Metrics backend (Prometheus)
- Alerting system (Alert manager)
- APM tool (New Relic, DataDog)

---

## 🎯 Key Features for Diagram

### Must Show
1. ✅ Frontend component (React SPA)
2. ✅ Nginx Gateway with routing
3. ✅ Auth Service with JWT
4. ✅ Cuti Service with DB access
5. ✅ Separate databases (auth_db, cuti_db)
6. ✅ Cuti → Auth communication path
7. ✅ Circuit breaker icon/indicator
8. ✅ Health check paths
9. ✅ Port numbers and protocols
10. ✅ Docker network boundary

### Optional (Advanced)
1. Retry/exponential backoff visualization
2. Circuit breaker state transitions
3. Correlation ID flow
4. Metrics collection
5. Error alerting system
6. Request lifecycle timeline

---

## 📝 Documentation File Structure

```
docs/
├─ ARCHITECTURE-DETAILED.md (20 sections)
│  └─ Complete technical reference
│
├─ ARCHITECTURE-QUICK-REFERENCE.md (visual guides)
│  ├─ Service matrices
│  ├─ Communication flows
│  ├─ Dependency graphs
│  ├─ Timeline diagrams
│  └─ Troubleshooting
│
├─ SERVICE-COMMUNICATION-MATRIX.md (API reference)
│  ├─ Request/response examples
│  ├─ HTTP status codes
│  ├─ Error handling
│  ├─ Database queries
│  └─ Circuit breaker state machine
│
└─ This File (executive summary)
```

---

## ✨ Quick Facts

| Aspect | Detail |
|--------|--------|
| **Language** | Python (FastAPI) + JavaScript (React) |
| **Protocol** | HTTP/REST (no gRPC, GraphQL, etc.) |
| **Auth Method** | JWT (HS256) |
| **Token Expiry** | 30 minutes |
| **Password Hashing** | Bcrypt (passlib) |
| **Database** | PostgreSQL 16-alpine |
| **Containerization** | Docker + Docker Compose |
| **Network** | Docker bridge (simcuti-network) |
| **API Gateway** | Nginx (reverse proxy) |
| **Frontend Framework** | React + Vite |
| **Build Tool** | Vite (hot reload in dev) |
| **Logging** | JSON structured logging |
| **Metrics** | In-memory collector |
| **Health Checks** | HTTP endpoints + aggregation |
| **Reliability** | Circuit breaker + Retry logic |
| **CI/CD** | GitHub Actions |
| **Deployment** | Railway / Render (mentioned in docs) |
| **Database Pattern** | Database per Service |
| **API Pattern** | REST |
| **Data Consistency** | Eventual consistency (no transactions across services) |

---

## 🎓 How to Use This Documentation

### For Architecture Diagrams
1. Start with **ARCHITECTURE-QUICK-REFERENCE.md** - Communication flows & visual matrices
2. Reference **ARCHITECTURE-DETAILED.md** - Port mappings & dependencies
3. Add circuit breaker & retry indicators from **SERVICE-COMMUNICATION-MATRIX.md**

### For API Testing
1. Use **SERVICE-COMMUNICATION-MATRIX.md** - Request/response examples
2. Reference auth flows and error codes
3. Test with provided cURL/HTTP examples

### For Deployment
1. Follow **ARCHITECTURE-DETAILED.md** - Deployment configurations section
2. Use environment variables from quick reference
3. Resource limits for sizing

### For Troubleshooting
1. Check **ARCHITECTURE-QUICK-REFERENCE.md** - Common issues & solutions
2. Verify service communication paths
3. Use health check endpoints

### For Team Documentation
1. Share **This file** - Executive overview
2. Provide **ARCHITECTURE-DETAILED.md** - Technical reference
3. Use visuals from **ARCHITECTURE-QUICK-REFERENCE.md** - For presentations

---

## 📞 How to Verify Architecture

### Quick Verification Checklist

```bash
# 1. Check Docker containers running
docker ps | grep simcuti

# 2. Verify network connectivity
docker exec simcuti-cuti-service ping auth-service

# 3. Test auth endpoint
curl http://localhost:8001/health

# 4. Test cuti endpoint  
curl http://localhost:8002/health

# 5. Test gateway
curl http://localhost/health

# 6. Check metrics
curl http://localhost:8001/metrics | jq .

# 7. Verify database connection
docker exec simcuti-auth-db psql -U postgres -d auth_db -c "SELECT 1"

# 8. Test full flow
# 8a. Register
curl -X POST http://localhost/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","name":"Test","password":"test123"}'

# 8b. Login
curl -X POST http://localhost/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d 'username=test@test.com&password=test123'

# 8c. Create item (with token from 8b)
curl -X POST http://localhost/items \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Item","price":0,"quantity":5}'
```

---

## 📦 What's Included in This Analysis

✅ **Services**: All 6 services documented (2 DBs + 2 APIs + 1 Frontend + 1 Gateway)  
✅ **Ports**: Complete port mapping (dev & prod)  
✅ **Communication**: All inter-service paths documented  
✅ **Databases**: Schema for both databases  
✅ **API Endpoints**: All endpoints with examples  
✅ **Health Checks**: All health check paths  
✅ **Reliability**: Circuit breaker, retry, correlation ID  
✅ **Monitoring**: Metrics collection details  
✅ **Deployment**: Dev & prod configurations  
✅ **Security**: Auth flow & recommendations  
✅ **Troubleshooting**: Common issues & solutions  
✅ **Examples**: Request/response examples  
✅ **Diagrams**: Multiple visual references  
✅ **Timeline**: Request lifecycle visualization  
✅ **Scaling**: Future scaling considerations  

---

## 🔗 Related Files in Repository

- [docker-compose.yml](../docker-compose.yml) - Main configuration
- [docker-compose.dev.yml](../docker-compose.dev.yml) - Dev overrides
- [docker-compose.prod.yml](../docker-compose.prod.yml) - Prod overrides
- [services/auth-service/main.py](../services/auth-service/main.py) - Auth API
- [services/item-service/main.py](../services/item-service/main.py) - Cuti API
- [services/item-service/auth_client.py](../services/item-service/auth_client.py) - Retry logic
- [services/item-service/circuit_breaker.py](../services/item-service/circuit_breaker.py) - CB implementation
- [services/gateway/nginx.conf](../services/gateway/nginx.conf) - Gateway routes
- [frontend/vite.config.js](../frontend/vite.config.js) - Frontend config

---

## 📄 Document Versions

| File | Version | Status | Last Updated |
|------|---------|--------|--------------|
| ARCHITECTURE-DETAILED.md | 1.0 | Complete | 2026-06-12 |
| ARCHITECTURE-QUICK-REFERENCE.md | 1.0 | Complete | 2026-06-12 |
| SERVICE-COMMUNICATION-MATRIX.md | 1.0 | Complete | 2026-06-12 |
| ARCHITECTURE-SUMMARY.md (this) | 1.0 | Complete | 2026-06-12 |

---

## 🎉 Summary

This comprehensive architecture analysis provides **everything needed** to:
- ✅ Create accurate architecture diagrams
- ✅ Understand service communication patterns
- ✅ Deploy the application correctly
- ✅ Monitor and troubleshoot issues
- ✅ Plan for future scaling
- ✅ Implement additional features

**All information is verified from actual source code and configuration files.**

---

**Analysis Completed**: 2026-06-12  
**Ready for**: Diagram Design, Documentation, Deployment, Troubleshooting  
**Confidence Level**: High (verified from source code)  
**Last Verified**: 2026-06-12
