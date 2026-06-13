/**
 * SIMCUTI — Karyawan Dashboard (Nordic Redesign)
 */
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Toast, useToast, Layout } from '../components/shared';
import { StatusCuti, KalenderLibur, FormPengajuan, HistoriCuti } from '../components/karyawan';

const MENUS = [
  { id: 'status', label: 'Status Cuti', icon: '📊' },
  { id: 'kalender', label: 'Kalender Libur', icon: '📅' },
  { id: 'ajukan', label: 'Ajukan Cuti', icon: '✍️' },
  { id: 'histori', label: 'Histori Saya', icon: '📋' },
];

export default function KaryawanDashboard({ onShowAbout, onShowStatus }) {
  const { user, logout } = useAuth();
  const { toast, show, close } = useToast();
  const [activeMenu, setActiveMenu] = useState('status');
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = () => setRefreshKey(k => k + 1);

  return (
    <>
      <Layout
        user={user}
        menus={MENUS}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        logout={logout}
      >
        {activeMenu === 'status' && <StatusCuti onRefresh={refreshKey} />}
        {activeMenu === 'kalender' && <KalenderLibur />}
        {activeMenu === 'ajukan' && (
          <FormPengajuan onSuccess={refresh} showToast={show} />
        )}
        {activeMenu === 'histori' && <HistoriCuti refreshKey={refreshKey} />}
      </Layout>

      {toast && <Toast message={toast.message} type={toast.type} onClose={close} />}
    </>
  );
}
