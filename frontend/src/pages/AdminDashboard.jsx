/**
 * SIMCUTI — Dashboard Admin (HR)
 * Antarmuka tema HIJAU untuk admin/HR.
 * Navigasi: Ringkasan | Ajuan Pending | Riwayat | Hari Libur | Rekomendasi SAW
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast } from '../components/shared';
import { SummaryCards, DaftarAjuan, RiwayatAdmin, KelolaHoliday, RekomendasiSAW } from '../components/admin';
import { analyticsAPI } from '../api';

const MENUS = [
  { id: 'ringkasan', label: 'Ringkasan', icon: '📊' },
  { id: 'ajuan', label: 'Ajuan Pending', icon: '⏳' },
  { id: 'riwayat', label: 'Riwayat Semua', icon: '📋' },
  { id: 'holiday', label: 'Hari Libur', icon: '📅' },
  { id: 'saw', label: 'Rekomendasi SAW', icon: '🏆' },
];

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const { toast, show, close } = useToast();
  const [activeMenu, setActiveMenu] = useState('ringkasan');
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState(null);

  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    if (activeMenu === 'ringkasan') {
      analyticsAPI.summary().then(setSummary).catch(() => { });
    }
  }, [activeMenu, refreshKey]);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--gray-900)' }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: 260, flexShrink: 0,
        background: 'linear-gradient(180deg, #064e3b 0%, #0f172a 100%)',
        borderRight: '1px solid rgba(5,150,105,0.25)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh', overflowY: 'auto',
      }}>
        {/* Logo */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid rgba(5,150,105,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 40, height: 40, borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--admin-primary), var(--admin-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', boxShadow: 'var(--shadow-glow-green)',
            }}>🏢</div>
            <div>
              <p style={{ fontWeight: 800, color: 'white', fontSize: '1rem', lineHeight: 1 }}>SIMCUTI</p>
              <p style={{ fontSize: '0.7rem', color: 'var(--admin-400)', marginTop: '0.125rem' }}>Portal Admin / HR</p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(5,150,105,0.1)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: 'rgba(5,150,105,0.12)', borderRadius: 'var(--radius-md)', padding: '0.875rem',
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--admin-500), var(--admin-dark))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, color: 'white', fontSize: '1rem', flexShrink: 0,
            }}>
              {user?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'white', fontSize: '0.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginTop: '0.125rem' }}>
                <span style={{
                  fontSize: '0.65rem', fontWeight: 700, padding: '0.1rem 0.4rem',
                  background: 'var(--admin-primary)', color: 'white', borderRadius: '3px',
                }}>ADMIN</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--gray-500)' }}>{user?.department || 'HR'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
          {MENUS.map((m) => (
            <button
              key={m.id}
              id={`admin-nav-${m.id}`}
              onClick={() => setActiveMenu(m.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.75rem 0.875rem', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem',
                transition: 'all 0.2s ease',
                background: activeMenu === m.id
                  ? 'linear-gradient(135deg, rgba(5,150,105,0.3), rgba(4,120,87,0.2))'
                  : 'transparent',
                color: activeMenu === m.id ? 'var(--admin-200)' : 'var(--gray-400)',
                borderLeft: activeMenu === m.id ? '3px solid var(--admin-primary)' : '3px solid transparent',
              }}
            >
              <span style={{ fontSize: '1.2rem' }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1rem 0.75rem', borderTop: '1px solid rgba(5,150,105,0.1)' }}>
          <button
            onClick={logout}
            id="admin-btn-logout"
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
        <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 800, color: 'white',
              background: 'linear-gradient(135deg, white, var(--admin-300))',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>
              {MENUS.find(m => m.id === activeMenu)?.icon}{' '}
              {MENUS.find(m => m.id === activeMenu)?.label}
            </h1>
            <p style={{ color: 'var(--gray-500)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {activeMenu === 'ringkasan' && 'Statistik keseluruhan pengajuan cuti perusahaan.'}
              {activeMenu === 'ajuan' && 'Pengajuan cuti yang menunggu persetujuan Anda.'}
              {activeMenu === 'riwayat' && 'Seluruh riwayat pengajuan dari semua karyawan.'}
              {activeMenu === 'holiday' && 'Kelola kalender hari libur nasional dan cuti bersama.'}
              {activeMenu === 'saw' && 'Ranking karyawan berdasarkan Metode SAW (5 kriteria).'}
            </p>
          </div>
          {activeMenu === 'ajuan' && (
            <button onClick={refresh} className="btn btn-outline btn-sm" id="btn-refresh-ajuan">
              🔄 Refresh
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{
          background: 'var(--gray-800)', border: '1px solid var(--gray-700)',
          borderRadius: 'var(--radius-xl)', padding: '1.75rem',
          animation: 'fadeIn 0.4s ease', minHeight: '300px',
        }}>
          {activeMenu === 'ringkasan' && <SummaryCards data={summary} />}
          {activeMenu === 'ajuan' && <DaftarAjuan showToast={show} onRefresh={refreshKey} />}
          {activeMenu === 'riwayat' && <RiwayatAdmin />}
          {activeMenu === 'holiday' && <KelolaHoliday showToast={show} />}
          {activeMenu === 'saw' && <RekomendasiSAW />}
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
