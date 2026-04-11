/**
 * SIMCUTI — LoginPage
 * Halaman login & register dengan tab switching.
 * Setelah sukses, redirect ke dashboard sesuai role.
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast, Spinner } from '../components/shared';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast, show, close } = useToast();
  const [tab, setTab] = useState('login'); // 'login' | 'register'
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  // Register form state
  const [regForm, setRegForm] = useState({
    email: '', name: '', password: '', confirmPassword: '',
    department: '', role: 'karyawan',
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      show('Email dan password wajib diisi.', 'warning'); return;
    }
    setLoading(true);
    try {
      await login(loginForm.email, loginForm.password);
      // Redirect dihandle oleh App.jsx setelah user di-set
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
    if (regForm.password.length < 6) {
      show('Password minimal 6 karakter.', 'warning'); return;
    }
    setLoading(true);
    try {
      await register({
        email: regForm.email, name: regForm.name, password: regForm.password,
        department: regForm.department || null, role: regForm.role,
      });
      show('Pendaftaran berhasil! Silakan login.', 'success');
      setTab('login');
      setLoginForm({ email: regForm.email, password: '' });
    } catch (err) {
      show(err.message || 'Pendaftaran gagal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', top: '-15%', right: '-10%',
        width: '500px', height: '500px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-15%', left: '-10%',
        width: '400px', height: '400px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(5,150,105,0.15) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      {/* Logo & Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem', animation: 'fadeIn 0.6s ease' }}>
        <div style={{
          width: 64, height: 64, borderRadius: '20px', margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, var(--karyawan-primary), var(--karyawan-dark))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', boxShadow: 'var(--shadow-glow-purple)',
        }}>🏢</div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em' }}>
          SIMCUTI
        </h1>
        <p style={{ color: 'var(--gray-400)', marginTop: '0.25rem', fontSize: '0.9rem' }}>
          Sistem Informasi Manajemen Cuti Karyawan
        </p>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Institut Teknologi Kalimantan — Komputasi Awan
        </p>
      </div>

      {/* Card */}
      <div style={{
        width: '100%', maxWidth: '440px',
        background: 'rgba(30, 27, 75, 0.6)',
        border: '1px solid rgba(124, 58, 237, 0.3)',
        borderRadius: 'var(--radius-xl)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
        overflow: 'hidden',
        animation: 'fadeIn 0.6s ease 0.1s both',
      }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid rgba(124,58,237,0.2)',
          background: 'rgba(0,0,0,0.2)',
        }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '1rem', border: 'none', cursor: 'pointer',
                fontSize: '0.9rem', fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.2s ease',
                background: tab === t
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(91,33,182,0.3))'
                  : 'transparent',
                color: tab === t ? 'var(--karyawan-300)' : 'var(--gray-500)',
                borderBottom: tab === t ? '2px solid var(--karyawan-primary)' : '2px solid transparent',
              }}
            >
              {t === 'login' ? '🔑 Masuk' : '📝 Daftar'}
            </button>
          ))}
        </div>

        <div style={{ padding: '1.75rem' }}>
          {/* ===== LOGIN FORM ===== */}
          {tab === 'login' && (
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@simcuti.id"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  id="login-email"
                  autoComplete="email"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  id="login-password"
                  autoComplete="current-password"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-purple btn-lg"
                disabled={loading}
                id="btn-login"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                {loading ? <Spinner size="sm" /> : '🔑 Masuk ke SIMCUTI'}
              </button>

              {/* Demo accounts info */}
              <div style={{
                marginTop: '0.5rem', padding: '0.875rem',
                background: 'rgba(124,58,237,0.08)',
                border: '1px solid rgba(124,58,237,0.2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem', color: 'var(--gray-400)',
              }}>
                <p style={{ fontWeight: 600, color: 'var(--karyawan-300)', marginBottom: '0.375rem' }}>
                  💡 Akun Demo:
                </p>
                <p>👔 Admin: <code style={{ color: 'var(--karyawan-200)' }}>admin@simcuti.id / Admin@2026</code></p>
                <p>👤 Karyawan: <code style={{ color: 'var(--karyawan-200)' }}>irwan@simcuti.id / Karya@2026</code></p>
              </div>
            </form>
          )}

          {/* ===== REGISTER FORM ===== */}
          {tab === 'register' && (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Nama lengkap Anda"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  id="reg-name"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="email@perusahaan.id"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  id="reg-email"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Departemen</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Contoh: Engineering, HR, Finance"
                  value={regForm.department}
                  onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                  id="reg-dept"
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Peran</label>
                <select
                  className="form-select"
                  value={regForm.role}
                  onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                  id="reg-role"
                  style={{ background: 'rgba(30,27,75,0.8)', borderColor: 'rgba(124,58,237,0.3)', color: 'white' }}
                >
                  <option value="karyawan">👤 Karyawan</option>
                  <option value="admin">👔 Admin (HR)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 6 karakter"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  id="reg-password"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Ulangi password"
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  id="reg-confirm"
                  required
                  style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(124,58,237,0.3)' }}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary-purple btn-lg"
                disabled={loading}
                id="btn-register"
                style={{ marginTop: '0.5rem', width: '100%' }}
              >
                {loading ? <Spinner size="sm" /> : '📝 Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <p style={{ marginTop: '1.5rem', color: 'var(--gray-600)', fontSize: '0.75rem' }}>
        © 2026 SIMCUTI — Komputasi Awan, SI ITK
      </p>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
