"""
Auth Client — HTTP client untuk berkomunikasi dengan Auth Service.
Dilengkapi dengan retry logic (exponential backoff) dan circuit breaker.

Item Service TIDAK memiliki akses ke auth_db — ia memanggil
Auth Service via HTTP untuk memverifikasi token.
"""
import os
import time
import asyncio
import logging
import httpx
from fastapi import HTTPException, Header
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


async def _call_auth_service(authorization: str) -> dict:
    """
    Internal: Panggil Auth Service dengan Circuit Breaker + Retry.
    
    1. Circuit Breaker check: Jika OPEN, langsung fail fast (503)
    2. Retry dengan exponential backoff: max 3 attempts
    3. Record success/failure ke circuit breaker
    """
    # 🔴 Circuit Breaker check
    if not auth_circuit.can_execute():
        logger.error(
            f"❌ Circuit Breaker OPEN — request ditolak. "
            f"State: {auth_circuit.state}"
        )
        raise HTTPException(
            status_code=503,
            detail="Auth Service circuit breaker OPEN. Try again later."
        )

    last_exception = None

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    f"{AUTH_SERVICE_URL}/verify",
                    headers={"Authorization": authorization},
                    timeout=TIMEOUT_SECONDS,
                )

            # ✅ Success
            if response.status_code == 200:
                auth_circuit.record_success()
                logger.info(f"✅ Auth verified (attempt {attempt}/{MAX_RETRIES})")
                return response.json()

            # ❌ Non-retryable errors — gagalkan langsung
            if response.status_code == 401:
                auth_circuit.record_success()  # Service responsif, token salah
                logger.warning(f"❌ Invalid or expired token")
                raise HTTPException(status_code=401, detail="Invalid or expired token")
            
            if response.status_code == 400:
                auth_circuit.record_success()
                logger.warning(f"❌ Bad auth request")
                raise HTTPException(status_code=400, detail="Bad auth request")

            # ⚠️ Retryable server errors
            if response.status_code in RETRYABLE_STATUS_CODES:
                logger.warning(
                    f"⚠️ Auth service returned {response.status_code} "
                    f"(attempt {attempt}/{MAX_RETRIES})"
                )
                last_exception = HTTPException(
                    status_code=response.status_code,
                    detail=f"Auth service error: {response.status_code}"
                )
            else:
                logger.warning(
                    f"❌ Unexpected auth response: {response.status_code}"
                )
                auth_circuit.record_success()
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Unexpected auth response: {response.status_code}"
                )

        except httpx.ConnectError as e:
            logger.warning(
                f"⚠️ Cannot connect to Auth Service (attempt {attempt}/{MAX_RETRIES})"
            )
            last_exception = e

        except httpx.TimeoutException as e:
            logger.warning(
                f"⚠️ Auth Service timeout (attempt {attempt}/{MAX_RETRIES})"
            )
            last_exception = e

        # 🔄 Exponential backoff (hanya jika akan retry)
        if attempt < MAX_RETRIES:
            delay = BASE_DELAY * (2 ** (attempt - 1))  # 0.5s, 1s, 2s
            logger.info(f"🔄 Retrying in {delay}s...")
            await asyncio.sleep(delay)

    # ❌ Semua retry gagal → record failure di circuit breaker
    auth_circuit.record_failure()
    logger.error(f"❌ Auth Service unreachable after {MAX_RETRIES} attempts")
    raise HTTPException(
        status_code=503,
        detail="Auth Service unavailable. Please try again later."
    )


async def verify_token_with_auth_service(
    authorization: str = Header(...)
) -> dict:
    """
    FastAPI Dependency: Verifikasi token via Auth Service dengan retry logic.
    Digunakan sebagai Depends() di endpoints yang butuh autentikasi.
    """
    if not authorization.startswith("Bearer "):
        logger.warning("Invalid authorization header format")
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    return await _call_auth_service(authorization)