/**
 * SIMCUTI — Karyawan Components (Nordic Redesign)
 */
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
            borderColor: s.highlight ? 'var(--primary)' : 'var(--border-color)',
            backgroundColor: s.highlight ? 'var(--primary-light)' : '#ffffff',
            boxShadow: s.highlight ? '0 4px 12px rgba(37, 99, 235, 0.08)' : 'var(--shadow-sm)'
          }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center' }}>{s.icon}</div>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 800, 
              color: s.highlight ? 'var(--primary)' : 'var(--text-primary)', 
              lineHeight: 1,
              fontFamily: "'Outfit', sans-serif"
            }}>{s.value}</div>
            <div style={{ 
              fontSize: '0.725rem', 
              color: 'var(--text-muted)', 
              marginTop: '0.5rem', 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              letterSpacing: '0.05em' 
            }}>{s.label}</div>
          </div>
        ))}
      </div>
      
      {/* Progress Card */}
      <div className="card" style={{ background: '#ffffff', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-secondary)' }}>Pemakaian Kuota Cuti (%)</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 850, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ background: 'var(--bg-main)', borderRadius: 'var(--radius-full)', height: 10, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: 'var(--primary)', borderRadius: 'var(--radius-full)', transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)' }} />
        </div>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.85rem', fontWeight: 500 }}>
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

  if (upcoming.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-emoji">📅</div>
        <h3>Belum ada agenda libur mendatang</h3>
        <p>Tidak ada libur nasional atau cuti bersama yang dijadwalkan dalam waktu dekat.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      {upcoming.map((h) => (
        <div key={h.id} style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '1.5rem', 
          padding: '1.25rem 0.5rem', 
          borderBottom: '1px solid var(--border-color)',
          transition: 'background-color var(--transition-fast)'
        }}>
          {/* Timeline Date Box */}
          <div style={{ 
            width: 54, 
            height: 54, 
            background: 'var(--bg-main)', 
            borderRadius: 'var(--radius-md)', 
            border: '1px solid var(--border-color)',
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center', 
            fontWeight: 800,
            flexShrink: 0
          }}>
             <span style={{ color: 'var(--primary)', fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif", lineHeight: 1.1 }}>{new Date(h.date).getDate()}</span>
             <span style={{ fontSize: '0.625rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '1px' }}>{new Date(h.date).toLocaleString('id-ID', { month: 'short' })}</span>
          </div>

          {/* Holiday Information */}
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.925rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{h.name}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0', fontWeight: 500 }}>
              {new Date(h.date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric' })}
            </p>
          </div>

          {/* Category Badge */}
          <span style={{ 
            fontSize: '0.625rem', 
            fontWeight: 800, 
            padding: '0.35rem 0.85rem', 
            background: h.type === 'nasional' ? 'var(--status-approved-bg)' : 'var(--status-pending-bg)', 
            color: h.type === 'nasional' ? 'var(--status-approved-text)' : 'var(--status-pending-text)', 
            border: `1px solid ${h.type === 'nasional' ? 'var(--status-approved-border)' : 'var(--status-pending-border)'}`,
            borderRadius: 'var(--radius-full)', 
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
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
  const [calculation, setCalculation] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  useEffect(() => {
    if (!form.start_date || !form.end_date) {
      setCalculation(null);
      return;
    }
    const start = new Date(form.start_date);
    const end = new Date(form.end_date);
    if (end < start) {
      setCalculation(null);
      return;
    }

    const fetchCalculation = async () => {
      setCalcLoading(true);
      try {
        const res = await leavesAPI.calculate(form.start_date, form.end_date);
        setCalculation(res);
      } catch (err) {
        console.error("Failed to calculate leave days:", err);
        setCalculation(null);
      } finally {
        setCalcLoading(false);
      }
    };

    const timer = setTimeout(fetchCalculation, 300);
    return () => clearTimeout(timer);
  }, [form.start_date, form.end_date]);

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
      setCalculation(null);
      onSuccess?.();
    } catch (err) { 
      showToast(err.response?.data?.detail || err.message, 'error'); 
    }
    finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 640 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '1rem' }}>
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
          <textarea className="form-input" placeholder="Tuliskan alasan lengkap mengapa Anda mengajukan cuti..." value={form.reason} onChange={e => setForm({...form, reason: e.target.value})} rows={4} required />
        </div>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label className="form-label">Nomor Kontak Darurat</label>
          <input type="text" className="form-input" placeholder="Contoh: 08123456789 (Nama Hubungan)" value={form.emergency_contact} onChange={e => setForm({...form, emergency_contact: e.target.value})} />
        </div>

        {/* Live Calculation Preview */}
        {calcLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            <Spinner size="sm" /> Mengkalkulasi hari kerja efektif...
          </div>
        )}

        {calculation && !calcLoading && (
          <div className="card fade-in" style={{
            backgroundColor: 'var(--bg-main)',
            borderColor: 'var(--primary)',
            borderWidth: '1px',
            borderStyle: 'solid',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <h4 style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: 'var(--primary)',
              letterSpacing: '0.05em',
              margin: '0 0 1rem 0',
              fontFamily: "'Outfit', sans-serif"
            }}>
              📊 Estimasi Penggunaan Kuota Cuti
            </h4>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1rem', textAlign: 'center' }}>
              {[
                { label: 'Total Kalender', val: `${calculation.total_calendar_days} hari` },
                { label: 'Hari Kerja Efektif', val: `${calculation.working_days} hari`, highlight: true },
                { label: 'Akhir Pekan', val: `${calculation.weekend_days} hari` },
                { label: 'Libur Nasional', val: `${calculation.holiday_days} hari` }
              ].map(item => (
                <div key={item.label} style={{
                  background: item.highlight ? 'var(--primary-light)' : '#ffffff',
                  border: `1px solid ${item.highlight ? 'var(--primary)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 0.5rem'
                }}>
                  <div style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: 800, 
                    color: item.highlight ? 'var(--primary)' : 'var(--text-primary)',
                    fontFamily: "'Outfit', sans-serif"
                  }}>{item.val}</div>
                  <div style={{ fontSize: '0.625rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginTop: '0.25rem' }}>{item.label}</div>
                </div>
              ))}
            </div>

            {calculation.breakdown.some(b => b.is_holiday) && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Detail Hari Libur Terdeteksi:</span>
                <ul style={{ margin: '0.35rem 0 0 0', paddingLeft: '1.25rem', fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {calculation.breakdown.filter(b => b.is_holiday).map((b, idx) => (
                    <li key={idx}>
                      <strong>{new Date(b.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}</strong>: {b.holiday_name || 'Hari Libur'}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ paddingLeft: '3.5rem', paddingRight: '3.5rem' }}>
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
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    leavesAPI.myLeaves({ status: filter || undefined })
      .then(res => setItems(res?.items || []))
      .catch((err) => { console.error(err); })
      .finally(() => setLoading(false));
  }, [refreshKey, filter]);

  const handleEditClick = (item) => {
    setEditingId(item.id);
    setEditForm({
      start_date: item.start_date,
      end_date: item.end_date,
      reason: item.reason,
      emergency_contact: item.emergency_contact,
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      await leavesAPI.update(editingId, editForm);
      const res = await leavesAPI.myLeaves({ status: filter || undefined });
      setItems(res?.items || []);
      setEditingId(null);
      setEditForm(null);
    } catch (err) {
      console.error('Edit failed:', err);
      alert(err.message || 'Gagal mengubah pengajuan');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteClick = (item) => {
    setShowDeleteConfirm(item.id);
  };

  const handleDeleteConfirm = async () => {
    const id = showDeleteConfirm;
    setDeleteLoading(true);
    try {
      await leavesAPI.delete(id);
      const res = await leavesAPI.myLeaves({ status: filter || undefined });
      setItems(res?.items || []);
      setShowDeleteConfirm(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.message || 'Gagal membatalkan pengajuan');
    } finally {
      setDeleteLoading(false);
    }
  };

  const canEditDelete = (item) => item.status === 'pending';

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[['', 'Semua Status'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([v, l]) => {
            const isActive = filter === v;
            return (
              <button 
                key={v} 
                onClick={() => setFilter(v)} 
                className={`btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
              >
                {l}
              </button>
            );
          })}
        </div>
        {loading ? <Spinner /> : items.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-emoji">📋</div>
            <h3>Belum ada riwayat pengajuan</h3>
            <p>Anda belum pernah mengajukan cuti atau tidak ada data yang cocok dengan status filter ini.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Periode Cuti</th>
                  <th>Durasi</th>
                  <th>Alasan</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'center' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(item.start_date).toLocaleDateString('id-ID')} — {new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.working_days} hari</td>
                    <td style={{ maxWidth: 300, fontSize: '0.875rem' }}>{item.reason}</td>
                    <td>
                      <span className={`badge badge-${item.status}`}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '0.875rem' }}>
                      {canEditDelete(item) ? (
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                          <button 
                            onClick={() => handleEditClick(item)}
                            className="btn btn-sm btn-outline"
                            title="Edit pengajuan"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                          >
                            ✏️ Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item)}
                            className="btn btn-sm btn-outline"
                            title="Batalkan pengajuan"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', color: 'var(--danger)', borderColor: 'var(--status-rejected-border)' }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--status-rejected-bg)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                          >
                            🗑️ Hapus
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Modal - Rendered at document body level */}
      {editingId && editForm && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          overflow: 'auto'
        }} onClick={(e) => e.target === e.currentTarget && setEditingId(null)}>
          <div style={{ 
            width: '100%', maxWidth: 540, padding: 0, 
            overflow: 'hidden', boxShadow: 'var(--shadow-premium)',
            borderRadius: 'var(--radius-lg)', background: 'white', 
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#ffffff'
            }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', margin: 0, fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>✏️ Edit Pengajuan Cuti</h3>
              <button onClick={() => setEditingId(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 300, outline: 'none' }}>&times;</button>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: 'calc(90vh - 160px)', overflow: 'auto' }}>
              <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal Mulai Cuti</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      name="start_date"
                      value={editForm.start_date} 
                      onChange={handleEditChange}
                      required 
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Tanggal Terakhir Cuti</label>
                    <input 
                      type="date" 
                      className="form-input" 
                      name="end_date"
                      value={editForm.end_date} 
                      onChange={handleEditChange}
                      required 
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Alasan Pengajuan</label>
                  <textarea 
                    className="form-input" 
                    placeholder="Tuliskan alasan lengkap Anda..." 
                    name="reason"
                    value={editForm.reason} 
                    onChange={handleEditChange}
                    rows={4} 
                    required 
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Nomor Kontak Darurat</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="Contoh: 0812xxxx (Nama)" 
                    name="emergency_contact"
                    value={editForm.emergency_contact || ''} 
                    onChange={handleEditChange}
                  />
                </div>
              </form>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)',
              display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', background: '#ffffff'
            }}>
              <button 
                type="button"
                onClick={() => { setEditingId(null); setEditForm(null); }}
                disabled={editLoading}
                className="btn btn-outline"
                style={{ minWidth: 90 }}
              >
                Batal
              </button>
              <button 
                type="button"
                onClick={handleEditSubmit}
                disabled={editLoading}
                className="btn btn-primary"
                style={{ minWidth: 110 }}
              >
                {editLoading ? '...' : '💾 Simpan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* Delete Confirmation Modal - Rendered at document body level */}
      {showDeleteConfirm && createPortal(
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.3)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
          overflow: 'auto'
        }} onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(null)}>
          <div style={{ 
            width: '100%', maxWidth: 440, padding: 0, 
            overflow: 'hidden', boxShadow: 'var(--shadow-premium)',
            borderRadius: 'var(--radius-lg)', background: 'white',
            border: '1px solid var(--border-color)',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            {/* Header */}
            <div style={{
              padding: '1.25rem 2rem', borderBottom: '1px solid var(--border-color)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: '#ffffff'
            }}>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--danger)', margin: 0, fontFamily: "'Outfit', sans-serif", textTransform: 'uppercase', letterSpacing: '0.05em' }}>⚠️ Konfirmasi Pembatalan</h3>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 300, outline: 'none' }}>&times;</button>
            </div>

            {/* Content */}
            <div style={{ padding: '2rem' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.6, margin: 0, fontWeight: 500 }}>
                Apakah Anda yakin ingin membatalkan pengajuan cuti ini? Tindakan ini bersifat permanen dan tidak dapat dibatalkan.
              </p>
            </div>

            {/* Footer */}
            <div style={{
              padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)',
              display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', background: '#ffffff'
            }}>
              <button 
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleteLoading}
                className="btn btn-outline"
                style={{ minWidth: 90 }}
              >
                Batal
              </button>
              <button 
                onClick={handleDeleteConfirm}
                disabled={deleteLoading}
                className="btn btn-danger"
                style={{ minWidth: 110 }}
              >
                {deleteLoading ? '...' : '🗑️ Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
