"""
Auth Client — HTTP client untuk berkomunikasi dengan Auth Service.
Dilengkapi dengan retry logic (exponential backoff) dan circuit breaker.
Teruskan Correlation ID untuk request tracing lintas service.

Item Service TIDAK memiliki akses ke auth_db — ia memanggil
Auth Service via HTTP untuk memverifikasi token.
"""
import os
import time
import asyncio
import logging
import httpx
from fastapi import HTTPException, Header, Request
from circuit_breaker import CircuitBreaker

logger = logging.getLogger(__name__)

AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8001")

# =====================
# RETRY CONFIG (Exponential Backoff)
# =====================
MAX_RETRIES = 3
BASE_DELAY = 0.5           # 0.5 detik delay awal
TIMEOUT_SECONDS = 5.0      # Timeout per request

# Error yang layak di-retry (transient errors)
RETRYABLE_STATUS_CODES = {500, 502, 503, 504}

# =====================
# CIRCUIT BREAKER (Global instance)
# =====================
auth_circuit = CircuitBreaker(
    name="auth-service",
    failure_threshold=5,
    cooldown_seconds=30,
)


async def _call_auth_service(authorization: str, correlation_id: str = None) -> dict:
    """
    Internal: Panggil Auth Service dengan Circuit Breaker + Retry.
    
    1. Circuit Breaker check: Jika OPEN, langsung fail fast (503)
    2. Retry dengan exponential backoff: max 3 attempts
    3. Record success/failure ke circuit breaker
    4. Forward correlation ID untuk request tracing
    """
    # 🔴 Circuit Breaker check
    if not auth_circuit.can_execute():
        logger.error(
            f"❌ Circuit Breaker OPEN — request ditolak. "
            f"State: {auth_circuit.state}",
            extra={"correlation_id": correlation_id} if correlation_id else {},
        )
        raise HTTPException(
            status_code=503,
            detail="Auth Service circuit breaker OPEN. Try again later."
        )

    last_exception = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            # Siapkan headers
            headers = {"Authorization": authorization}
            if correlation_id:
                headers["X-Correlation-ID"] = correlation_id
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/verify",
                    headers=headers,
                    timeout=TIMEOUT_SECONDS,
                )

            # ✅ Success
            if response.status_code == 200:
                auth_circuit.record_success()
                logger.info(
                    f"✅ Auth verified (attempt {attempt}/{MAX_RETRIES})",
                    extra={"correlation_id": correlation_id} if correlation_id else {},
                )
                return response.json()

            # ❌ Non-retryable errors — gagalkan langsung
            if response.status_code == 401:
                auth_circuit.record_success()  # Service responsif, token salah
                logger.warning(
                    f"❌ Invalid or expired token",
                    extra={"correlation_id": correlation_id} if correlation_id else {},
                )
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            if response.status_code == 400:
                auth_circuit.record_success()
                logger.warning(
                    f"❌ Bad auth request",
                    extra={"correlation_id": correlation_id} if correlation_id else {},
                )
                raise HTTPException(status_code=400, detail="Bad auth request")

            # ⚠️ Retryable server errors
            if response.status_code in RETRYABLE_STATUS_CODES:
                logger.warning(
                    f"⚠️ Auth service returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_RETRIES})",
                    extra={"correlation_id": correlation_id} if correlation_id else {},
                )
                last_exception = HTTPException(
                    status_code=response.status_code,
                    detail=f"Auth service error: {response.status_code}"
                )
            else:
                logger.warning(
                    f"❌ Unexpected auth response: {response.status_code}",
                    extra={"correlation_id": correlation_id} if correlation_id else {},
                )
                auth_circuit.record_success()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Unexpected auth response: {response.status_code}"
                )

        except httpx.ConnectError as e:
            logger.warning(
                f"⚠️ Cannot connect to Auth Service (attempt {attempt}/{MAX_RETRIES})",
                extra={"correlation_id": correlation_id} if correlation_id else {},
            )
            last_exception = e

        except httpx.TimeoutException as e:
            logger.warning(
                f"⚠️ Auth Service timeout (attempt {attempt}/{MAX_RETRIES})",
                extra={"correlation_id": correlation_id} if correlation_id else {},
            )
            last_exception = e

        # 🔄 Exponential backoff (hanya jika akan retry)
        if attempt < MAX_RETRIES:
            delay = BASE_DELAY * (2 ** (attempt - 1))  # 0.5s, 1s, 2s
            logger.info(
                f"🔄 Retrying in {delay}s...",
                extra={"correlation_id": correlation_id} if correlation_id else {},
            )
            await asyncio.sleep(delay)

    # ❌ Semua retry gagal → record failure di circuit breaker
    auth_circuit.record_failure()
    logger.error(
        f"❌ Auth Service unreachable after {MAX_RETRIES} attempts",
        extra={"correlation_id": correlation_id} if correlation_id else {},
    )
    raise HTTPException(
        status_code=503,
        detail="Auth Service unavailable. Please try again later."
    )


async def verify_token_with_auth_service(
    request: Request,
    authorization: str = Header(...)
) -> dict:
    """
    FastAPI Dependency: Verifikasi token via Auth Service dengan retry logic.
    Digunakan sebagai Depends() di endpoints yang butuh autentikasi.
    
    Args:
        request: FastAPI Request object untuk extract correlation ID
        authorization: Authorization header value
    
    Returns:
        dict: User info dari Auth Service
    """
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    # Extract correlation ID dari request state
    correlation_id = getattr(request.state, "correlation_id", None)
    
    return await _call_auth_service(authorization, correlation_id)