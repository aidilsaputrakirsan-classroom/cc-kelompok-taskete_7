/**
 * SIMCUTI — LoginPage (Split-screen Nordic Design)
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast, Spinner } from '../components/shared';

export default function LoginPage({ onShowAbout }) {
  const { login, register } = useAuth();
  const { toast, show, close } = useToast();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [regForm, setRegForm] = useState({
    email: '', name: '', password: '', confirmPassword: '',
    department: '', role: 'karyawan', // Otomatis karyawan
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      show('Email dan password wajib diisi.', 'warning'); return;
    }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
    } catch (err) {
      show(err.message || 'Login gagal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!regForm.email || !regForm.name || !regForm.password) {
      show('Email, nama, dan password wajib diisi.', 'warning'); return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      show('Konfirmasi password tidak cocok.', 'error'); return;
    }
    setLoading(true);
    try {
      await register({ ...regForm });
      show('Pendaftaran berhasil! Silakan login.', 'success');
      setTab('login');
    } catch (err) {
      show(err.message || 'Pendaftaran gagal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Responsive styling injected */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .login-container {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          min-height: 100vh;
        }
        .login-left {
          background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 60%, #3b82f6 100%);
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 4.5rem;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content: "";
          position: absolute;
          inset: 0;
          opacity: 0.03;
          background-image: radial-gradient(circle, #ffffff 2px, transparent 2px);
          background-size: 24px 24px;
        }
        .login-right {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2.5rem;
          background-color: var(--bg-main);
        }
        .login-brand-group {
          max-width: 480px;
        }
        .login-feature-card {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-lg);
          padding: 1.25rem 1.5rem;
          margin-top: 2rem;
        }
        .tab-btn {
          flex: 1;
          padding: 1.1rem;
          border: none;
          background: none;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: all var(--transition-fast);
          font-family: 'Outfit', sans-serif;
        }
        .tab-btn:hover {
          color: var(--primary) !important;
          background-color: var(--primary-light);
        }
        @media (max-width: 992px) {
          .login-container {
            grid-template-columns: 1fr;
          }
          .login-left {
            display: none;
          }
        }
      ` }} />

      {/* Left Column - Decorative Branding */}
      <div className="login-left fade-in">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <img
              src="/logo.png"
              alt="Logo SIMCUTI"
              style={{ width: 38, height: 38, objectFit: 'contain' }}
            />
            <span style={{ fontWeight: 800, fontSize: '1.5rem', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              SIMCUTI
            </span>
          </div>

          <div className="login-brand-group">
            <h1 style={{ fontSize: '2.75rem', fontWeight: 800, color: 'white', marginTop: '1.5rem', lineHeight: 1.2, fontFamily: "'Outfit', sans-serif" }}>
              Manajemen Cuti Karyawan Lebih Efisien & Terintegrasi
            </h1>
            <p style={{ opacity: 0.8, fontSize: '0.975rem', marginTop: '1rem', lineHeight: 1.6 }}>
              Sistem berbasis cloud-native dengan arsitektur microservices untuk mempermudah karyawan mengajukan cuti dan HR memantau persetujuan secara real-time.
            </p>

            <div className="login-feature-card">
              <h4 style={{ color: 'white', marginBottom: '0.5rem', fontWeight: 700, fontSize: '0.925rem' }}>
                💡 Kalkulasi Cuti dengan Rekomendasi SAW
              </h4>
              <p style={{ fontSize: '0.8125rem', opacity: 0.85, lineHeight: 1.5 }}>
                Menggunakan algoritma Simple Additive Weighting (SAW) untuk membantu HR memprioritaskan persetujuan cuti secara objektif dan adil berdasarkan kuota dan masa kerja.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Forms */}
      <div className="login-right fade-in">
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Brand Header for Mobile Views */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }} className="mobile-only-header">
            <style dangerouslySetInnerHTML={{
              __html: `
              @media (min-width: 993px) {
                .mobile-only-header { display: none; }
              }
            ` }} />
            <img
              src="/logo.png"
              alt="Logo SIMCUTI"
              style={{ width: 44, height: 44, objectFit: 'contain', marginBottom: '0.5rem' }}
            />
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em', fontFamily: "'Outfit', sans-serif" }}>
              SIMCUTI
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
              Sistem Informasi Manajemen Cuti Karyawan
            </p>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>

            {/* Tab Switcher */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: '#ffffff' }}>
              {['login', 'register'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className="tab-btn"
                  style={{
                    color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                    borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                  }}
                >
                  {t === 'login' ? 'Masuk' : 'Daftar Akun'}
                </button>
              ))}
            </div>

            <div style={{ padding: '2rem' }}>
              {tab === 'login' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="form-group">
                    <label className="form-label">Alamat Email</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="name@company.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label">Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                    {loading ? <Spinner size="sm" color="white" /> : 'Masuk ke Sistem'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="form-group">
                    <label className="form-label">Nama Lengkap</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Nama lengkap Anda"
                      value={regForm.name}
                      onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Alamat Email Kerja</label>
                    <input
                      type="email"
                      className="form-input"
                      placeholder="email@perusahaan.id"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Departemen</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="HR / IT / PR / dll..."
                      value={regForm.department}
                      onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password Baru</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Min. 8 karakter"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: '1.75rem' }}>
                    <label className="form-label">Konfirmasi Password</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Ulangi password baru"
                      value={regForm.confirmPassword}
                      onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width: '100%' }}>
                    {loading ? <Spinner size="sm" color="white" /> : 'Daftar Sekarang'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Footer inside right column */}
          <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.775rem' }}>
              © 2026 SIMCUTI · Institut Teknologi Kalimantan
            </p>
            {onShowAbout && (
              <button
                onClick={onShowAbout}
                id="login-about-link"
                style={{
                  marginTop: '1rem',
                  background: 'none',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)',
                  padding: '0.45rem 1.25rem',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.775rem',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                  backgroundColor: 'white',
                  boxShadow: 'var(--shadow-sm)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--bg-main)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                }}
              >
                ℹ️ Tentang Proyek Ini
              </button>
            )}
          </div>

        </div>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
