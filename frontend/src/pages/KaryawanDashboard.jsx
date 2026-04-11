/**
 * SIMCUTI — Dashboard Karyawan
 * Antarmuka tema UNGU untuk karyawan biasa.
 * Navigasi: Status Cuti | Kalender Libur | Ajukan Cuti | Histori
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/shared';
import { StatusCuti, KalenderLibur, FormPengajuan, HistoriCuti } from '../components/karyawan';

const MENUS = [
  { id: 'status', label: 'Status Cuti', icon: '📊' },
  { id: 'kalender', label: 'Kalender Libur', icon: '📅' },
  { id: 'ajukan', label: 'Ajukan Cuti', icon: '✍️' },
  { id: 'histori', label: 'Histori Saya', icon: '📋' },
];

export default function KaryawanDashboard() {
  const { user, logout } = useAuth();
  const { toast, show, close } = useToast();
  const [activeMenu, setActiveMenu] = useState('status');
  const [refreshKey, setRefreshKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const refresh = () => setRefreshKey(k => k + 1);

  const PURPLE = 'var(--karyawan-primary)';
  const PURPLE_DARK = 'var(--karyawan-dark)';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-900)' }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'linear-gradient(180deg, #1e1b4b 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(124,58,237,0.2)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(124,58,237,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--karyawan-primary), var(--karyawan-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', boxShadow: 'var(--shadow-glow-purple)',
            }}>🏢</div>
            <div>
              <p style={{ fontWeight: 800, color: 'white', fontSize: '1rem', lineHeight: 1 }}>SIMCUTI</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--karyawan-400)', marginTop: '0.125rem' }}>Portal Karyawan</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(124,58,237,0.1)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(124,58,237,0.1)', borderRadius: 'var(--radius-md)', padding: '0.875rem',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--karyawan-500), var(--karyawan-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: '1rem', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'K'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', marginTop: '0.1rem' }}>{user?.department || 'Karyawan'}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {MENUS.map((m) => (
            <button
              key={m.id}
              id={`nav-${m.id}`}
              onClick={() => setActiveMenu(m.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem',
                transition: 'all 0.2s ease',
                background: activeMenu === m.id
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(91,33,182,0.2))'
                  : 'transparent',
                color: activeMenu === m.id ? 'var(--karyawan-200)' : 'var(--gray-400)',
                borderLeft: activeMenu === m.id ? '3px solid var(--karyawan-primary)' : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
          <button
            onClick={logout}
            id="btn-logout"
            className="btn btn-outline"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main style={{ flex: 1, overflow: 'auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.5rem', fontWeight: 800, color: 'white',
            background: `linear-gradient(135deg, white, var(--karyawan-300))`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            {MENUS.find(m => m.id === activeMenu)?.icon}{' '}
            {MENUS.find(m => m.id === activeMenu)?.label}
          </h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {activeMenu === 'status' && 'Ringkasan kuota cuti Anda tahun ini.'}
            {activeMenu === 'kalender' && 'Hari libur nasional dan cuti bersama yang berlaku.'}
            {activeMenu === 'ajukan' && 'Isi form di bawah untuk mengajukan cuti baru.'}
            {activeMenu === 'histori' && 'Semua riwayat pengajuan cuti Anda.'}
          </p>
        </div>

        {/* Content Card */}
        <div style={{
          background: 'var(--gray-800)',
          border: '1px solid var(--gray-700)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem',
          animation: 'fadeIn 0.4s ease',
          minHeight: '300px',
        }}>
          {activeMenu === 'status' && <StatusCuti onRefresh={refreshKey} />}
          {activeMenu === 'kalender' && <KalenderLibur />}
          {activeMenu === 'ajukan' && (
            <FormPengajuan onSuccess={refresh} showToast={show} />
          )}
          {activeMenu === 'histori' && <HistoriCuti refreshKey={refreshKey} />}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
