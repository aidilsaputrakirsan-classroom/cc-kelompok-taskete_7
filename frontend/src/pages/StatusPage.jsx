import { useState, useEffect, useCallback } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost';

function ServiceCard({ name, icon, healthUrl, metricsUrl }) {
  const [health, setHealth] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    let healthData = { status: 'unreachable' };
    let metricsData = null;

    try {
      const healthRes = await fetch(healthUrl, { cache: 'no-store' });
      if (healthRes.ok) {
        healthData = await healthRes.json();
      } else {
        healthData = { status: 'unhealthy' };
      }
    } catch {
      healthData = { status: 'unreachable' };
    }

    if (metricsUrl) {
      try {
        const metricsRes = await fetch(metricsUrl, { cache: 'no-store' });
        if (metricsRes.ok) {
          metricsData = await metricsRes.json();
        }
      } catch {
        metricsData = null;
      }
    }

    setHealth(healthData);
    setMetrics(metricsData);
    setLoading(false);
  }, [healthUrl, metricsUrl]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const status = health?.status || 'unreachable';

  const statusColor = {
    healthy: '#10b981',
    degraded: '#f59e0b',
    unhealthy: '#ef4444',
    unreachable: '#6b7280',
  };

  const statusBg = {
    healthy: 'rgba(16, 185, 129, 0.08)',
    degraded: 'rgba(245, 158, 11, 0.08)',
    unhealthy: 'rgba(239, 68, 68, 0.08)',
    unreachable: 'rgba(107, 114, 128, 0.08)',
  };

  const errorRate = metrics?.error_rate_percent !== undefined ? metrics.error_rate_percent : 0;
  
  let errorBarColor = '#10b981';
  if (errorRate > 10) errorBarColor = '#f59e0b';
  if (errorRate > 30) errorBarColor = '#ef4444';

  return (
    <div 
      style={{
        ...styles.card,
        borderLeft: `5px solid ${statusColor[status]}`,
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? '0 12px 20px -3px rgba(37, 99, 235, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.02)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.03), 0 2px 4px -1px rgba(0, 0, 0, 0.01)',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.cardHeader}>
        <div style={styles.serviceInfo}>
          <span style={styles.serviceIcon}>{icon}</span>
          <div>
            <h3 style={styles.serviceName}>{name}</h3>
            <span style={styles.serviceUrl}>{healthUrl.replace(API_URL, '')}</span>
          </div>
        </div>
        
        <div style={{
          ...styles.statusBadge,
          backgroundColor: statusBg[status],
          color: statusColor[status],
          borderColor: statusColor[status],
        }}>
          <span style={{
            ...styles.statusPulse,
            backgroundColor: statusColor[status],
            boxShadow: `0 0 8px ${statusColor[status]}`,
          }} />
          {status}
        </div>
      </div>

      <div style={styles.cardBody}>
        {loading && !health ? (
          <div style={styles.skeletonContainer}>
            <div style={styles.skeletonLine} />
            <div style={styles.skeletonLineShort} />
          </div>
        ) : (
          <>
            {metrics ? (
              <div style={styles.metricsGrid}>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Total Requests</span>
                  <span style={styles.metricValue}>{metrics.total_requests || 0}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Total Errors</span>
                  <span style={{
                    ...styles.metricValue,
                    color: metrics.total_errors > 0 ? '#ef4444' : 'var(--text-primary)',
                  }}>
                    {metrics.total_errors || 0}
                  </span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Latency (Avg)</span>
                  <span style={styles.metricValue}>{metrics.latency?.avg_ms !== undefined ? `${metrics.latency.avg_ms}ms` : '-'}</span>
                </div>
                <div style={styles.metricItem}>
                  <span style={styles.metricLabel}>Latency (p95)</span>
                  <span style={styles.metricValue}>{metrics.latency?.p95_ms !== undefined ? `${metrics.latency.p95_ms}ms` : '-'}</span>
                </div>
              </div>
            ) : (
              <div style={styles.noMetrics}>
                {status === 'unreachable' ? 'Service is down or unreachable' : 'No real-time metrics collected'}
              </div>
            )}

            {metrics && (
              <div style={styles.errorRateContainer}>
                <div style={styles.errorRateHeader}>
                  <span style={styles.errorRateLabel}>Error Rate</span>
                  <span style={{ ...styles.errorRateValue, color: errorBarColor }}>{errorRate}%</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div style={{
                    ...styles.progressBarFill,
                    width: `${Math.min(100, Math.max(0, errorRate))}%`,
                    backgroundColor: errorBarColor,
                  }} />
                </div>
              </div>
            )}

            {metrics && (
              <div style={styles.uptimeContainer}>
                <span style={styles.uptimeLabel}>Uptime</span>
                <span style={styles.uptimeValue}>
                  {metrics.uptime_seconds !== undefined 
                    ? `${Math.floor(metrics.uptime_seconds / 3600)}j ${Math.floor((metrics.uptime_seconds % 3600) / 60)}m`
                    : '-'}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function StatusPage({ onBack }) {
  const [lastChecked, setLastChecked] = useState(new Date());
  const [countdown, setCountdown] = useState(10);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const triggerRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastChecked(new Date());
    setRefreshKey(k => k + 1);
    setCountdown(10);
    setTimeout(() => setIsRefreshing(false), 800);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) {
          triggerRefresh();
          return 10;
        }
        return c - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [triggerRefresh]);

  return (
    <div style={styles.container}>
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-dot {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.15); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinner-spin {
          to { transform: rotate(360deg); }
        }
      `}} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <div>
          <button onClick={onBack} style={styles.backButton}>
            ← Kembali ke Dashboard
          </button>
          <h1 style={{
            fontSize: '2rem', 
            fontWeight: 800, 
            color: 'var(--text-primary)', 
            letterSpacing: '-0.04em',
            fontFamily: "'Outfit', sans-serif",
            marginTop: '1.25rem',
            marginBottom: '0.35rem'
          }}>
            📊 Status & Observabilitas Sistem
          </h1>
          <div style={{ 
            width: 32, 
            height: 4, 
            background: 'var(--primary)', 
            marginTop: '0.5rem', 
            borderRadius: 2 
          }}></div>
          <p style={{ margin: '0.75rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            Pemantauan Kesehatan Layanan dan Performa Real-time SIMCUTI
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
          <div style={styles.timeInfo}>
            <span style={styles.timeLabel}>Pembaruan Terakhir:</span>
            <span style={styles.timeValue}>{lastChecked.toLocaleTimeString()}</span>
          </div>

          <div style={styles.controlGroup}>
            <div style={styles.refreshBadge}>
              <div style={{
                ...styles.countdownBar,
                width: `${(countdown / 10) * 100}%`
              }} />
              <span style={styles.refreshText}>Refresh in {countdown}s</span>
            </div>

            <button 
              onClick={triggerRefresh} 
              disabled={isRefreshing}
              style={{
                ...styles.refreshButton,
                opacity: isRefreshing ? 0.8 : 1,
              }}
            >
              <span style={{
                display: 'inline-block',
                animation: isRefreshing ? 'spinner-spin 0.8s linear infinite' : 'none',
                marginRight: '6px'
              }}>🔄</span>
              Refresh Sekarang
            </button>
          </div>
        </div>
      </div>

      <div style={styles.grid}>
        <ServiceCard
          key={`auth-${refreshKey}`}
          name="Auth Service"
          icon="🔐"
          healthUrl={`${API_URL}/auth/health`}
          metricsUrl={`${API_URL}/auth/metrics`}
        />
        <ServiceCard
          key={`cuti-${refreshKey}`}
          name="Cuti Service"
          icon="📦"
          healthUrl={`${API_URL}/items/health`}
          metricsUrl={`${API_URL}/items/metrics`}
        />
        <ServiceCard
          key={`gateway-${refreshKey}`}
          name="API Gateway"
          icon="🚪"
          healthUrl={`${API_URL}/health`}
          metricsUrl={`${API_URL}/metrics`}
        />
      </div>

      <div style={styles.footer}>
        <div style={styles.infoBox}>
          <strong>💡 Catatan Observabilitas:</strong> Correlation ID secara otomatis dialirkan lintas service 
          (Gateway → Cuti Service → Auth Service) untuk pencatatan log terdistribusi yang mempermudah debugging.
        </div>
        <p style={styles.academicInfo}>Sistem Informasi Manajemen Cuti Karyawan — Institut Teknologi Kalimantan</p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '2.5rem',
    maxWidth: '1200px',
    margin: '0 auto',
    fontFamily: "'Outfit', system-ui, -apple-system, sans-serif",
    color: 'var(--text-primary)',
    animation: 'slide-in 0.4s ease-out',
  },
  backButton: {
    padding: '0.6rem 1.25rem',
    backgroundColor: '#ffffff',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)',
    fontFamily: "'Outfit', sans-serif",
  },
  headerRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.75rem',
  },
  timeInfo: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    fontWeight: 500,
  },
  timeValue: {
    fontWeight: '700',
    color: 'var(--text-primary)',
    marginLeft: '6px',
  },
  controlGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  refreshBadge: {
    position: 'relative',
    padding: '0.6rem 1.2rem',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: 'var(--text-primary)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '130px',
    boxShadow: 'var(--shadow-sm)',
  },
  countdownBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '3px',
    backgroundColor: 'var(--primary)',
    transition: 'width 1s linear',
  },
  refreshButton: {
    padding: '0.6rem 1.25rem',
    backgroundColor: 'var(--primary)',
    color: '#ffffff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    transition: 'all var(--transition-fast)',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(37, 99, 235, 0.15)',
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
    gap: '2rem',
    marginBottom: '2.5rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-sm)',
    transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)',
  },
  cardHeader: {
    padding: '1.5rem 2rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  serviceIcon: {
    fontSize: '1.75rem',
  },
  serviceName: {
    margin: 0,
    fontSize: '1.1rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    fontFamily: "'Outfit', sans-serif",
  },
  serviceUrl: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontFamily: 'monospace',
    fontWeight: 500,
  },
  statusBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '0.35rem 0.85rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.75rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    border: '1px solid',
    letterSpacing: '0.02em',
  },
  statusPulse: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'pulse-dot 1.8s infinite ease-in-out',
  },
  cardBody: {
    padding: '2rem',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.25rem',
    marginBottom: '1.5rem',
  },
  metricItem: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'var(--bg-main)',
    padding: '0.75rem 1.1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  metricLabel: {
    fontSize: '0.725rem',
    color: 'var(--text-muted)',
    marginBottom: '0.25rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.03em',
  },
  metricValue: {
    fontSize: '1.2rem',
    fontWeight: 700,
    color: 'var(--text-primary)',
    letterSpacing: '-0.02em',
    fontFamily: "'Outfit', sans-serif",
  },
  noMetrics: {
    padding: '2rem 1rem',
    textAlign: 'center',
    color: 'var(--text-muted)',
    fontSize: '0.875rem',
    fontStyle: 'italic',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
  },
  errorRateContainer: {
    marginTop: '1.5rem',
  },
  errorRateHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8rem',
    fontWeight: '650',
    marginBottom: '0.5rem',
  },
  errorRateLabel: {
    color: 'var(--text-secondary)',
  },
  errorRateValue: {
    fontWeight: '700',
  },
  progressBarBg: {
    height: '8px',
    backgroundColor: 'var(--bg-main)',
    borderRadius: 'var(--radius-full)',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 'var(--radius-full)',
    transition: 'width 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
  },
  uptimeContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    paddingTop: '0.85rem',
    borderTop: '1px solid var(--border-color)',
    fontSize: '0.8rem',
  },
  uptimeLabel: {
    color: 'var(--text-muted)',
    fontWeight: '500',
  },
  uptimeValue: {
    fontWeight: '700',
    color: 'var(--text-primary)',
  },
  skeletonContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.6rem',
    padding: '1rem 0',
  },
  skeletonLine: {
    height: '14px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    width: '100%',
    animation: 'pulse-dot 1.5s infinite ease-in-out',
  },
  skeletonLineShort: {
    height: '14px',
    backgroundColor: '#e2e8f0',
    borderRadius: '4px',
    width: '60%',
    animation: 'pulse-dot 1.5s infinite ease-in-out',
  },
  footer: {
    marginTop: '3.5rem',
    textAlign: 'center',
  },
  infoBox: {
    display: 'inline-block',
    textAlign: 'left',
    backgroundColor: 'var(--primary-light)',
    color: 'var(--primary)',
    border: '1px solid rgba(37, 99, 235, 0.15)',
    padding: '1.1rem 1.75rem',
    borderRadius: 'var(--radius-lg)',
    fontSize: '0.85rem',
    maxWidth: '800px',
    lineHeight: '1.5',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-sm)',
  },
  academicInfo: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    margin: 0,
    fontWeight: 500,
  }
};