/**
 * SIMCUTI — Admin Dashboard (Nordic Redesign)
 */
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast, Layout } from '../components/shared';
import { SummaryCards, DaftarAjuan, RiwayatAdmin, KelolaHoliday, RekomendasiSAW } from '../components/admin';
import { analyticsAPI } from '../api';

const MENUS = [
  { id: 'ringkasan', label: 'Ringkasan', icon: '📊' },
  { id: 'ajuan', label: 'Ajuan Pending', icon: '⏳' },
  { id: 'riwayat', label: 'Riwayat Semua', icon: '📋' },
  { id: 'holiday', label: 'Hari Libur', icon: '📅' },
  { id: 'saw', label: 'Rekomendasi SAW', icon: '🏆' },
];

export default function AdminDashboard({ onShowAbout, onShowStatus }) {
  const { user, logout } = useAuth();
  const { toast, show, close } = useToast();
  const [activeMenu, setActiveMenu] = useState('ringkasan');
  const [refreshKey, setRefreshKey] = useState(0);
  const [summary, setSummary] = useState(null);

  const refresh = () => setRefreshKey(k => k + 1);

  useEffect(() => {
    if (activeMenu === 'ringkasan') {
      analyticsAPI.summary()
        .then(setSummary)
        .catch(err => show(err.message, 'error'));
    }
  }, [activeMenu, refreshKey, show]);

  return (
    <>
      <Layout
        user={user}
        menus={MENUS}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        onShowStatus={onShowStatus}
        logout={logout}
      >
        {activeMenu === 'ringkasan' && <SummaryCards data={summary} />}
        {activeMenu === 'ajuan' && <DaftarAjuan showToast={show} onRefresh={refreshKey} />}
        {activeMenu === 'riwayat' && <RiwayatAdmin />}
        {activeMenu === 'holiday' && <KelolaHoliday showToast={show} />}
        {activeMenu === 'saw' && <RekomendasiSAW />}
      </Layout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </>
  );
}
