/**
 * SIMCUTI — Shared Components (White & Blue Minimalist)
 */
import { useState } from 'react';

/* ========== Spinner ========== */
export function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 16, md: 28, lg: 44 };
  const s = sizes[size] || 28;
  
  const clr = color === 'primary' ? 'var(--primary)' : 
              color === 'gray' ? 'var(--text-muted)' : 
              'var(--primary)';

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg
        width={s} height={s}
        viewBox="0 0 24 24" fill="none"
        style={{ animation: 'spin 0.8s cubic-bezier(0.4, 0, 0.2, 1) infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="var(--border-color)" strokeWidth="2" />
        <path
          d="M12 2a10 10 0 0 1 10 10"
          stroke={clr} strokeWidth="3" strokeLinecap="round"
        />
      </svg>
    </div>
  );
}

/* ========== Toast ========== */
let toastTimeout = null;

export function Toast({ message, type = 'info', onClose }) {
  const styles = {
    success: { border: '#10b981', icon: '✓' },
    error: { border: '#ef4444', icon: '!' },
    info: { border: 'var(--primary)', icon: 'i' },
    warning: { border: '#f59e0b', icon: '!' },
  };
  const s = styles[type] || styles.info;

  return (
    <div
      style={{
        position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
        backgroundColor: '#ffffff',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        padding: '1rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '1rem',
        minWidth: '320px', maxWidth: '480px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div style={{
        width: 22, height: 22, borderRadius: '50%', 
        background: s.border, color: 'white', 
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.8rem', fontWeight: 800, flexShrink: 0
      }}>
        {s.icon}
      </div>
      <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
        {message}
      </span>
      <button
        onClick={onClose}
        style={{
          background: 'none', border: 'none', color: 'var(--text-muted)',
          cursor: 'pointer', fontSize: '1.25rem', padding: '0 0.5rem',
          lineHeight: 1, transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-primary)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
      >×</button>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const show = (message, type = 'info', duration = 4000) => {
    setToast({ message, type });
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => setToast(null), duration);
  };

  const close = () => {
    setToast(null);
    if (toastTimeout) clearTimeout(toastTimeout);
  };

  return { toast, show, close };
}
