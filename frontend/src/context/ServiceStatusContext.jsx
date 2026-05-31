/**
 * SIMCUTI — ServiceStatusContext
 * Mengelola status ketersediaan layanan backend (degraded / offline),
 * menangkap event global dari interceptor Axios, dan menyediakan logika
 * auto-retry background secara dinamis.
 */
import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { systemAPI } from '../api';

const ServiceStatusContext = createContext(null);

export function ServiceStatusProvider({ children }) {
  const [isUnavailable, setIsUnavailable] = useState(false);
  const [isDegraded, setIsDegraded] = useState(false);
  const [degradedDetails, setDegradedDetails] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [countdown, setCountdown] = useState(10);

  const countdownIntervalRef = useRef(null);

  const checkHealth = useCallback(async () => {
    if (isChecking) return;
    setIsChecking(true);
    try {
      const data = await systemAPI.health();
      if (data && data.status === 'degraded') {
        setIsUnavailable(false);
        setIsDegraded(true);
        setDegradedDetails(data.dependencies || null);
      } else {
        setIsUnavailable(false);
        setIsDegraded(false);
        setDegradedDetails(null);
      }
      setCountdown(10);
    } catch (err) {
      setIsUnavailable(true);
      setIsDegraded(false);
      setDegradedDetails(null);
      setCountdown(10);
    } finally {
      setIsChecking(false);
    }
  }, [isChecking]);

  // Handle events dari Axios interceptor
  useEffect(() => {
    const handleUnavailable = () => {
      setIsUnavailable(true);
      setIsDegraded(false);
      setDegradedDetails(null);
    };

    const handleDegraded = (e) => {
      setIsUnavailable(false);
      setIsDegraded(true);
      setDegradedDetails(e.detail?.dependencies || null);
    };

    const handleHealthy = () => {
      setIsUnavailable(false);
      setIsDegraded(false);
      setDegradedDetails(null);
    };

    window.addEventListener('api-service-unavailable', handleUnavailable);
    window.addEventListener('api-service-degraded', handleDegraded);
    window.addEventListener('api-service-healthy', handleHealthy);

    return () => {
      window.removeEventListener('api-service-unavailable', handleUnavailable);
      window.removeEventListener('api-service-degraded', handleDegraded);
      window.removeEventListener('api-service-healthy', handleHealthy);
    };
  }, []);

  // Logika Auto-Retry Countdown ketika layanan offline
  useEffect(() => {
    if (isUnavailable) {
      setCountdown(10);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            // Jalankan health check secara asinkron di akhir tick ini
            setTimeout(() => {
              checkHealth();
            }, 0);
            return 10;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }

    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [isUnavailable, checkHealth]);

  const value = {
    isUnavailable,
    isDegraded,
    degradedDetails,
    isChecking,
    countdown,
    checkHealth,
    triggerMockUnavailable: () => setIsUnavailable(true),
    triggerMockDegraded: () => {
      setIsUnavailable(false);
      setIsDegraded(true);
      setDegradedDetails({ auth_service: 'healthy', database: 'unhealthy' });
    },
    resetStatus: () => {
      setIsUnavailable(false);
      setIsDegraded(false);
      setDegradedDetails(null);
    }
  };

  return (
    <ServiceStatusContext.Provider value={value}>
      {children}
    </ServiceStatusContext.Provider>
  );
}

export function useServiceStatus() {
  const ctx = useContext(ServiceStatusContext);
  if (!ctx) {
    throw new Error('useServiceStatus harus digunakan di dalam ServiceStatusProvider');
  }
  return ctx;
}
