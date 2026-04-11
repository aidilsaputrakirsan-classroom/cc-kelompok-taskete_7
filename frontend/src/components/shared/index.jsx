/**
 * SIMCUTI — Shared Components
 * Spinner, Toast, Navbar
 */

/* ========== Spinner ========== */
export function Spinner({ size = 'md', color = 'purple' }) {
  const sizes = { sm: 20, md: 32, lg: 48 };
  const s = sizes[size] || 32;
  const clr = color === 'green' ? 'var(--admin-primary)' : 'var(--karyawan-primary)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <svg
        width={s} height={s}
        viewBox="0 0 24 24" fill="none"
        style={{ animation: 'spin 0.8s linear infinite' }}
      >
        <circle cx="12" cy="12" r="10" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
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
  const colors = {
    success: { bg: '#065f46', border: '#6ee7b7', icon: '✅' },
    error: { bg: '#7f1d1d', border: '#fca5a5', icon: '❌' },
    info: { bg: '#1e3a5f', border: '#93c5fd', icon: 'ℹ️' },
    warning: { bg: '#78350f', border: '#fcd34d', icon: '⚠️' },
  };
  const c = colors[type] || colors.info;

  return (
    <div
      style={{
        position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 9999,
        background: c.bg, border: `1px solid ${c.border}`,
        borderRadius: 'var(--radius-lg)',
        padding: '0.875rem 1.25rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        minWidth: '280px', maxWidth: '420px',
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.3s ease',
        color: 'white',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      <span>{c.icon}</span>
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'rgba(255,255,255,0.12)', border: 'none', color: 'white',
          width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
          fontSize: '0.875rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}
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

import { useState } from 'react';
