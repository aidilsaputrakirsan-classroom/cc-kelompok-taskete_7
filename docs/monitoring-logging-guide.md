# Monitoring, Logging & Observability — Implementation Guide

## 📋 Ringkasan Implementasi

Berdasarkan MODUL 14 dari mata kuliah Komputasi Awan, berikut adalah implementasi Workshop 14.1-14.3 + Error Alerting Logic untuk sistem SIMCUTI microservices.

### Komponen yang Diimplementasikan

1. **Workshop 14.1: Structured Logging** ✅
   - JSON formatter untuk structured logs
   - Logging middleware dengan correlation ID
   - Setup di auth-service dan item-service

2. **Workshop 14.2: Correlation ID Lintas Service** ✅
   - Correlation ID generation dan propagation
   - Forward correlation ID di X-Correlation-ID header
   - Updated auth_client.py untuk teruskan correlation ID ke auth-service

3. **Workshop 14.3: Metrics Endpoint** ✅
   - In-memory metrics collector
   - Per-endpoint statistics (latency, error count)
   - /metrics endpoint di setiap service

4. **Error Alerting Logic** ✅ (Lead Backend Task)
   - Monitor error rate dalam sliding window (default 60 detik)
   - Trigger CRITICAL log jika error rate > 10%
   - Alert field dalam JSON logs untuk trigger notifikasi

---

## 🏗️ Struktur Files

```
services/
├── shared/
│   ├── logging_config.py          # JSONFormatter + setup_logging()
│   ├── logging_middleware.py      # RequestLoggingMiddleware (original version)
│   ├── metrics.py                 # MetricsCollector class
│   └── error_alerting.py          # ErrorAlertingMonitor class
├── auth-service/
│   ├── logging_config.py          # Copy dari shared
│   ├── logging_middleware.py      # Updated - dengan metrics + error alerting
│   ├── metrics.py                 # Copy dari shared
│   ├── error_alerting.py          # Copy dari shared
│   └── main.py                    # Updated - logging setup + middleware + /metrics
├── item-service/
│   ├── logging_config.py          # Copy dari shared
│   ├── logging_middleware.py      # Updated - dengan metrics + error alerting
│   ├── metrics.py                 # Copy dari shared
│   ├── error_alerting.py          # Copy dari shared
│   ├── auth_client.py             # Updated - correlation ID forwarding
│   └── main.py                    # Updated - logging setup + middleware + /metrics
└── gateway/
    └── nginx.conf                 # (akan diupdate di workshop 14.4 untuk metrics routes)

docker-compose.yml                # Updated - SERVICE_NAME, LOG_LEVEL, logging config

scripts/
├── logs.sh                        # Helper script untuk debugging
└── migrate_data.py
```

---

## 🚀 Cara Menggunakan

### 1. Build & Run Services

```bash
docker compose up -d --build
```

Akan start:
- PostgreSQL untuk auth_db dan cuti_db
- Auth Service (port 8001)
- Item Service (port 8002)
- Frontend (port 3000)
- Nginx Gateway (port 80)

### 2. Lihat Structured Logs

```bash
# Lihat semua log dari kedua services (JSON format)
docker compose logs -f auth-service cuti-service

# Contoh output:
# {"timestamp":"2026-02-15T10:30:45.123Z","level":"INFO","service":"auth-service","logger":"logging_middleware","message":"POST /register → 201 (89.5ms)","correlation_id":"a1b2c3d4","method":"POST","path":"/register","status_code":201,"duration_ms":89.5}
```

### 3. Test Correlation ID Tracing

```bash
# Register user
curl -X POST http://localhost:8001/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123","name":"Test User"}'

# Login untuk dapatkan token
TOKEN=$(curl -s -X POST http://localhost:8001/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}' | \
  python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Create item (akan call auth-service internally)
CORRELATION_ID=$(curl -s -X POST http://localhost:8002/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"Test Item","price":10000,"quantity":5}' \
  -w "%header{x-correlation-id}\n" | tail -1)

echo "Correlation ID: $CORRELATION_ID"

# Trace semua log dengan correlation ID yang sama
docker compose logs auth-service cuti-service 2>&1 | grep "$CORRELATION_ID"
```

### 4. Check Metrics

```bash
# Auth Service metrics
curl -s http://localhost:8001/metrics | python3 -m json.tool

# Item Service metrics
curl -s http://localhost:8002/metrics | python3 -m json.tool

# Output example:
# {
#   "service": "auth-service",
#   "uptime_seconds": 125.3,
#   "total_requests": 42,
#   "total_errors": 2,
#   "error_rate_percent": 4.76,
#   "status_codes": {"200": 40, "400": 1, "401": 1},
#   "latency": {
#     "p50_ms": 5.2,
#     "p95_ms": 12.4,
#     "p99_ms": 18.7,
#     "avg_ms": 7.1
#   },
#   "endpoints": {
#     "POST /register": {"count": 5, "errors": 1, "avg_latency_ms": 15.2},
#     "POST /login": {"count": 10, "errors": 0, "avg_latency_ms": 8.5},
#     "GET /verify": {"count": 27, "errors": 1, "avg_latency_ms": 4.2}
#   },
#   "error_alerting": {
#     "error_rate_percent": 4.76,
#     "alert_active": false
#   }
# }
```

### 5. Gunakan Helper Script

```bash
chmod +x scripts/logs.sh

# Lihat semua logs
./scripts/logs.sh all

# Lihat hanya ERROR logs
./scripts/logs.sh errors

# Trace specific correlation ID
./scripts/logs.sh trace a1b2c3d4

# Fetch metrics dari kedua services
./scripts/logs.sh metrics
```

---

## 🔍 Fitur Utama

### A. Structured Logging (JSON Format)

Setiap log entry adalah JSON yang mudah di-parse:

```json
{
  "timestamp": "2026-02-15T10:30:45.123Z",
  "level": "INFO",
  "service": "item-service",
  "logger": "logging_middleware",
  "message": "POST /items → 201 (89.5ms)",
  "correlation_id": "a1b2c3d4",
  "method": "POST",
  "path": "/items",
  "status_code": 201,
  "duration_ms": 89.5
}
```

**Keuntungan:**
- Mudah di-parse oleh log aggregators (ELK, Grafana Loki, CloudWatch)
- Bisa di-filter: `grep '"level":"ERROR"'`
- Bisa di-search: `grep "correlation_id"`
- Bisa di-aggregate: berhitung avg latency per endpoint

### B. Correlation ID Lintas Service

Request melewati: Frontend → Gateway → Item Service → Auth Service

**Tanpa correlation ID:**
```
Item Service log: POST /items → 201 (89.5ms)
Auth Service log: GET /verify → 200 (15.2ms)
^^^ Bagaimana tahu kedua ini related?
```

**Dengan correlation ID:**
```
Item Service log: {..., "correlation_id": "a1b2c3d4", ...}
Auth Service log: {..., "correlation_id": "a1b2c3d4", ...}
^^^ Bisa grep "a1b2c3d4" dan lihat request chain!
```

**Implementation di code:**
```python
# Di middleware: generate atau ambil correlation ID
correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4())[:12])
request.state.correlation_id = correlation_id

# Di auth_client.py: forward ke auth service
headers = {"Authorization": authorization}
if correlation_id:
    headers["X-Correlation-ID"] = correlation_id
```

### C. In-Memory Metrics

Metrics collected tanpa external service (Prometheus, etc):

```python
# Recording di middleware
metrics.record_request(method, path, status_code, duration_ms)

# Return di /metrics endpoint
{
  "uptime_seconds": 125.3,
  "total_requests": 42,
  "total_errors": 2,
  "error_rate_percent": 4.76,
  "status_codes": {"200": 40, "400": 1, "401": 1},
  "latency": {
    "p50_ms": 5.2,
    "p95_ms": 12.4,
    "p99_ms": 18.7,
    "avg_ms": 7.1
  },
  "endpoints": {...}
}
```

### D. Error Alerting (Sliding Window)

Monitor error rate dalam rolling window (default 60 detik):

```python
# Jika error rate > 10%, log CRITICAL alert
"🚨 ERROR RATE ALERT: 25.00% (5/20 requests failed in last 60s)"

# Log entry akan include alert flag
{
  "level": "CRITICAL",
  "alert": true,
  "error_rate_percent": 25.00,
  "message": "🚨 ERROR RATE ALERT: 25.00% ..."
}
```

**Ketika diintegrasikan dengan log aggregator:**
- Filter: `level == CRITICAL AND alert == true`
- Trigger: send notification (email, Slack, PagerDuty)
- Severity: CRITICAL

---

## 📊 Docker Logging Configuration

Setiap service memiliki log rotation:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"      # Rotate jika size > 10MB
    max-file: "3"        # Keep max 3 files lama
    tag: "service-name"  # Tag untuk identifikasi
```

**Location:** `/var/lib/docker/containers/{container-id}/`

---

## 🔧 Konfigurasi Environment Variables

### Service Configuration

| Variable | Default | Untuk |
|----------|---------|-------|
| `SERVICE_NAME` | unknown | Service identifier di logs |
| `LOG_LEVEL` | INFO | Minimum log level (DEBUG/INFO/WARNING/ERROR/CRITICAL) |

### Docker Compose Setup

```yaml
environment:
  SERVICE_NAME: auth-service
  LOG_LEVEL: INFO
  DATABASE_URL: postgresql://...
  SECRET_KEY: ...
```

---

## 🎯 Roadmap: Next Steps (Workshop 14.4-14.6)

### Workshop 14.4: Health Dashboard
- [ ] Create React component: StatusPage.jsx
- [ ] Auto-refresh setiap 10 detik
- [ ] Display health status + metrics dari kedua services

### Workshop 14.5: Centralized Logging
- [ ] Configure Docker logging driver
- [ ] Log aggregation setup (optional: ELK Stack)
- [ ] Helper script untuk download logs

### Workshop 14.6: Production Deployment
- [ ] Error alerting integration dengan notification service
- [ ] Status page polish dengan charts
- [ ] Production docker-compose.prod.yml
- [ ] Operations guide documentation

---

## 📝 Troubleshooting

### Logs tidak JSON format?
**Solusi:** Pastikan logging_config.py sudah di-import dan setup_logging() dipanggil:
```python
from logging_config import setup_logging
setup_logging()  # HARUS dipanggil di main.py
```

### Correlation ID tidak diteruskan ke auth-service?
**Solusi:** Check auth_client.py apakah forward correlation_id di header:
```python
headers = {"Authorization": authorization}
if correlation_id:
    headers["X-Correlation-ID"] = correlation_id
```

### /metrics endpoint tidak ada?
**Solusi:** Pastikan /metrics endpoint sudah ditambah di main.py:
```python
@app.get("/metrics")
def get_metrics():
    return {"service": "...", **metrics.get_metrics()}
```

### Error rate alert tidak trigger?
**Solusi:** Check error_alerting.py:
- Pastikan threshold = 10.0 (persen)
- Pastikan window_seconds = 60 (detik)
- Untuk test: trigger 11 errors dalam 60 detik

---

## 📚 References

- MODUL 14: MONITORING, LOGGING & OBSERVABILITY
- Google SRE Book — Chapter 6: Monitoring Distributed Systems
- Structured Logging Best Practices: https://www.structlog.org/

---

*Last Updated: 2026-02-15*
*Implementation by: GitHub Copilot*
