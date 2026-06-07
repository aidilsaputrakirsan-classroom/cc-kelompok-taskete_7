"""
Error Alerting Logic.
Pantau error rate dan trigger CRITICAL log jika melebihi threshold.
"""
import logging
import time
from collections import deque
from threading import Lock

logger = logging.getLogger(__name__)


class ErrorAlertingMonitor:
    """Monitor error rate dan trigger alerts jika threshold terlampaui."""

    def __init__(self, threshold_percent: float = 10.0, window_seconds: int = 60):
        """
        Args:
            threshold_percent: Error rate threshold (default 10%)
            window_seconds: Time window untuk calculate error rate (default 60 detik)
        """
        self.threshold_percent = threshold_percent
        self.window_seconds = window_seconds
        
        # Sliding window: list of (timestamp, is_error) tuples
        self.request_window = deque()
        self._lock = Lock()
        self.alert_triggered = False

    def record_request(self, status_code: int, correlation_id: str = None):
        """Record satu request dan check jika error rate melebihi threshold."""
        is_error = status_code >= 400
        current_time = time.time()
        
        with self._lock:
            # Tambah request ke window
            self.request_window.append((current_time, is_error))
            
            # Hapus requests yang sudah diluar window time
            cutoff_time = current_time - self.window_seconds
            while self.request_window and self.request_window[0][0] < cutoff_time:
                self.request_window.popleft()
            
            # Hitung error rate
            if len(self.request_window) > 0:
                total_requests = len(self.request_window)
                error_count = sum(1 for _, is_err in self.request_window if is_err)
                error_rate = (error_count / total_requests) * 100
                
                # Check threshold
                if error_rate > self.threshold_percent:
                    if not self.alert_triggered:
                        # Log CRITICAL alert
                        logger.critical(
                            f"🚨 ERROR RATE ALERT: {error_rate:.2f}% "
                            f"({error_count}/{total_requests} requests failed in last {self.window_seconds}s)",
                            extra={
                                "alert": True,
                                "error_rate_percent": error_rate,
                                "correlation_id": correlation_id,
                            }
                        )
                        self.alert_triggered = True
                else:
                    # Alert resolved
                    if self.alert_triggered:
                        logger.info(
                            f"✅ Error rate recovered: {error_rate:.2f}%",
                            extra={
                                "alert": False,
                                "error_rate_percent": error_rate,
                            }
                        )
                        self.alert_triggered = False

    def get_error_rate(self) -> float:
        """Return current error rate (percent)."""
        with self._lock:
            if len(self.request_window) == 0:
                return 0.0
            
            error_count = sum(1 for _, is_err in self.request_window if is_err)
            error_rate = (error_count / len(self.request_window)) * 100
            return round(error_rate, 2)

    def is_alert_active(self) -> bool:
        """Return True jika alert sedang aktif."""
        with self._lock:
            return self.alert_triggered


# Singleton instances per service
error_alerting = ErrorAlertingMonitor(threshold_percent=10.0, window_seconds=60)
