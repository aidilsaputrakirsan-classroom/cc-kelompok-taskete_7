# SIMCUTI Microservices Architecture - Detailed Breakdown

**Last Updated**: 2026-06-12  
**Project**: SIMCUTI - Sistem Manajemen Cuti Karyawan  
**Type**: Leave Management System for HR

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Services Breakdown](#services-breakdown)
3. [Port & Hostname Mapping](#port--hostname-mapping)
4. [Database Schema](#database-schema)
5. [Frontend Communication](#frontend-communication)
6. [Health Check Endpoints](#health-check-endpoints)
7. [Reliability Patterns](#reliability-patterns)
8. [Service-to-Service Communication](#service-to-service-communication)
9. [API Endpoints Reference](#api-endpoints-reference)
10. [Deployment Configurations](#deployment-configurations)

---

## Architecture Overview

### High-Level Architecture Diagram
```
┌─────────────────────────────────────────────────────────────────┐
│                     SIMCUTI Microservices                        │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │               API Gateway (Nginx)                         │   │
│  │  Listening on: Port 80 (External)                        │   │
│  │  Routes: /auth → Auth Service                            │   │
│  │          /items → Item Service                           │   │
│  │          / → Frontend                                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│              ┌───────────────┼───────────────┐                   │
│              │               │               │                   │
│          ┌───▼───┐       ┌───▼────┐    ┌────▼─────┐            │
│          │ Auth  │       │ Cuti   │    │ Frontend  │            │
│          │Service│       │Service │    │  (React)  │            │
│          │:8001  │       │ :8002  │    │  :3000    │            │
│          └───────┘       └────────┘    └───────────┘            │
│              │               │                │                   │
│          ┌───▼─────┐     ┌──▼────────┐      │                   │
│          │ auth_db │     │  cuti_db  │      │                   │
│          │ (Postgres)    │(Postgres) │      │                   │
│          └─────────┘     └───────────┘      │                   │
│                                              │                   │
│         ┌────────────────────────────────────┴──────┐            │
│         │  Docker Bridge Network: simcuti-network   │            │
│         └─────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

### System Components
- **API Gateway**: Routes incoming requests to appropriate services
- **Auth Service**: Handles user authentication, JWT token generation & verification
- **Cuti Service (Item Service)**: Manages leave requests & item operations
- **Frontend**: React SPA served through Nginx
- **Databases**: Separate PostgreSQL instances per service (Database per Service pattern)
- **Network**: Docker bridge for internal service communication

---

## Services Breakdown

### 1. AUTH SERVICE

#### Overview
- **Purpose**: User authentication, token management, user verification
- **Technology**: FastAPI + Uvicorn
- **Container Name**: `simcuti-auth-service`
- **Internal Port**: 8001
- **External Port**: 8001 (via Gateway → 80/auth)

#### Environment Variables
```
DATABASE_URL: postgresql://postgres:postgres123@auth-db:5432/auth_db
SECRET_KEY: super-secret-key
SERVICE_NAME: auth-service
LOG_LEVEL: INFO
CORS_ORIGINS: http://localhost:5173 (dev)
TOKEN_EXPIRE_MINUTES: 30
```

#### Database: `auth_db`
- **Engine**: PostgreSQL 16-alpine
- **Container**: `simcuti-auth-db`
- **Port**: 5432 (internal only in prod)
- **Credentials**: postgres / postgres123
- **Volume**: `auth_db_data:/var/lib/postgresql/data`

#### Database Tables

**Table: users**
```
id (PK)              : Integer, Primary Key
email (UK)           : String, Unique, Indexed
name                 : String, Not Null
hashed_password      : String (bcrypt), Not Null
created_at           : DateTime(timezone), Server Default (now)
```

#### Endpoints

| Method | Endpoint | Auth | Response | Description |
|--------|----------|------|----------|-------------|
| POST | `/register` | ❌ | UserResponse (201) | Register new user |
| POST | `/login` | ❌ | TokenResponse | Login & get JWT token |
| GET | `/verify` | ✅ Bearer | TokenVerifyResponse | Verify token (internal) |
| GET | `/health` | ❌ | HealthStatus | Health check |
| GET | `/metrics` | ❌ | MetricsData | Service metrics |
| GET | `/me` | ✅ Bearer | UserResponse | Get current user info |

#### Key Features
- **JWT Token Generation**: HS256, 30-minute expiry
- **Password Hashing**: Bcrypt via passlib
- **Structured Logging**: Correlation ID tracking
- **Metrics**: Request count, error rate, latency
- **Error Alerting**: Error rate monitoring

#### Dependencies
- fastapi==0.115.6
- uvicorn==0.34.0
- sqlalchemy==2.0.36
- psycopg2-binary==2.9.10
- bcrypt==4.1.2
- passlib[bcrypt]==1.7.4
- pyjwt==2.10.1
- pydantic[email]==2.10.4

---

### 2. CUTI SERVICE (Item Service)

#### Overview
- **Purpose**: Leave/Item management with CRUD operations
- **Technology**: FastAPI + Uvicorn
- **Container Name**: `simcuti-cuti-service`
- **Internal Port**: 8002
- **External Port**: 8002 (via Gateway → 80/items)

#### Environment Variables
```
DATABASE_URL: postgresql://postgres:postgres123@cuti-db:5432/cuti_db
AUTH_SERVICE_URL: http://auth-service:8001
SERVICE_NAME: item-service
LOG_LEVEL: INFO
CORS_ORIGINS: http://localhost:5173 (dev)
```

#### Database: `cuti_db`
- **Engine**: PostgreSQL 16-alpine
- **Container**: `simcuti-cuti-db`
- **Port**: 5432 (internal only in prod)
- **Credentials**: postgres / postgres123
- **Volume**: `cuti_db_data:/var/lib/postgresql/data`

#### Database Tables

**Table: items**
```
id (PK)              : Integer, Primary Key
name                 : String, Indexed, Not Null
description          : String, Default ""
price                : Float, Not Null
quantity             : Integer, Default 0
owner_id             : Integer, Not Null (Reference to Auth Service users)
created_at           : DateTime(timezone), Server Default (now)
updated_at           : DateTime(timezone), On Update (now)
```

#### Endpoints

| Method | Endpoint | Auth | Response | Description |
|--------|----------|------|----------|-------------|
| POST | `/items` | ✅ Bearer | ItemResponse (201) | Create new item |
| GET | `/items` | ✅ Bearer | ItemListResponse | List user's items (paginated) |
| GET | `/items/public` | ❌ | ItemListResponse | List all public items |
| GET | `/items/stats` | ✅ Bearer | ItemStatsResponse | Get user statistics |
| GET | `/items/{id}` | ✅ Bearer | ItemResponse | Get specific item |
| PUT | `/items/{id}` | ✅ Bearer | ItemResponse | Update item |
| DELETE | `/items/{id}` | ✅ Bearer | 204 No Content | Delete item |
| GET | `/health` | ❌ | HealthStatus + Dependencies | Health check with aggregated status |
| GET | `/metrics` | ❌ | MetricsData | Service metrics |

#### Key Features
- **Token Verification**: Calls Auth Service via HTTP with retry/circuit breaker
- **Circuit Breaker**: Protects against Auth Service failures
- **Exponential Backoff Retry**: 3 retries with exponential delay
- **Correlation ID Tracking**: X-Correlation-ID header forwarding
- **Aggregated Health Check**: Includes Auth Service & DB status
- **Structured Logging**: Per-request metrics & correlation IDs
- **Database Per Service**: Isolated `cuti_db` database

#### Dependencies
- fastapi==0.115.6
- uvicorn==0.34.0
- sqlalchemy==2.0.36
- psycopg2-binary==2.9.10
- httpx==0.28.1
- pydantic==2.10.4

---

### 3. FRONTEND

#### Overview
- **Purpose**: User interface for leave management
- **Technology**: React 18+ with Vite
- **Container Name**: `simcuti-frontend`
- **Internal Port**: 3000
- **External Port**: 3000 (via Gateway → 80)

#### Environment Variables
```
VITE_API_URL: http://localhost (dev)
VITE_API_PROXY_TARGET: http://localhost:8000 (fallback)
NODE_ENV: production/development
```

#### Build & Deployment
- **Build Target**: Docker multi-stage build
- **Base Image**: Node:18-alpine (builder)
- **Serve With**: Nginx:alpine
- **Static Files**: Served on port 80
- **Dev Mode**: Vite dev server on port 5173

#### Features
- **Vite Proxy Configuration**: Proxies `/api` requests to backend
- **Token Management**: Stores JWT in localStorage (`simcuti_token`)
- **Auto-attach Authorization**: Request interceptor adds Bearer token
- **Auto-logout**: Removes token on 401 responses
- **Service Status Monitoring**: Listens to API health/degraded events
- **Error Handling**: Catches 502/503/504 and network errors

#### API Communication Layer

**File**: `src/services/api.js`
```javascript
// Token Management
setToken(token)
getToken()
clearToken()

// Auth Endpoints
register(userData)
login(email, password)
getMe()

// Items/Leaves Endpoints
fetchItems(search, skip, limit)
createItem(data)
updateItem(id, data)
deleteItem(id)
getItemStats()
```

**File**: `src/api/index.js`
```javascript
// Axios-based alternative API layer
api.create({ baseURL, headers, timeout: 15000 })
api.interceptors.request.use() // Auto-attach token
api.interceptors.response.use() // Handle 401, service degradation

authAPI.register()
authAPI.login()
authAPI.me()

leavesAPI.create()
leavesAPI.list()
leavesAPI.update()
leavesAPI.delete()
```

#### Health Monitoring
- Listens to custom events: `api-service-degraded`, `api-service-healthy`, `api-service-unavailable`
- UI can display service status to users
- Automatic retry on network failures

---

### 4. API GATEWAY (Nginx)

#### Overview
- **Purpose**: Request routing, load balancing, SSL termination (future)
- **Technology**: Nginx:alpine
- **Container Name**: `simcuti-gateway`
- **Port**: 80 (External)

#### Configuration File: `services/gateway/nginx.conf`

#### Route Mappings

```nginx
Upstream Services:
├── auth-service (upstream to 8001)
└── cuti-service (upstream to 8002)
└── frontend (upstream to 80)

Route Rules:
├── /auth/       → auth-service:8001
├── /auth/metrics → auth-service:8001/metrics
├── /items/      → cuti-service:8002
├── /items/health → cuti-service:8002/health
├── /items/metrics → cuti-service:8002/metrics
├── /health      → Gateway health response (200 OK)
└── /           → frontend (static content)
```

#### Key Features
- **Reverse Proxy**: Hides backend services
- **Header Forwarding**: X-Real-IP, X-Forwarded-For, Authorization
- **Connection Upgrade**: WebSocket support (via Upgrade/Connection headers)
- **No CORS Issues**: Gateway on same origin as frontend

#### Resource Limits
- CPU: 0.25 cores
- Memory: 128MB

---

## Port & Hostname Mapping

### Development Environment (docker-compose.dev.yml)

```
┌─────────────────────────────────────────────────────────┐
│         Development - Localhost (127.0.0.1)             │
├─────────────────────────────────────────────────────────┤
│ User Access                                              │
│  ├─ Gateway (HTTP API)  : http://localhost              │
│  ├─ Frontend (HMR)      : http://localhost:5173         │
│                                                          │
│ Direct Service Access (for debugging)                    │
│  ├─ Auth API           : http://localhost:8001          │
│  ├─ Cuti API           : http://localhost:8002          │
│  ├─ Frontend (nginx)   : http://localhost:3000          │
│                                                          │
│ Internal Docker Network (simcuti-network)                │
│  ├─ auth-service       : http://auth-service:8001       │
│  ├─ cuti-service       : http://cuti-service:8002       │
│  ├─ auth-db            : postgres://auth-db:5432        │
│  ├─ cuti-db            : postgres://cuti-db:5432        │
│  └─ frontend           : http://frontend:80             │
└─────────────────────────────────────────────────────────┘
```

### Production Environment (docker-compose.prod.yml)

```
┌─────────────────────────────────────────────────────────┐
│       Production - Single Entry Point                   │
├─────────────────────────────────────────────────────────┤
│ User Access (Public)                                     │
│  └─ Gateway (HTTP)     : http://<domain>:80             │
│                                                          │
│ Internal Docker Network (simcuti-network - isolated)     │
│  ├─ auth-service       : http://auth-service:8001       │
│  ├─ cuti-service       : http://cuti-service:8002       │
│  ├─ auth-db            : postgres://auth-db:5432        │
│  ├─ cuti-db            : postgres://cuti-db:5432        │
│  └─ frontend           : http://frontend:80             │
│                                                          │
│ Database Ports NOT Exposed to host                       │
└─────────────────────────────────────────────────────────┘
```

### Container Network: `simcuti-network` (Bridge)

| Service | Internal Hostname | Port | Protocol | Accessible From |
|---------|------------------|------|----------|-----------------|
| auth-service | auth-service | 8001 | HTTP | cuti-service, gateway |
| auth-db | auth-db | 5432 | TCP | auth-service only |
| cuti-service | cuti-service | 8002 | HTTP | gateway |
| cuti-db | cuti-db | 5432 | TCP | cuti-service only |
| frontend | frontend | 80 | HTTP | gateway |
| gateway | gateway | 80 | HTTP | External (0.0.0.0:80) |

---

## Database Schema

### Database 1: `auth_db` (Auth Service)

#### Users Table

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR UNIQUE NOT NULL INDEXED,
    name VARCHAR NOT NULL,
    hashed_password VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Relationships**: 
- User ID is referenced by `items.owner_id` in `cuti_db`
- No foreign key (Database per Service pattern)

---

### Database 2: `cuti_db` (Cuti/Item Service)

#### Items Table

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL INDEXED,
    description VARCHAR DEFAULT '',
    price FLOAT NOT NULL,
    quantity INTEGER DEFAULT 0,
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- owner_id references users table in auth_db (denormalized, not FK)
```

**Data Consistency**: 
- Queries auth-service to verify `owner_id` validity
- No foreign key constraint (services are independently deployable)

---

## Frontend Communication

### API Base URL Configuration

**Development** (via Vite proxy):
```
VITE_API_URL: http://localhost
Requests to /api/* → Proxy to VITE_API_PROXY_TARGET
```

**Production** (via Nginx gateway):
```
VITE_API_URL: http://localhost (or deployment domain)
All requests routed through Nginx gateway
```

### Request Flow

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React)                                             │
│  ├─ src/services/api.js (Fetch API)                         │
│  └─ src/api/index.js (Axios)                                │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─ localStorage: simcuti_token
             └─ localStorage: simcuti_user
                              │
             ┌────────────────┴────────────────┐
             │ Request Interceptor             │
             │ Add Authorization header        │
             │ Add X-Correlation-ID (future)   │
             └────────────────┬────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │ Nginx Gateway     │
                    │ Port 80           │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼────────────────────┐
        │                     │                    │
    ┌───▼────┐          ┌────▼──────┐        ┌───▼──┐
    │ /auth/* │          │ /items/*  │        │ /*   │
    │         │          │           │        │      │
    └───┬────┘          └────┬──────┘        └───┬──┘
        │                    │                    │
    Auth Service         Cuti Service         Frontend
    (8001)               (8002)              (80)
```

### Authentication Flow

```
┌────────────────────────────────────────────────────────┐
│ Frontend Auth Flow                                      │
├────────────────────────────────────────────────────────┤
│                                                         │
│ 1. User Login                                          │
│    POST /auth/login { email, password }               │
│    ↓                                                   │
│ 2. Backend Response                                    │
│    ← { access_token, token_type, user }              │
│    ↓                                                   │
│ 3. Store Token                                         │
│    localStorage.setItem('simcuti_token', access_token)│
│    ↓                                                   │
│ 4. Subsequent Requests                                │
│    Add header: Authorization: Bearer <token>          │
│    ↓                                                   │
│ 5. Token Verification (Per Request)                   │
│    Cuti Service → Auth Service /verify                │
│    ↓                                                   │
│ 6. Token Expired/Invalid                              │
│    Backend returns 401                                │
│    ↓                                                   │
│ 7. Frontend Action (401 Handler)                      │
│    localStorage.removeItem('simcuti_token')           │
│    localStorage.removeItem('simcuti_user')            │
│    Redirect to login page                             │
│    ↓                                                   │
│ 8. Logout                                              │
│    Clear token & redirect                             │
│                                                        │
└────────────────────────────────────────────────────────┘
```

---

## Health Check Endpoints

### Unified Health Endpoints

| Service | Endpoint | Response Type | Check Interval | Timeout |
|---------|----------|---------------|----------------|---------|
| auth-db | /health | `pg_isready` command | 10s | 5s (max 5 retries) |
| cuti-db | /health | `pg_isready` command | 10s | 5s (max 5 retries) |
| auth-service | /health | HTTP GET | 10s | 5s (max 5 retries) |
| cuti-service | /health | HTTP GET | 10s | 5s (max 5 retries) |
| frontend | /health | curl HTTP GET | 15s | 5s (max 5 retries) |
| gateway | /health | Hardcoded 200 OK | N/A | N/A |

### Health Check Responses

**Auth Service**: `GET /health`
```json
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```

**Cuti Service**: `GET /health`
```json
{
  "status": "healthy|degraded|unhealthy",
  "service": "item-service",
  "version": "2.1.0",
  "dependencies": {
    "auth-service": {
      "status": "available|unavailable",
      "circuit_breaker": {
        "name": "auth-service",
        "state": "CLOSED|OPEN|HALF_OPEN",
        "failure_count": 0,
        "failure_threshold": 5,
        "success_count": 100,
        "total_rejected": 0,
        "cooldown_seconds": 30
      }
    },
    "database": {
      "status": "connected|disconnected",
      "error": null
    }
  }
}
```

**Status Codes**:
- `healthy`: All dependencies OK, service ready
- `degraded`: Some dependency issue (circuit breaker not CLOSED), but service functional
- `unhealthy`: Critical dependency failure (DB disconnected), service non-functional

---

## Reliability Patterns

### 1. Circuit Breaker Pattern

**Implemented in**: Cuti Service → Auth Service communication

**Configuration**:
```python
CircuitBreaker(
    name="auth-service",
    failure_threshold=5,          # Trip after 5 failures
    cooldown_seconds=30,          # Wait 30s before testing recovery
)
```

**States**:
```
CLOSED → OPEN → HALF_OPEN → CLOSED (if success) or OPEN (if fail)

CLOSED (Normal):
  ├─ Forward all requests
  ├─ Count failures
  └─ If failures >= 5 → Go to OPEN

OPEN (Circuit Tripped):
  ├─ Reject all requests immediately (fail fast)
  ├─ Return 503 Service Unavailable
  ├─ Wait for cooldown_seconds
  └─ After cooldown → Go to HALF_OPEN

HALF_OPEN (Testing Recovery):
  ├─ Allow 1 test request to go through
  ├─ If success → Go to CLOSED (reset counters)
  └─ If fail → Go back to OPEN (increase cooldown)
```

**Metrics Tracked**:
- `failure_count`: Current consecutive failures
- `success_count`: Total successful requests
- `total_rejected`: Total requests rejected due to OPEN state

---

### 2. Retry with Exponential Backoff

**Implemented in**: Cuti Service → Auth Service communication

**Configuration**:
```python
MAX_RETRIES = 3
BASE_DELAY = 0.5 seconds
TIMEOUT_SECONDS = 5.0
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}
```

**Retry Logic**:
```
Attempt 1: Request (timeout: 5s)
  └─ Fail (5xx) → Wait 0.5s
                  ↓
Attempt 2: Request (timeout: 5s)
  └─ Fail (5xx) → Wait 1.0s (0.5 * 2)
                  ↓
Attempt 3: Request (timeout: 5s)
  └─ Fail (5xx) → Wait 2.0s (1.0 * 2)
                  ↓
Attempt 4: Request (timeout: 5s)
  └─ Fail (5xx) → Raise HTTPException (503)
                  ↓
Circuit Breaker records failure
```

**Non-Retryable Errors**:
- 401 Unauthorized (invalid token) → Fail immediately
- 400 Bad Request (invalid payload) → Fail immediately
- 404 Not Found → Fail immediately

---

### 3. Correlation ID for Request Tracing

**Propagation**:
```
Request Header: X-Correlation-ID
├─ Generated: uuid.uuid4()[:12] (12-char hex)
├─ Generated by: Frontend (future) or Logging Middleware
├─ Forwarded: Cuti Service → Auth Service
└─ Logged: All service logs + metrics
```

**Tracing Flow**:
```
Frontend Request → Nginx Gateway (add if not exists)
  ↓
Cuti Service (log with correlation_id)
  ├─ Check token with Auth Service (forward header)
  ├─ Log to structured logger (JSON)
  └─ Return response

Auth Service (receive correlation_id)
  ├─ Log verify request (JSON with correlation_id)
  └─ Return response

Frontend (receive response)
  └─ Can track request through all logs
```

---

### 4. Aggregated Health Checks

**Cuti Service Health Check Logic**:

```python
def health_check():
    # Check 1: Auth Service Circuit Breaker
    cb_status = auth_circuit.get_status()
    
    # Check 2: Database Connection
    try:
        db.execute("SELECT 1")
        db_status = "connected"
    except Exception as e:
        db_status = "disconnected"
    
    # Determine Overall Status
    if db_status != "connected":
        overall = "unhealthy"  # Critical
    elif cb_status["state"] != "CLOSED":
        overall = "degraded"   # Warning
    else:
        overall = "healthy"    # OK
    
    return {
        "status": overall,
        "dependencies": {
            "auth-service": cb_status,
            "database": db_status
        }
    }
```

---

### 5. Request Logging Middleware

**Features**:
```
For Each Request:
├─ Correlation ID (generate or extract from header)
├─ Request Method, Path, Headers
├─ Start Time
└─ [Process Request]
   ├─ Response Status
   ├─ Duration (ms)
   └─ Error (if any)

Structured Logging (JSON):
{
  "timestamp": "2026-06-12T10:30:45.123Z",
  "level": "INFO|ERROR|WARNING",
  "service": "item-service",
  "correlation_id": "abc123def456",
  "method": "POST",
  "path": "/items",
  "status": 201,
  "duration_ms": 45,
  "user_id": 5,
  "message": "Item created successfully"
}
```

---

### 6. Metrics Collection

**In-Memory Metrics** (per service):

```python
MetricsCollector:
├─ request_count        : Total requests
├─ error_count          : 4xx + 5xx responses
├─ status_counts        : Per status code (200, 201, 400, 401, etc.)
├─ latencies            : Last 1000 request latencies
├─ endpoint_stats       : Per-endpoint breakdown
│  ├─ POST /items      : count, errors, total_latency_ms
│  ├─ GET /items       : count, errors, total_latency_ms
│  └─ ...
└─ error_alerting       : Error rate monitoring
```

**Metrics Endpoint**: `GET /metrics` (per service)
```json
{
  "service": "item-service",
  "request_count": 1250,
  "error_count": 45,
  "error_rate_percent": 3.6,
  "avg_latency_ms": 12.5,
  "p95_latency_ms": 45,
  "p99_latency_ms": 120,
  "status_codes": {
    "200": 1100,
    "201": 100,
    "400": 25,
    "401": 15,
    "500": 5
  },
  "endpoint_stats": {
    "GET /items": { "count": 500, "errors": 2, "avg_latency_ms": 8 },
    "POST /items": { "count": 100, "errors": 1, "avg_latency_ms": 45 },
    ...
  },
  "error_alerting": {
    "error_rate_percent": 3.6,
    "alert_active": false
  }
}
```

---

## Service-to-Service Communication

### Communication Map

```
Frontend (Browser)
└─ HTTP/REST (via Nginx Gateway)
   ├─ Auth Service
   │  ├─ POST /register
   │  ├─ POST /login
   │  ├─ GET /me
   │  └─ GET /health
   │
   ├─ Cuti Service
   │  ├─ POST /items
   │  ├─ GET /items
   │  ├─ GET /items/{id}
   │  ├─ PUT /items/{id}
   │  ├─ DELETE /items/{id}
   │  ├─ GET /health
   │  └─ GET /metrics
   │
   └─ Nginx Gateway
      └─ GET /health

Cuti Service (Backend)
└─ HTTP/REST (Direct Docker Network Call)
   └─ Auth Service
      ├─ GET /verify (with Bearer token)
      ├─ Retry: 3 attempts, exponential backoff
      └─ Circuit Breaker: 5 failures → cooldown 30s
```

### Cuti Service → Auth Service Communication Details

**Purpose**: Verify JWT token for authenticated requests

**Code**: `services/item-service/auth_client.py`

**Function**: `verify_token_with_auth_service(authorization: str)`

**Flow**:

```python
1. Circuit Breaker Check
   if not auth_circuit.can_execute():
       raise HTTPException(503, "Circuit breaker OPEN")

2. Retry Loop (max 3 attempts)
   for attempt in range(1, 4):
       try:
           headers = {
               "Authorization": authorization,
               "X-Correlation-ID": correlation_id
           }
           response = client.get(
               "http://auth-service:8001/verify",
               headers=headers,
               timeout=5.0
           )

3. Handle Response Status
   if response.status_code == 200:
       auth_circuit.record_success()
       return response.json()  # {"user_id": 5, ...}
   
   elif response.status_code == 401:
       auth_circuit.record_success()  # Service responsive
       raise HTTPException(401, "Invalid token")
   
   elif response.status_code in [500, 502, 503]:
       # Retryable error
       if attempt < MAX_RETRIES:
           wait exponential time
           continue (retry)
       else:
           auth_circuit.record_failure()
           raise HTTPException(503, "Auth service down")

4. Timeout/Exception
   except (httpx.TimeoutException, httpx.ConnectError):
       if attempt < MAX_RETRIES:
           wait and retry
       else:
           auth_circuit.record_failure()
           raise HTTPException(503, "Auth service unreachable")
```

**Example Request**:
```
GET http://auth-service:8001/verify
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
X-Correlation-ID: abc123def456
```

**Example Response**:
```json
{
  "user_id": 5,
  "email": "user@example.com",
  "name": "John Doe",
  "exp": 1718200245
}
```

---

## API Endpoints Reference

### Auth Service API

#### POST /register
```
Request:
  {
    "email": "user@example.com",
    "name": "John Doe",
    "password": "secure_password"
  }

Response (201):
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-06-12T10:30:45.123Z"
  }

Error (400):
  { "detail": "Email already registered" }
```

#### POST /login
```
Request:
  {
    "email": "user@example.com",
    "password": "secure_password"
  }

Response (200):
  {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe"
    }
  }

Error (401):
  { "detail": "Invalid credentials" }
```

#### GET /verify
**Internal Only** (Called by Cuti Service)
```
Request:
  Authorization: Bearer <token>
  X-Correlation-ID: abc123

Response (200):
  {
    "user_id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "exp": 1718200245
  }

Error (401):
  { "detail": "Invalid or expired token" }
```

#### GET /me
```
Request:
  Authorization: Bearer <token>

Response (200):
  {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2026-06-12T10:30:45.123Z"
  }

Error (401):
  { "detail": "Invalid or expired token" }
```

#### GET /health
```
Response (200):
  {
    "status": "healthy",
    "service": "auth-service",
    "version": "2.0.0"
  }
```

#### GET /metrics
```
Response (200):
  {
    "service": "auth-service",
    "request_count": 500,
    "error_count": 5,
    "error_rate_percent": 1.0,
    ...
  }
```

---

### Cuti Service API

#### POST /items
```
Request:
  Authorization: Bearer <token>
  {
    "name": "Cuti Reguler",
    "description": "Annual leave",
    "price": 0.0,
    "quantity": 5
  }

Response (201):
  {
    "id": 1,
    "name": "Cuti Reguler",
    "description": "Annual leave",
    "price": 0.0,
    "quantity": 5,
    "owner_id": 1,
    "created_at": "2026-06-12T10:30:45.123Z",
    "updated_at": "2026-06-12T10:30:45.123Z"
  }

Error (401):
  { "detail": "Invalid or expired token" }

Error (503):
  { "detail": "Auth Service circuit breaker OPEN. Try again later." }
```

#### GET /items
```
Request:
  Authorization: Bearer <token>
  ?search=cuti&skip=0&limit=20

Response (200):
  {
    "total": 50,
    "skip": 0,
    "limit": 20,
    "items": [
      {
        "id": 1,
        "name": "Cuti Reguler",
        "description": "Annual leave",
        "price": 0.0,
        "quantity": 5,
        "owner_id": 1,
        "created_at": "2026-06-12T10:30:45.123Z",
        "updated_at": "2026-06-12T10:30:45.123Z"
      },
      ...
    ]
  }
```

#### GET /items/stats
```
Request:
  Authorization: Bearer <token>

Response (200):
  {
    "total_items": 10,
    "total_quantity": 50,
    "total_value": 500.0,
    "avg_price": 50.0
  }
```

#### GET /items/public
```
Request: (No auth required)

Response (200):
  {
    "total": 100,
    "skip": 0,
    "limit": 20,
    "items": [...]
  }
```

#### GET /items/{item_id}
```
Request:
  Authorization: Bearer <token>

Response (200):
  {
    "id": 1,
    "name": "Cuti Reguler",
    "description": "Annual leave",
    "price": 0.0,
    "quantity": 5,
    "owner_id": 1,
    "created_at": "2026-06-12T10:30:45.123Z",
    "updated_at": "2026-06-12T10:30:45.123Z"
  }

Error (404):
  { "detail": "Item not found" }
```

#### PUT /items/{item_id}
```
Request:
  Authorization: Bearer <token>
  {
    "name": "Cuti Reguler Updated",
    "quantity": 10
  }

Response (200):
  {
    "id": 1,
    "name": "Cuti Reguler Updated",
    ...
  }

Error (403):
  { "detail": "Not authorized to update this item" }
```

#### DELETE /items/{item_id}
```
Request:
  Authorization: Bearer <token>

Response (204 No Content):
  (empty body)

Error (403):
  { "detail": "Not authorized to delete this item" }
```

#### GET /health
```
Response (200):
  {
    "status": "healthy|degraded|unhealthy",
    "service": "item-service",
    "version": "2.1.0",
    "dependencies": {
      "auth-service": {
        "status": "available|unavailable",
        "circuit_breaker": {
          "name": "auth-service",
          "state": "CLOSED|OPEN|HALF_OPEN",
          "failure_count": 0,
          "success_count": 100,
          "total_rejected": 0,
          "cooldown_seconds": 30
        }
      },
      "database": {
        "status": "connected|disconnected",
        "error": null
      }
    }
  }
```

---

## Deployment Configurations

### Docker Compose Files

#### 1. `docker-compose.yml` (Base Configuration)
- Defines all services: auth-db, cuti-db, auth-service, cuti-service, frontend, gateway
- Production-ready resource limits
- Health checks for all services
- Logging configuration (json-file, 10MB max size)
- Dependency ordering (`depends_on` with `service_healthy` condition)

#### 2. `docker-compose.dev.yml` (Development Overrides)
- Hot-reload volumes for Python services
- Vite dev server with HMR on port 5173
- uvicorn with `--reload` flag
- Frontend node_modules volume
- Environment: `VITE_API_URL: http://localhost`

**Usage**:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
# or
make dev
```

#### 3. `docker-compose.prod.yml` (Production Overrides)
- `restart: always` for all services
- Database ports NOT exposed to host
- CORS_ORIGINS: Only production domain
- DEBUG: false
- Optimized for security & performance

**Usage**:
```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml --profile prod up -d
```

### Environment Variables

#### Auth Service
```
DATABASE_URL=postgresql://postgres:postgres123@auth-db:5432/auth_db
SECRET_KEY=super-secret-key (change in prod!)
SERVICE_NAME=auth-service
LOG_LEVEL=INFO
TOKEN_EXPIRE_MINUTES=30
```

#### Cuti Service
```
DATABASE_URL=postgresql://postgres:postgres123@cuti-db:5432/cuti_db
AUTH_SERVICE_URL=http://auth-service:8001
SERVICE_NAME=item-service
LOG_LEVEL=INFO
```

#### Frontend
```
VITE_API_URL=http://localhost (dev)
VITE_API_PROXY_TARGET=http://localhost:8000 (dev fallback)
VITE_API_URL=http://<domain> (prod)
```

### Resource Limits

| Service | CPU | Memory |
|---------|-----|--------|
| auth-db | 0.50 | 512MB |
| cuti-db | 0.50 | 512MB |
| auth-service | 1.00 | 512MB |
| cuti-service | 1.00 | 512MB |
| frontend | 0.50 | 256MB |
| gateway | 0.25 | 128MB |
| **Total** | **3.75** | **2.5GB** |

### Restart Policies

- Development: Default (no auto-restart)
- Production: `restart: always` (auto-restart on failure)

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Total Services** | 6 (2 Databases + 2 APIs + 1 Frontend + 1 Gateway) |
| **Internal Network** | Docker Bridge `simcuti-network` |
| **Total Ports** | 80 (gateway), 8001 (auth), 8002 (items), 5173 (dev frontend), 3000 (dev), 5432 (databases, internal only) |
| **Databases** | 2 PostgreSQL instances (auth_db, cuti_db) |
| **Authentication** | JWT (HS256, 30-min expiry) |
| **Reliability** | Circuit Breaker, Exponential Backoff, Health Checks, Correlation ID Tracing |
| **Monitoring** | Metrics endpoint, Error alerting, Structured JSON logging |
| **Deployment** | Docker Compose (dev, prod profiles) |
| **API Type** | REST/HTTP |
| **Data Pattern** | Database per Service (no shared database) |
| **Communication Pattern** | Synchronous HTTP (Cuti → Auth), Asynchronous via Frontend |

---

**Document Version**: 1.0  
**Last Updated**: 2026-06-12  
**Status**: Complete & Ready for Diagram Design
