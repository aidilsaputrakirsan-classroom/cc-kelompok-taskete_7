"""
Request Logging Middleware.
Log setiap HTTP request dengan timing, status, dan correlation ID.
Juga record metrics dan error alerting.
"""
import time
import uuid
import logging
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware yang log setiap request/response + record metrics + error alerting."""

    async def dispatch(self, request: Request, call_next):
        # Generate atau ambil correlation ID
        correlation_id = request.headers.get(
            "X-Correlation-ID",
            str(uuid.uuid4())[:12]
        )

        # Simpan di request state (bisa diakses di endpoint)
        request.state.correlation_id = correlation_id

        # Catat waktu mulai
        start_time = time.time()

        # Proses request
        try:
            response = await call_next(request)
        except Exception as e:
            duration_ms = round((time.time() - start_time) * 1000, 2)
            
            # Import here untuk avoid circular imports
            from metrics import metrics
            from error_alerting import error_alerting
            
            # Record metrics
            metrics.record_request(request.method, request.url.path, 500, duration_ms)
            # Record error alerting
            error_alerting.record_request(500, correlation_id)
            
            logger.error(
                f"Request failed: {request.method} {request.url.path}",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "duration_ms": duration_ms,
                    "status_code": 500,
                },
            )
            raise

        # Hitung durasi
        duration_ms = round((time.time() - start_time) * 1000, 2)

        # Import untuk record metrics dan error alerting
        from metrics import metrics
        from error_alerting import error_alerting
        
        # Record metrics
        metrics.record_request(request.method, request.url.path, response.status_code, duration_ms)
        # Record error alerting
        error_alerting.record_request(response.status_code, correlation_id)

        # Log request (skip health checks dan metrics agar log tidak terlalu noisy)
        if request.url.path not in ["/health", "/metrics"]:
            log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
            logger.log(
                log_level,
                f"{request.method} {request.url.path} → {response.status_code} ({duration_ms}ms)",
                extra={
                    "correlation_id": correlation_id,
                    "method": request.method,
                    "path": request.url.path,
                    "status_code": response.status_code,
                    "duration_ms": duration_ms,
                },
            )

        # Teruskan correlation ID di response header
        response.headers["X-Correlation-ID"] = correlation_id
        return response

