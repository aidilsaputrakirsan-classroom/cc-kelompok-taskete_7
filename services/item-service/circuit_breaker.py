"""
Circuit Breaker Pattern — mencegah cascading failure.
Jika Auth Service gagal berkali-kali, berhenti mencoba (fail fast).

States:
- CLOSED:    Normal state. Requests diteruskan ke Auth Service.
- OPEN:      Tripped state. Requests langsung ditolak (fail fast).
- HALF_OPEN: Testing state. 1 request diizinkan untuk test recovery.
"""
import time
import logging

logger = logging.getLogger(__name__)


class CircuitBreaker:
    """
    Simple circuit breaker implementation untuk inter-service communication.

    Mencegah cascading failure dengan:
    1. Menghitung failure rate
    2. Berhenti forward request saat failure threshold tercapai
    3. Periodically test apakah service sudah pulih
    """

    def __init__(
        self,
        name: str = "default",
        failure_threshold: int = 5,
        cooldown_seconds: int = 30,
    ):
        self.name = name
        self.failure_threshold = failure_threshold
        self.cooldown_seconds = cooldown_seconds
        self.failure_count = 0
        self.success_count = 0
        self.state = "CLOSED"
        self.last_failure_time = None
        self.total_rejected = 0

    def can_execute(self) -> bool:
        """
        Periksa apakah request diizinkan untuk diteruskan ke upstream service.
        
        Returns:
            - True: request bisa diteruskan (CLOSED atau HALF_OPEN)
            - False: request langsung ditolak (OPEN dan masih dalam cooldown)
        """
        if self.state == "CLOSED":
            return True

        if self.state == "OPEN":
            elapsed = time.time() - self.last_failure_time
            if elapsed >= self.cooldown_seconds:
                logger.info(
                    f"[CircuitBreaker:{self.name}] ✓ "
                    f"Cooldown selesai ({self.cooldown_seconds}s). "
                    f"State: OPEN → HALF_OPEN"
                )
                self.state = "HALF_OPEN"
                return True
            else:
                self.total_rejected += 1
                remaining = int(self.cooldown_seconds - elapsed)
                logger.debug(
                    f"[CircuitBreaker:{self.name}] ⏸️  "
                    f"OPEN — request ditolak. "
                    f"Cooldown remaining: {remaining}s"
                )
                return False

        # HALF_OPEN — izinkan 1 request untuk test
        return True

    def record_success(self):
        """
        Catat keberhasilan request.
        - CLOSED → CLOSED (increment counter)
        - HALF_OPEN → CLOSED (service berhasil pulih!)
        """
        if self.state == "HALF_OPEN":
            logger.info(
                f"[CircuitBreaker:{self.name}] ✅ "
                f"Test berhasil! Service pulih. State: HALF_OPEN → CLOSED"
            )
        self.failure_count = 0
        self.success_count += 1
        self.state = "CLOSED"

    def record_failure(self):
        """
        Catat kegagalan request.
        - CLOSED → OPEN (jika failure_count >= threshold)
        - HALF_OPEN → OPEN (service belum siap)
        """
        self.failure_count += 1
        self.last_failure_time = time.time()

        if self.state == "HALF_OPEN":
            logger.warning(
                f"[CircuitBreaker:{self.name}] ❌ "
                f"Test gagal. Service masih down. State: HALF_OPEN → OPEN"
            )
            self.state = "OPEN"
        elif self.failure_count >= self.failure_threshold:
            logger.error(
                f"[CircuitBreaker:{self.name}] 🔴 "
                f"Threshold tercapai ({self.failure_count}/{self.failure_threshold}). "
                f"Berhenti forward requests. State: CLOSED → OPEN"
            )
            self.state = "OPEN"
        else:
            logger.warning(
                f"[CircuitBreaker:{self.name}] ⚠️  "
                f"Failure count: {self.failure_count}/{self.failure_threshold}"
            )

    def get_status(self) -> dict:
        """Return circuit breaker status untuk health check."""
        return {
            "name": self.name,
            "state": self.state,
            "failure_count": self.failure_count,
            "failure_threshold": self.failure_threshold,
            "success_count": self.success_count,
            "total_rejected": self.total_rejected,
            "cooldown_seconds": self.cooldown_seconds,
        }
