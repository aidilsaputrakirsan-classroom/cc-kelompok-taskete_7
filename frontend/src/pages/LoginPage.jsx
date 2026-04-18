/**
 * SIMCUTI — LoginPage (White & Blue Minimalist)
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast, Toast, Spinner } from '../components/shared';

export default function LoginPage() {
  const { login, register } = useAuth();
  const { toast, show, close } = useToast();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#fafafa',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem',
    }}>
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }} className="fade-in">
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.04em' }}>
          SIMCUTI
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
          Sistem Informasi Manajemen Cuti Karyawan
        </p>
      </div>

      {/* Auth Card */}
      <div className="card fade-in" style={{ 
        width: '100%', maxWidth: '420px', padding: 0, overflow: 'hidden',
        border: '1px solid var(--border-color)',
        boxShadow: '0 4px 20px -2px rgba(0,0,0,0.03)'
      }}>
        {/* Tab Switcher */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: '#fff' }}>
          {['login', 'register'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '1.25rem', border: 'none', background: 'none',
                fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                color: tab === t ? 'var(--primary)' : 'var(--text-muted)',
                borderBottom: tab === t ? '2px solid var(--primary)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              {t === 'login' ? 'Masuk' : 'Daftar Akun'}
            </button>
          ))}
        </div>

        <div style={{ padding: '2.5rem 2rem' }}>
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
              <div className="form-group">
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

              <button type="submit" className="btn btn-primary-purple btn-lg" disabled={loading} style={{ width: '100%' }}>
                {loading ? <Spinner size="sm" color="white" /> : 'Masuk ke Sistem'}
              </button>

              {/* Demo Section */}
              <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Akses Cepat (Demo):
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <p>Admin: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>admin@simcuti.id</span> / Admin@2026</p>
                  <p>Staff: <span style={{ color: 'var(--primary)', fontWeight: 600 }}>irwan@simcuti.id</span> / Karya@2026</p>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column' }}>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Ketik nama lengkap Anda"
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Departemen</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Contoh: HR"
                    value={regForm.department}
                    onChange={(e) => setRegForm({ ...regForm, department: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Peran</label>
                  <select
                    className="form-select"
                    value={regForm.role}
                    onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                  >
                    <option value="karyawan">Karyawan</option>
                    <option value="admin">Admin (HR)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password Baru</label>
                <input
                  type="password"
                  className="form-input"
                  value={regForm.password}
                  onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Konfirmasi Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={regForm.confirmPassword}
                  onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary-purple btn-lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }}>
                {loading ? <Spinner size="sm" color="white" /> : 'Daftar Sekarang'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ marginTop: '3rem', textAlign: 'center' }} className="fade-in">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          © 2026 SIMCUTI — Institut Teknologi Kalimantan
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Cloud Computing SI ITK
        </p>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </div>
  );
}
