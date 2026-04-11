/**
 * SIMCUTI — Komponen Karyawan
 * StatusCuti + KalenderLibur + FormPengajuan + HistoriCuti
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

  useEffect(() => {
    loadStats();
  }, [onRefresh]);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await leavesAPI.myLeaves({ limit: 200 });
      const year = new Date().getFullYear();
      const approved = res.items.filter(l => l.status === 'approved' &&
        new Date(l.start_date).getFullYear() === year);
      const usedDays = approved.reduce((sum, l) => sum + l.working_days, 0);
      const pending = res.items.filter(l => l.status === 'pending').length;
      setStats({ usedDays, pending, total: user?.annual_leave_quota || 12 });
    } catch { setStats(null); }
    finally { setLoading(false); }
  };

  if (loading) return <Spinner color="purple" />;

  const remaining = (stats?.total || 12) - (stats?.usedDays || 0);
  const pct = Math.min(100, ((stats?.usedDays || 0) / (stats?.total || 12)) * 100);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
      {[
        { label: 'Total Kuota', value: stats?.total || 12, icon: '📅', color: 'var(--karyawan-400)' },
        { label: 'Digunakan', value: stats?.usedDays || 0, icon: '✅', color: '#22c55e' },
        { label: 'Sisa Cuti', value: remaining, icon: '🗓️', color: remaining > 5 ? '#22c55e' : '#f59e0b', big: true },
        { label: 'Menunggu', value: stats?.pending || 0, icon: '⏳', color: '#f59e0b' },
      ].map((s) => (
        <div key={s.label} style={{
          background: 'rgba(124,58,237,0.08)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '1.25rem',
          textAlign: 'center', transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.75rem', marginBottom: '0.375rem' }}>{s.icon}</div>
          <div style={{
            fontSize: s.big ? '2.25rem' : '1.75rem', fontWeight: 800,
            color: s.color, lineHeight: 1,
          }}>{s.value}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--gray-400)', marginTop: '0.25rem', fontWeight: 500 }}>
            {s.label}
          </div>
        </div>
      ))}
      {/* Progress bar */}
      <div style={{
        gridColumn: '1 / -1',
        background: 'rgba(124,58,237,0.08)',
        border: '1px solid rgba(124,58,237,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', color: 'var(--gray-300)', fontWeight: 600 }}>Penggunaan Kuota Cuti Tahun Ini</span>
          <span style={{ fontSize: '0.875rem', color: 'var(--karyawan-300)', fontWeight: 700 }}>{pct.toFixed(0)}%</span>
        </div>
        <div style={{ background: 'var(--gray-700)', borderRadius: '9999px', height: '8px', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: '9999px', transition: 'width 1s ease',
            width: `${pct}%`,
            background: pct > 80
              ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
              : 'linear-gradient(90deg, var(--karyawan-primary), var(--karyawan-400))',
          }} />
        </div>
        <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', marginTop: '0.375rem' }}>
          {stats?.usedDays || 0} dari {stats?.total || 12} hari cuti digunakan
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
    holidaysAPI.getAll().then(res => {
      setHolidays(res?.items || []);
    }).catch(() => { }).finally(() => setLoading(false));
  }, []);

  const upcoming = holidays
    .filter(h => new Date(h.date) >= new Date())
    .slice(0, 8);

  const typeLabel = { nasional: '🇮🇩 Nasional', cuti_bersama: '🤝 Cuti Bersama' };

  if (loading) return <Spinner color="purple" />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
      {upcoming.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <p>Tidak ada hari libur mendatang.</p>
        </div>
      )}
      {upcoming.map((h) => {
        const d = new Date(h.date);
        return (
          <div key={h.id} style={{
            display: 'flex', alignItems: 'center', gap: '1rem',
            background: 'rgba(124,58,237,0.06)',
            border: '1px solid rgba(124,58,237,0.15)',
            borderRadius: 'var(--radius-md)', padding: '0.875rem',
          }}>
            <div style={{
              minWidth: 48, height: 48, borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, var(--karyawan-primary), var(--karyawan-dark))',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '0.75rem',
            }}>
              <span>{d.toLocaleDateString('id-ID', { day: '2-digit' })}</span>
              <span style={{ fontSize: '0.65rem', opacity: 0.8 }}>
                {d.toLocaleDateString('id-ID', { month: 'short' })}
              </span>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 600, color: 'var(--gray-100)', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {h.name}
              </p>
              <p style={{ fontSize: '0.75rem', color: 'var(--gray-500)', marginTop: '0.125rem' }}>
                {d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <span style={{
              fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem',
              borderRadius: 'var(--radius-full)', background: 'rgba(124,58,237,0.2)',
              color: 'var(--karyawan-300)', whiteSpace: 'nowrap',
            }}>
              {typeLabel[h.type] || h.type}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ==================== FORM PENGAJUAN ====================
export function FormPengajuan({ onSuccess, showToast }) {
  const [form, setForm] = useState({
    start_date: '', end_date: '', reason: '', emergency_contact: '',
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const calcPreview = (start, end) => {
    if (!start || !end || end < start) { setPreview(null); return; }
    const s = new Date(start), e = new Date(end);
    let days = 0, cur = new Date(s);
    while (cur <= e) {
      if (cur.getDay() !== 0 && cur.getDay() !== 6) days++;
      cur.setDate(cur.getDate() + 1);
    }
    setPreview(days);
  };

  const handleChange = (k, v) => {
    const next = { ...form, [k]: v };
    setForm(next);
    if (k === 'start_date' || k === 'end_date') {
      calcPreview(next.start_date, next.end_date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.start_date || !form.end_date || !form.reason) {
      showToast('Tanggal dan alasan wajib diisi.', 'warning'); return;
    }
    setLoading(true);
    try {
      await leavesAPI.create({
        start_date: form.start_date, end_date: form.end_date,
        reason: form.reason, emergency_contact: form.emergency_contact || null,
      });
      showToast('Pengajuan cuti berhasil dikirim! Menunggu persetujuan Admin.', 'success');
      setForm({ start_date: '', end_date: '', reason: '', emergency_contact: '' });
      setPreview(null);
      onSuccess?.();
    } catch (err) {
      showToast(err.message || 'Pengajuan gagal.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div className="form-group">
          <label className="form-label">Tanggal Mulai *</label>
          <input
            type="date" className="form-input"
            value={form.start_date} min={today}
            onChange={(e) => handleChange('start_date', e.target.value)}
            id="leave-start" required
          />
        </div>
        <div className="form-group">
          <label className="form-label">Tanggal Selesai *</label>
          <input
            type="date" className="form-input"
            value={form.end_date} min={form.start_date || today}
            onChange={(e) => handleChange('end_date', e.target.value)}
            id="leave-end" required
          />
        </div>
      </div>

      {preview !== null && (
        <div style={{
          padding: '0.75rem 1rem',
          background: preview > 0 ? 'rgba(124,58,237,0.1)' : 'rgba(239,68,68,0.1)',
          border: `1px solid ${preview > 0 ? 'rgba(124,58,237,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 'var(--radius-md)', fontSize: '0.875rem',
          color: preview > 0 ? 'var(--karyawan-300)' : '#fca5a5',
        }}>
          {preview > 0
            ? `🗓️ Estimasi hari kerja: ~${preview} hari (belum termasuk hari libur nasional)`
            : '⚠️ Rentang tanggal tidak valid atau semua hari adalah weekend.'}
        </div>
      )}

      <div className="form-group">
        <label className="form-label">Alasan Cuti *</label>
        <textarea
          className="form-textarea"
          placeholder="Jelaskan keperluan/alasan pengajuan cuti Anda..."
          value={form.reason}
          onChange={(e) => handleChange('reason', e.target.value)}
          id="leave-reason" rows={3} required
        />
      </div>
      <div className="form-group">
        <label className="form-label">Kontak Darurat <span style={{ color: 'var(--gray-500)', fontWeight: 400 }}>(opsional)</span></label>
        <input
          type="text" className="form-input"
          placeholder="Nama dan nomor HP yang bisa dihubungi"
          value={form.emergency_contact}
          onChange={(e) => handleChange('emergency_contact', e.target.value)}
          id="leave-contact"
        />
      </div>

      <button
        type="submit" className="btn btn-primary-purple"
        disabled={loading} id="btn-submit-leave"
        style={{ alignSelf: 'flex-end', minWidth: '160px' }}
      >
        {loading ? '⏳ Mengirim...' : '📤 Kirim Pengajuan'}
      </button>
    </form>
  );
}

// ==================== HISTORI CUTI ====================
export function HistoriCuti({ refreshKey }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    leavesAPI.myLeaves({ status: filter || undefined }).then(res => {
      setItems(res?.items || []);
    }).catch(() => { }).finally(() => setLoading(false));
  }, [refreshKey, filter]);

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
    const icon = { pending: '⏳', approved: '✅', rejected: '❌' };
    return (
      <span className={`badge ${map[s] || ''}`}>{icon[s]} {s}</span>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[['', 'Semua'], ['pending', 'Pending'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([v, l]) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`btn btn-sm ${filter === v ? 'btn-primary-purple' : 'btn-outline'}`}
          >{l}</button>
        ))}
      </div>

      {loading ? <Spinner color="purple" /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Tanggal Pengajuan</th>
                <th>Periode Cuti</th>
                <th>Hari Kerja</th>
                <th>Alasan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state">
                    <div className="empty-state-icon">📋</div>
                    <h3>Belum ada riwayat cuti</h3>
                    <p>Ajukan cuti pertama Anda melalui form di atas.</p>
                  </div>
                </td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, color: 'var(--gray-200)' }}>
                      {new Date(item.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                    </span>
                    <span style={{ color: 'var(--gray-500)', margin: '0 0.25rem' }}>→</span>
                    <span style={{ fontWeight: 600, color: 'var(--gray-200)' }}>
                      {new Date(item.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 700, color: 'var(--karyawan-300)' }}>{item.working_days}</span>
                    <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}> hari</span>
                  </td>
                  <td style={{ maxWidth: '200px' }}>
                    <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--gray-300)', fontSize: '0.88rem' }} title={item.reason}>
                      {item.reason}
                    </span>
                    {item.status === 'rejected' && item.rejection_note && (
                      <span style={{ display: 'block', fontSize: '0.75rem', color: '#f87171', marginTop: '0.125rem' }}>
                        ⚠️ {item.rejection_note}
                      </span>
                    )}
                  </td>
                  <td>{statusBadge(item.status)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
