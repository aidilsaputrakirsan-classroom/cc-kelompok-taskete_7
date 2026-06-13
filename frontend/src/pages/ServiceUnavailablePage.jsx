/**
 * SIMCUTI — ServiceUnavailablePage (Nordic Redesign)
 * Tampilan full-screen 503 yang muncul saat gateway atau backend microservices offline.
 */
import { useServiceStatus } from '../context/ServiceStatusContext';
import { Spinner } from '../components/shared';

export default function ServiceUnavailablePage() {
  const { isChecking, countdown, checkHealth } = useServiceStatus();

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-main)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      fontFamily: "inherit"
    }}>
      {/* Container Card */}
      <div className="card fade-in" style={{
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        padding: '3rem 2.5rem',
        boxShadow: 'var(--shadow-premium)',
        borderColor: 'var(--border-color)',
        backgroundColor: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        
        {/* Modern Interactive Server SVG Illustration */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', width: '130px', height: '130px' }}>
            <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
              {/* Background Circle */}
              <circle cx="50" cy="50" r="45" fill="var(--primary-light)" opacity="0.6" />
              
              {/* Server Rack Base */}
              <rect x="25" y="25" width="50" height="50" rx="6" fill="#e2e8f0" stroke="#cbd5e1" strokeWidth="2" />
              
              {/* Server Slots */}
              {/* Slot 1 */}
              <rect x="32" y="32" width="36" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="38" cy="36" r="2" fill="var(--primary)" />
              <circle cx="62" cy="36" r="1.5" fill="#ef4444" style={{ animation: 'pulse 1.2s infinite' }} />
              
              {/* Slot 2 */}
              <rect x="32" y="46" width="36" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="38" cy="50" r="2" fill="var(--primary)" />
              <circle cx="62" cy="50" r="1.5" fill="#ef4444" style={{ animation: 'pulse 1.2s infinite', animationDelay: '0.4s' }} />

              {/* Slot 3 */}
              <rect x="32" y="60" width="36" height="8" rx="2" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
              <circle cx="38" cy="64" r="2" fill="var(--primary)" />
              <circle cx="62" cy="64" r="1.5" fill="#ef4444" style={{ animation: 'pulse 1.2s infinite', animationDelay: '0.8s' }} />
            </svg>
          </div>
          
          {/* Signal Indicator */}
          <div style={{
            marginTop: '-8px',
            backgroundColor: 'var(--status-rejected-bg)',
            color: 'var(--status-rejected-text)',
            padding: '4px 14px',
            borderRadius: '20px',
            fontSize: '0.725rem',
            fontWeight: 800,
            border: '1px solid var(--status-rejected-border)',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 2,
            letterSpacing: '0.05em'
          }}>
            <span style={{ 
              display: 'inline-block', 
              width: '6px', 
              height: '6px', 
              backgroundColor: 'var(--status-rejected-text)', 
              borderRadius: '50%', 
              animation: 'pulse 1s infinite' 
            }}></span>
            OFFLINE
          </div>
        </div>

        {/* Heading */}
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          letterSpacing: '-0.03em',
          marginBottom: '0.75rem',
          fontFamily: "'Outfit', sans-serif"
        }}>
          Layanan Tidak Tersedia
        </h2>
        
        {/* Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--text-secondary)',
          lineHeight: '1.6',
          marginBottom: '2rem',
          maxWidth: '380px'
        }}>
          Kami mendeteksi gangguan koneksi ke server utama (Error 503). Sistem sedang melakukan pemulihan otomatis di latar belakang.
        </p>

        {/* Dynamic Countdown Alert */}
        <div style={{
          width: '100%',
          backgroundColor: 'var(--primary-light)',
          border: '1px solid rgba(37, 99, 235, 0.15)',
          borderRadius: 'var(--radius-md)',
          padding: '0.875rem 1.25rem',
          marginBottom: '2rem',
          fontSize: '0.85rem',
          fontWeight: 600,
          color: 'var(--primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <span style={{ fontSize: '1.2rem', flexShrink: 0, display: 'inline-flex', alignItems: 'center' }}>🔄</span>
          <span style={{ textAlign: 'left', lineHeight: '1.4' }}>
            Mencoba menghubungkan kembali otomatis dalam <strong>{countdown} detik</strong>...
          </span>
        </div>

        {/* Action Button */}
        <button
          onClick={checkHealth}
          disabled={isChecking}
          className="btn btn-primary btn-lg"
          style={{
            width: '100%',
            height: '48px',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isChecking ? (
            <>
              <Spinner size="sm" color="white" />
              <span>Memeriksa Koneksi...</span>
            </>
          ) : (
            <span>Hubungkan Kembali</span>
          )}
        </button>
      </div>
      
      {/* Footer copyright */}
      <span style={{ marginTop: '2.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.02em' }}>
        SIMCUTI · INSTITUT TEKNOLOGI KALIMANTAN
      </span>
    </div>
  );
}
