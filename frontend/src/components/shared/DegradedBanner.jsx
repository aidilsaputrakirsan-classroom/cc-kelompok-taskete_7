/**
 * SIMCUTI — DegradedBanner (Shared Alert Component)
 * Tampilan banner notifikasi tipis di atas layar saat backend terdeteksi berjalan
 * dalam degraded mode (sebagian microservices down).
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
        // Konversi nama service agar lebih ramah dibaca
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
      backgroundColor: '#fffbeb',
      borderBottom: '1px solid #fef3c7',
      padding: '0.625rem 1.5rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      position: 'sticky',
      top: 0,
      zIndex: 999,
      fontFamily: "'Inter', sans-serif",
      animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
        {/* Animated Caution Icon */}
        <span style={{
          fontSize: '1.25rem',
          display: 'inline-flex',
          animation: 'pulse 1.5s infinite'
        }}>⚠️</span>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <p style={{
            fontSize: '0.85rem',
            fontWeight: 700,
            color: '#b45309',
            margin: 0,
            lineHeight: 1.3
          }}>
            Sistem Berjalan dalam Mode Terbatas (Degraded Mode)
          </p>
          <p style={{
            fontSize: '0.75rem',
            color: '#d97706',
            margin: '0.15rem 0 0 0',
            fontWeight: 500,
            lineHeight: 1.3
          }}>
            Beberapa dependensi sistem sedang offline. {issuesText} Anda tetap dapat memakai fitur dasar.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Check Health Button */}
        <button
          onClick={checkHealth}
          disabled={isChecking}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-md)',
            padding: '0.375rem 0.75rem',
            fontSize: '0.75rem',
            fontWeight: 700,
            color: '#b45309',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
            boxShadow: 'var(--shadow-sm)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#fef3c7';
            e.currentTarget.style.borderColor = '#fcd34d';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
            e.currentTarget.style.borderColor = '#fde68a';
          }}
        >
          {isChecking ? (
            <>
              <Spinner size="sm" color="gray" />
              <span>Memeriksa...</span>
            </>
          ) : (
            <>
              <span>Periksa Koneksi</span>
            </>
          )}
        </button>

        {/* Close button to dismiss alert */}
        <button
          onClick={resetStatus}
          title="Tutup"
          style={{
            background: 'none',
            border: 'none',
            color: '#d97706',
            cursor: 'pointer',
            fontSize: '1.1rem',
            padding: '2px 6px',
            fontWeight: 700,
            borderRadius: '4px',
            transition: 'background-color 0.15s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fef3c7'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          ×
        </button>
      </div>
    </div>
  );
}
