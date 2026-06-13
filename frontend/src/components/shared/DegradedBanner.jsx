/**
 * SIMCUTI — DegradedBanner (Nordic Redesign)
 */
import { useServiceStatus } from '../../context/ServiceStatusContext';
import { Spinner } from './index';

export default function DegradedBanner() {
  const { isDegraded, degradedDetails, isChecking, checkHealth, resetStatus } = useServiceStatus();

  if (!isDegraded) return null;

  // Format dependensi yang bermasalah untuk ditampilkan ke user
  const issueServices = [];
  if (degradedDetails) {
    Object.entries(degradedDetails).forEach(([service, status]) => {
      if (status !== 'healthy') {
        const friendlyName = service.replace('_', ' ').replace('-', ' ');
        issueServices.push(friendlyName.toUpperCase());
      }
    });
  }

  const issuesText = issueServices.length > 0
    ? `Gangguan terdeteksi pada: ${issueServices.join(', ')}.`
    : 'Gangguan jaringan parsial terdeteksi.';

  return (
    <div style={{
      backgroundColor: 'var(--primary-light)',
      borderBottom: '1px solid rgba(37, 99, 235, 0.15)',
      padding: '0.75rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      fontFamily: "inherit",
      animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: 'var(--shadow-sm)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flex: 1 }}>
        {/* Animated Caution Icon */}
        <span style={{
          fontSize: '1.2rem',
          display: 'inline-flex',
          animation: 'pulse 1.8s infinite'
        }}>⚠️</span>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: 'var(--primary)',
            margin: 0,
            lineHeight: 1.3,
            fontFamily: "'Outfit', sans-serif"
          }}>
            Sistem Berjalan dalam Mode Terbatas (Degraded Mode)
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: 'var(--text-secondary)',
            margin: '0.15rem 0 0 0',
            fontWeight: 500,
            lineHeight: 1.3
          }}>
            Beberapa dependensi sistem sedang offline. {issuesText} Anda tetap dapat menggunakan fitur dasar.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Check Health Button */}
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="btn btn-outline btn-sm"
          style={{
            backgroundColor: '#ffffff',
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--primary)',
            borderColor: 'rgba(37, 99, 235, 0.25)',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--primary-light)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.25)';
          }}
        >
          {isChecking ? (
            <>
              <Spinner size="sm" color="gray" />
              <span>Memeriksa...</span>
            </>
          ) : (
            <span>Periksa Koneksi</span>
          )}
        </button>

        {/* Close button to dismiss alert */}
        <button
          onClick={resetStatus}
          title="Tutup"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '1.25rem',
            padding: '2px 6px',
            fontWeight: 700,
            borderRadius: '4px',
            transition: 'color 0.15s',
            outline: 'none'
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
        >
          &times;
        </button>
      </div>
    </div>
  );
}
