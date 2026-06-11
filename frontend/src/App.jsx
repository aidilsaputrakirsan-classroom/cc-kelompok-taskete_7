/**
 * SIMCUTI — App Router
 */
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { useServiceStatus } from './context/ServiceStatusContext';
import LoginPage from './pages/LoginPage';
import KaryawanDashboard from './pages/KaryawanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ServiceUnavailablePage from './pages/ServiceUnavailablePage';
import StatusPage from './pages/StatusPage';
import AboutPage from './components/AboutPage';
import { Spinner, DegradedBanner } from './components/shared';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();
  const { isUnavailable } = useServiceStatus();
  const [showAbout, setShowAbout] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  // Jika server/gateway offline total (503), tampilkan halaman fallback blocking
  if (isUnavailable) {
    return <ServiceUnavailablePage />;
  }

  if (showStatus) {
    return <StatusPage onBack={() => setShowStatus(false)} />;
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: 'var(--bg-main)', gap: '1.5rem',
      }}>
        <div style={{ fontSize: '3rem', animation: 'pulse 2s infinite' }}>🏢</div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500, letterSpacing: '0.05em' }}>
          Memuat SIMCUTI...
        </p>
        <Spinner color="gray" size="lg" />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <DegradedBanner />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {showAbout ? (
          <AboutPage onBack={() => setShowAbout(false)} />
        ) : !user ? (
          <LoginPage onShowAbout={() => setShowAbout(true)} />
        ) : user.role === 'admin' ? (
          <AdminDashboard onShowAbout={() => setShowAbout(true)} onShowStatus={() => setShowStatus(true)} />
        ) : (
          <KaryawanDashboard onShowAbout={() => setShowAbout(true)} onShowStatus={() => setShowStatus(true)} />
        )}
      </div>
    </div>
  );
}