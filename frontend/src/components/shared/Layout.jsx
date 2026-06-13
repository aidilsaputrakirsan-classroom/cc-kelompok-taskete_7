/**
 * SIMCUTI — Shared Dashboard Layout (Nordic Light)
 */
import { useState } from 'react';

export default function Layout({ 
  user, 
  menus, 
  activeMenu, 
  setActiveMenu, 
  onShowAbout, 
  onShowStatus, 
  logout, 
  children 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-main)' }}>
      {/* Sidebar Wrapper */}
      <aside style={{
        width: 280,
        flexShrink: 0,
        backgroundColor: 'var(--bg-sidebar)',
        borderRight: '1px solid var(--border-color)',
        display: 'flex', 
        flexDirection: 'column',
        position: 'sticky', 
        top: 0, 
        height: '100vh',
        zIndex: 50,
        transition: 'transform var(--transition-normal)',
      }}>
        {/* Brand/Logo Section */}
        <div style={{ padding: '2rem 1.5rem', borderBottom: '1px solid var(--bg-main)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src="/logo.png" 
              alt="Logo" 
              style={{ width: 34, height: 34, objectFit: 'contain' }} 
            />
            <span style={{ 
              fontWeight: 800, 
              fontSize: '1.25rem', 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.04em',
              fontFamily: "'Outfit', sans-serif"
            }}>
              SIMCUTI
            </span>
          </div>
        </div>

        {/* User Card */}
        <div style={{ padding: '1.5rem' }}>
          <div style={{
            padding: '1.1rem 1.25rem', 
            borderRadius: 'var(--radius-lg)', 
            background: 'var(--bg-main)',
            border: '1px solid var(--border-color)',
          }}>
            <p style={{ 
              fontWeight: 700, 
              fontSize: '0.875rem', 
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {user?.name || 'Pengguna'}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.4rem' }}>
              <span style={{ 
                fontSize: '0.625rem', 
                fontWeight: 800, 
                padding: '0.2rem 0.5rem', 
                backgroundColor: user?.role === 'admin' ? 'var(--primary)' : 'var(--text-muted)', 
                color: 'white', 
                borderRadius: 4,
                letterSpacing: '0.05em'
              }}>
                {user?.role?.toUpperCase() || 'STAFF'}
              </span>
              <span style={{ 
                fontSize: '0.75rem', 
                color: 'var(--text-secondary)', 
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user?.department || 'Karyawan'}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Menus */}
        <nav style={{ flex: 1, padding: '0 1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {menus.map((m) => {
            const isActive = activeMenu === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveMenu(m.id)}
                style={{
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.85rem',
                  padding: '0.8rem 1rem', 
                  borderRadius: 'var(--radius-md)',
                  border: 'none', 
                  cursor: 'pointer', 
                  fontFamily: 'inherit',
                  fontSize: '0.875rem', 
                  fontWeight: isActive ? 700 : 500,
                  transition: 'all var(--transition-fast)',
                  background: isActive ? 'var(--primary-light)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                  outline: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#f1f5f9';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '1.1rem', 
                  opacity: isActive ? 1 : 0.6,
                  display: 'inline-flex',
                  alignItems: 'center'
                }}>{m.icon}</span>
                {m.label}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Buttons */}
        <div style={{ 
          padding: '1.5rem', 
          borderTop: '1px solid var(--border-color)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '0.5rem',
          backgroundColor: '#ffffff'
        }}>
          {onShowAbout && (
            <button 
              onClick={onShowAbout} 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.8125rem' }} 
              id="layout-about-btn"
            >
              ℹ️ Tentang Proyek
            </button>
          )}
          {onShowStatus && (
            <button 
              onClick={onShowStatus} 
              className="btn btn-outline" 
              style={{ width: '100%', padding: '0.5rem 1rem', fontSize: '0.8125rem' }} 
              id="layout-status-btn"
            >
              📊 Status Sistem
            </button>
          )}
          <button 
            onClick={logout} 
            className="btn btn-outline" 
            style={{ 
              width: '100%', 
              padding: '0.5rem 1rem', 
              fontSize: '0.8125rem',
              borderColor: '#fecaca', 
              color: '#dc2626',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#fef2f2';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, backgroundColor: 'var(--bg-main)', minHeight: '100vh', overflowY: 'auto' }}>
        <div style={{ padding: '3rem 4rem', maxWidth: '1400px', margin: '0 auto' }}>
          {/* Content Header */}
          <header style={{ marginBottom: '2.5rem' }}>
            <h2 style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: 'var(--text-primary)', 
              letterSpacing: '-0.03em',
              fontFamily: "'Outfit', sans-serif"
            }}>
              {menus.find(m => m.id === activeMenu)?.label || 'Detail'}
            </h2>
            <div style={{ 
              width: 32, 
              height: 4, 
              background: 'var(--primary)', 
              marginTop: '0.5rem', 
              borderRadius: 2 
            }}></div>
          </header>

          {/* Page Content wrapped in a clean, card-like container */}
          <section className="fade-in" style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            padding: '2.5rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            {children}
          </section>
        </div>
      </main>
    </div>
  );
}
