/**
 * SIMCUTI — App Router
 * Route utama: Login → KaryawanDashboard atau AdminDashboard
 */
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import KaryawanDashboard from './pages/KaryawanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import { Spinner } from './components/shared';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();

  // Saat pertama kali load — cek localStorage auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: 'var(--gray-900)', gap: '1rem',
      }}>
        <div style={{ fontSize: '2.5rem' }}>🏢</div>
        <p style={{ color: 'var(--gray-400)', fontSize: '1rem', fontWeight: 500 }}>Memuat SIMCUTI...</p>
        <Spinner color="purple" size="lg" />
      </div>
    );
  }

  // Belum login → tampilkan halaman Login
  if (!user) return <LoginPage />;

  // Sudah login → redirect sesuai role
  if (user.role === 'admin') return <AdminDashboard />;
  return <KaryawanDashboard />;
}