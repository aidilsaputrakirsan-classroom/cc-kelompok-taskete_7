# Implementation Checklist: Modul 14 - Monitoring, Logging & Observability

## ✅ Workshop 14.1: Structured Logging (35 menit)

### Files Created/Updated:
- [x] `services/shared/logging_config.py` — JSONFormatter + setup_logging()
- [x] `services/auth-service/logging_config.py` — Copy dari shared
- [x] `services/item-service/logging_config.py` — Copy dari shared
- [x] `services/auth-service/main.py` — Import logging_config, call setup_logging()
- [x] `services/item-service/main.py` — Import logging_config, call setup_logging()

### Features:
- [x] JSON log format dengan timestamp, level, service, logger
- [x] Extra fields: correlation_id, method, path, status_code, duration_ms, user_id, alert
- [x] LOG_LEVEL environment variable support (DEBUG/INFO/WARNING/ERROR/CRITICAL)
- [x] Suppressed uvicorn.access dan httpx noise

### Test Commands:
```bash
# View structured JSON logs
docker compose logs auth-service cuti-service 2>&1 | python3 -m json.tool

# Filter ERROR level
docker compose logs auth-service cuti-service 2>&1 | grep '"level":"ERROR"'
```

---

## ✅ Workshop 14.2: Request Logging Middleware + Correlation ID (25 menit)

### Files Created/Updated:
- [x] `services/shared/logging_middleware.py` — RequestLoggingMiddleware class
- [x] `services/auth-service/logging_middleware.py` — Updated dengan metrics + error alerting
- [x] `services/item-service/logging_middleware.py` — Updated dengan metrics + error alerting
- [x] `services/auth-service/main.py` — Add middleware
- [x] `services/item-service/main.py` — Add middleware
- [x] `services/item-service/auth_client.py` — Forward correlation_id ke auth-service

### Features:
- [x] Auto-generate correlation ID atau ambil dari X-Correlation-ID header
- [x] Log setiap request dengan method, path, status_code, duration_ms
- [x] Skip logging untuk /health dan /metrics endpoints (mengurangi noise)
- [x] Return correlation_id di X-Correlation-ID response header
- [x] Auth client forward correlation_id ke auth-service

### Implementation Details:

**Middleware flow:**
```
Request in → correlation_id = header atau generate
             ↓
          record_request (metrics)
          record_request (error_alerting)
          log_request (if not /health atau /metrics)
             ↓
Response out → X-Correlation-ID header
```

**Auth Client:**
```python
# Extract correlation_id dari request.state
correlation_id = getattr(request.state, "correlation_id", None)

# Forward di header saat call auth-service
headers = {"Authorization": authorization}
if correlation_id:
    headers["X-Correlation-ID"] = correlation_id
```

### Test Commands:
```bash
# Lihat correlation ID di logs
curl -X POST http://localhost:8002/items \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"name":"test","price":1000,"quantity":1}'

docker compose logs -f | grep "correlation_id"

# Trace satu request chain
docker compose logs auth-service cuti-service 2>&1 | grep "a1b2c3d4"
```

---

## ✅ Workshop 14.3: Metrics Endpoint (30 menit)

### Files Created/Updated:
- [x] `services/shared/metrics.py` — MetricsCollector class
- [x] `services/auth-service/metrics.py` — Copy dari shared
- [x] `services/item-service/metrics.py` — Copy dari shared
- [x] `services/auth-service/main.py` — Add /metrics endpoint
- [x] `services/item-service/main.py` — Add /metrics endpoint
- [x] `services/auth-service/logging_middleware.py` — Call metrics.record_request()
- [x] `services/item-service/logging_middleware.py` — Call metrics.record_request()

### Metrics Collected:
- [x] uptime_seconds — Uptime sejak service start
- [x] total_requests — Total request count
- [x] total_errors — Total error count (4xx + 5xx)
- [x] error_rate_percent — Percentage error rate
- [x] status_codes — Dict berisi count per status code
- [x] latency.p50_ms — 50th percentile latency
- [x] latency.p95_ms — 95th percentile latency
- [x] latency.p99_ms — 99th percentile latency
- [x] latency.avg_ms — Average latency
- [x] endpoints.{METHOD path}.count — Request count per endpoint
- [x] endpoints.{METHOD path}.errors — Error count per endpoint
- [x] endpoints.{METHOD path}.avg_latency_ms — Average latency per endpoint

### Features:
- [x] Thread-safe dengan threading.Lock()
- [x] Sliding window untuk latency (last 1000 requests)
- [x] Per-endpoint statistics tracking

### Test Commands:
```bash
# Fetch metrics dari auth-service
curl -s http://localhost:8001/metrics | python3 -m json.tool

# Fetch metrics dari item-service
curl -s http://localhost:8002/metrics | python3 -m json.tool

# Watch metrics real-time
watch -n 5 'curl -s http://localhost:8001/metrics | python3 -m json.tool'
```

---

## ✅ Error Alerting Logic (Lead Backend Task) 

### Files Created/Updated:
- [x] `services/shared/error_alerting.py` — ErrorAlertingMonitor class
- [x] `services/auth-service/error_alerting.py` — Copy dari shared
- [x] `services/item-service/error_alerting.py` — Copy dari shared
- [x] `services/auth-service/logging_middleware.py` — Call error_alerting.record_request()
- [x] `services/item-service/logging_middleware.py` — Call error_alerting.record_request()
- [x] `services/auth-service/main.py` — Add error_alerting ke /metrics endpoint
- [x] `services/item-service/main.py` — Add error_alerting ke /metrics endpoint
- [x] `services/shared/logging_config.py` — Support alert field di JSON logs
- [x] `services/auth-service/logging_config.py` — Support alert field
- [x] `services/item-service/logging_config.py` — Support alert field

### Features:
- [x] Monitor error rate dalam sliding window (default 60 detik)
- [x] Threshold dapat dikonfigurasi (default 10%)
- [x] Trigger CRITICAL log jika error_rate > threshold
- [x] Log contains alert: true field untuk trigger notifikasi
- [x] Alert recovery log saat error_rate menurun
- [x] Thread-safe implementation

### Error Alerting Flow:

```
Per request → error_alerting.record_request(status_code, correlation_id)
                ↓
            Add ke sliding window (timestamp, is_error)
            Remove requests outside window
                ↓
            Hitung error_rate = errors / total * 100
                ↓
            if error_rate > 10%:
              if not alert_triggered:
                logger.critical("🚨 ERROR RATE ALERT...", extra={"alert": true})
                alert_triggered = true
            else:
              if alert_triggered:
                logger.info("✅ Error rate recovered", extra={"alert": false})
                alert_triggered = false
```

### Example Log Output (Alert Triggered):

```json
{
  "timestamp": "2026-02-15T10:35:20.456Z",
  "level": "CRITICAL",
  "service": "item-service",
  "message": "🚨 ERROR RATE ALERT: 25.00% (5/20 requests failed in last 60s)",
  "alert": true,
  "error_rate_percent": 25.00,
  "correlation_id": "abc-123-def"
}
```

### Test Commands:
```bash
# Generate errors untuk trigger alert (need >10% error rate)
for i in $(seq 1 100); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8002/items \
    -H "Authorization: Bearer invalid-token" \
    -d '{"name":"test","price":1000,"quantity":1}'
done

# Monitor logs untuk CRITICAL + alert
docker compose logs -f item-service 2>&1 | grep '"alert": true'

# Check error_alerting di metrics
curl -s http://localhost:8002/metrics | jq '.error_alerting'
```

---

## 🔧 Configuration Changes

### docker-compose.yml Updates:

**Auth Service:**
```yaml
environment:
  SERVICE_NAME: auth-service
  LOG_LEVEL: INFO

logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    tag: "auth-service"
```

**Item Service (cuti-service):**
```yaml
environment:
  SERVICE_NAME: item-service
  LOG_LEVEL: INFO

logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
    tag: "item-service"
```

---

## 📊 Validation Checklist

### Pre-Build
- [x] All Python files syntax correct (no imports missing)
- [x] Middleware added after CORS (proper order)
- [x] /metrics endpoint added ke setiap service
- [x] Environment variables added ke docker-compose.yml

### Post-Build
- [ ] Services start tanpa error
- [ ] Logs dalam JSON format
- [ ] Correlation ID muncul di auth-service saat item-service call /verify
- [ ] /metrics endpoint return valid JSON
- [ ] Error rate monitoring berfungsi

### Manual Testing
- [ ] Register user → log JSON dengan correlation ID
- [ ] Login → dapat token
- [ ] Create item dengan token → trace correlation ID di auth-service logs
- [ ] Generate 11+ errors dalam 60 detik → lihat CRITICAL alert log
- [ ] curl /metrics → lihat metrics dengan error_rate_percent dan alert_active

---

## 🚀 Ready for Workshop 14.4-14.6

Setelah ini selesai, sistem siap untuk:

✅ **Workshop 14.4: Health Dashboard**
- Create React StatusPage component
- Fetch /metrics dari setiap service
- Display real-time status

✅ **Workshop 14.5: Centralized Logging**
- Docker log aggregation
- helper scripts (logs.sh)

✅ **Workshop 14.6: Production Readiness**
- Polish status page
- Production docker-compose.prod.yml
- Operations guide documentation

---

## 📝 Files Summary

| File | Purpose | Status |
|------|---------|--------|
| logging_config.py | JSON formatter setup | ✅ Created & Copied |
| logging_middleware.py | Request logging + correlation ID | ✅ Created & Copied |
| metrics.py | Metrics collection | ✅ Created & Copied |
| error_alerting.py | Error rate monitoring | ✅ Created & Copied |
| auth_client.py | Forward correlation ID | ✅ Updated |
| main.py (auth) | Setup logging + middleware + /metrics | ✅ Updated |
| main.py (item) | Setup logging + middleware + /metrics | ✅ Updated |
| docker-compose.yml | Service config + logging | ✅ Updated |
| logs.sh | Helper script | ✅ Created |
| monitoring-logging-guide.md | User guide | ✅ Created |

---

*Last Updated: 2026-02-15*
*Implementation Status: ✅ COMPLETE - Ready for Testing*
