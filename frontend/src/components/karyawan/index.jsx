/**
 * SIMCUTI — Karyawan Components (White & Blue Minimalist)
 */
import { useState, useEffect } from 'react';
import { leavesAPI, holidaysAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Spinner } from '../shared';

// ==================== STATUS CUTI ====================
export function StatusCuti({ onRefresh }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, [onRefresh]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await leavesAPI.myLeaves({ limit: 200 });
      const year = new Date().getFullYear();
      const approved = res.items.filter(l => 
        l.status === 'approved' && 
        l.start_date && l.start_date.substring(0, 4) === String(year)
      );
      const usedDays = approved.reduce((sum, l) => sum + Number(l.working_days || 0), 0);
      const pending = res.items.filter(l => l.status === 'pending').length;
      setStats({ usedDays, pending, total: user?.annual_leave_quota ?? 12 });
    } catch { setStats(null); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner />;

  const totalQuota = stats?.total ?? 12;
  const remaining = totalQuota - (stats?.usedDays || 0);
  const pct = Math.min(100, ((stats?.usedDays || 0) / (totalQuota || 1)) * 100);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Kuota Tahunan', value: stats?.total ?? 12, icon: '📅' },
          { label: 'Sudah Digunakan', value: stats?.usedDays || 0, icon: '✅' },
          { label: 'Sisa Kuota', value: remaining, icon: '🗓️', highlight: true },
          { label: 'Menunggu Approval', value: stats?.pending || 0, icon: '⏳' },
        ].map((s) => (
          <div key={s.label} className="card" style={{ 
            textAlign: 'left', 
            border: s.highlight ? '1px solid var(--primary)' : '1px solid var(--border-color)',
            backgroundColor: s.highlight ? 'var(--primary-light)' : '#ffffff'
          }}>
            <div style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.7 }}>{s.icon}</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: s.highlight ? 'var(--primary)' : 'var(--text-primary)', lineHeight: 1 }}>{s.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{s.label}</div>
          </div>
        ))}
      </div>
      
      {/* Progress Card */}
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pemakaian Kuota Cuti (%)</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary)' }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ background: '#e2e8f0', borderRadius: 99, height: 10, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.75rem', fontWeight: 500 }}>
          Anda telah menggunakan {stats?.usedDays || 0} dari {stats?.total ?? 12} hari jatah cuti tahun ini.
        </p>
      </div>
    </div>
  );
}

// ==================== KALENDER LIBUR ====================
export function KalenderLibur() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    holidaysAPI.getAll().then(res => setHolidays(res?.items || [])).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const upcoming = holidays.filter(h => new Date(h.date) >= new Date()).slice(0, 10);

  if (loading) return <Spinner />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {upcoming.length === 0 && <div className="empty-state"><h3>Belum ada agenda libur mendatang.</h3></div>}
      {upcoming.map((h) => (
        <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.25rem', borderBottom: '1px solid #f1f5f9' }}>
          <div style={{ 
            width: 50, height: 50, background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontWeight: 800 
          }}>
             <span style={{ color: 'var(--primary)', fontSize: '1rem' }}>{new Date(h.date).getDate()}</span>
             <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>{new Date(h.date).toLocaleString('id-ID', { month: 'short' })}</span>
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)' }}>{h.name}</p>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric' })}</p>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, padding: '0.3rem 0.75rem', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 99, textTransform: 'uppercase' }}>
            {h.type === 'nasional' ? 'Nasional' : 'Cuti Bersama'}
          </span>
        </div>
      ))}
    </div>
  );
}

// ==================== FORM PENGAJUAN ====================
export function FormPengajuan({ onSuccess, showToast }) {
  const [form, setForm] = useState({ start_date: '', end_date: '', reason: '', emergency_contact: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validasi Tanggal
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);

    if (start < today) {
      return showToast('Tanggal mulai tidak boleh di masa lalu.', 'error');
    }
    if (end < start) {
      return showToast('Tanggal terakhir harus sama atau setelah tanggal mulai.', 'error');
    }

    setLoading(true);
    try {
      await leavesAPI.create({ ...form });
      showToast('Pengajuan berhasil dikirim!', 'success');
      setForm({ start_date: '', end_date: '', reason: '', emergency_contact: '' });
      onSuccess?.();
    } catch (err) { 
      showToast(err.response?.data?.detail || err.message, 'error'); 
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="form-group">
            <label className="form-label">Tanggal Mulai Cuti</label>
            <input type="date" className="form-input" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Terakhir Cuti</label>
            <input type="date" className="form-input" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} required />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Alasan Pengajuan</label>
          <textarea className="form-input" placeholder="Tuliskan alasan lengkap Anda..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={4} required />
        </div>
        <div className="form-group">
          <label className="form-label">Nomor Kontak Darurat</label>
          <input type="text" className="form-input" placeholder="Contoh: 0812xxxx (Nama)" value={form.emergency_contact} onChange={e => setForm({...form, emergency_contact: e.target.value})} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary-purple btn-lg" disabled={loading} style={{ paddingLeft: '3rem', paddingRight: '3rem' }}>
            {loading ? <Spinner size="sm" color="white" /> : 'Kirim Pengajuan Cuti'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ==================== HISTORI CUTI ====================
export function HistoriCuti({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    leavesAPI.myLeaves({ status: filter || undefined })
      .then(res => setItems(res?.items || []))
      .catch((err) => { console.error(err); })
      .finally(() => setLoading(false));
  }, [refreshKey, filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        {[['', 'Semua Status'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)} className={`btn btn-sm ${filter === v ? 'btn-primary-purple' : 'btn-outline'}`}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>Periode Cuti</th><th>Durasi</th><th>Alasan</th><th>Status</th></tr></thead>
            <tbody>
              {items.length === 0 && <tr><td colSpan={4} className="empty-state"><h3>Data histori tidak ditemukan.</h3></td></tr>}
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{new Date(item.start_date).toLocaleDateString('id-ID')} — {new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{item.working_days} hari</td>
                  <td style={{ maxWidth: 300, fontSize: '0.875rem' }}>{item.reason}</td>
                  <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
