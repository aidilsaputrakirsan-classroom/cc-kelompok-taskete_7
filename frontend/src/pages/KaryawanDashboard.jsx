/**
 * SIMCUTI — Karyawan Dashboard (White & Blue Minimalist)
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

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Sidebar */}
      <aside style={{
        width: 280, flexShrink: 0,
        backgroundColor: '#ffffff',
        borderRight: '1px solid var(--border-color)',
        display: 'flex', flexDirection: 'column',
        position: 'sticky', top: 0, height: '100vh',
      }}>
        {/* Brand */}
        <div style={{ padding: '2.5rem 1.5rem', borderBottom: '1px solid #f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 6,
              backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: '1rem', fontWeight: 800
            }}>S</div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              SIMCUTI
            </span>
          </div>
        </div>

        {/* User Profile */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1.25rem', borderRadius: 'var(--radius-lg)', background: '#f8fafc',
            border: '1px solid var(--border-color)'
          }}>
            <p style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>{user?.name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem', fontWeight: 500 }}>{user?.department || 'Staff'}</p>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '0 1rem' }}>
          {MENUS.map((m) => (
            <button
              key={m.id}
              onClick={() => setActiveMenu(m.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '0.875rem',
                padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                fontSize: '0.875rem', fontWeight: activeMenu === m.id ? 700 : 500,
                marginBottom: '0.25rem', transition: 'var(--transition-base)',
                background: activeMenu === m.id ? 'var(--primary-light)' : 'transparent',
                color: activeMenu === m.id ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              <span style={{ fontSize: '1.1rem', opacity: activeMenu === m.id ? 1 : 0.6 }}>{m.icon}</span>
              {m.label}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid #f8fafc' }}>
          <button onClick={logout} className="btn btn-outline" style={{ width: '100%', border: '1px solid #fee2e2', color: '#b91c1c' }}>
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, backgroundColor: '#fafafa', overflowY: 'auto' }}>
        <div style={{ padding: '3rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
          <header style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
              {MENUS.find(m => m.id === activeMenu)?.label}
            </h2>
            <div style={{ width: 40, height: 4, background: 'var(--primary)', marginTop: '0.5rem', borderRadius: 2 }}></div>
          </header>

          <section className="fade-in" style={{ 
            backgroundColor: '#ffffff', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--border-color)', 
            padding: '2.5rem',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
          }}>
            {activeMenu === 'status' && <StatusCuti onRefresh={refreshKey} />}
            {activeMenu === 'kalender' && <KalenderLibur />}
            {activeMenu === 'ajukan' && (
              <FormPengajuan onSuccess={refresh} showToast={show} />
            )}
            {activeMenu === 'histori' && <HistoriCuti refreshKey={refreshKey} />}
          </section>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
