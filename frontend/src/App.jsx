/**
 * SIMCUTI — App Router
 */
import { useState } from 'react';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import KaryawanDashboard from './pages/KaryawanDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AboutPage from './components/AboutPage';
import { Spinner } from './components/shared';
import './App.css';

export default function App() {
  const { user, loading } = useAuth();
  const [showAbout, setShowAbout] = useState(false);

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

  if (showAbout) return <AboutPage onBack={() => setShowAbout(false)} />;

  if (!user) return <LoginPage onShowAbout={() => setShowAbout(true)} />;

  if (user.role === 'admin') return <AdminDashboard onShowAbout={() => setShowAbout(true)} />;
  return <KaryawanDashboard onShowAbout={() => setShowAbout(true)} />;
}