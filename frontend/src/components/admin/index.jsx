/**
 * SIMCUTI — Komponen Admin
 * DaftarAjuan + ModalApproval + KelolaHoliday + RiwayatAdmin + RekomendasiSAW
 */
import { useState, useEffect, useCallback } from 'react';
import { leavesAPI, holidaysAPI, analyticsAPI } from '../../api';
import { Spinner } from '../shared';

// ===================== STATUS SUMMARY CARDS =====================
export function SummaryCards({ data }) {
  if (!data) return null;
  const cards = [
    { label: 'Total Karyawan', value: data.total_karyawan, icon: '👥', color: '#60a5fa' },
    { label: 'Total Pengajuan', value: data.total_pengajuan, icon: '📋', color: 'var(--admin-400)' },
    { label: 'Menunggu', value: data.pending_count, icon: '⏳', color: '#fbbf24' },
    { label: 'Disetujui', value: data.approved_count, icon: '✅', color: 'var(--admin-primary)' },
    { label: 'Ditolak', value: data.rejected_count, icon: '❌', color: '#f87171' },
    { label: 'Total Hari Cuti', value: data.total_hari_cuti_approved, icon: '📆', color: 'var(--admin-300)' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
      {cards.map((c) => (
        <div key={c.label} style={{
          background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)',
          borderRadius: 'var(--radius-lg)', padding: '1.125rem',
          textAlign: 'center', transition: 'transform 0.2s',
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{c.icon}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.color }}>{c.value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--gray-400)', marginTop: '0.25rem', fontWeight: 500 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}

// ===================== MODAL APPROVAL =====================
function ModalApproval({ leave, onApprove, onReject, onClose }) {
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState(null);
  if (!leave) return null;

  const doApprove = async () => {
    setActionLoading('approve');
    await onApprove(leave.id);
    setActionLoading(null);
  };
  const doReject = async () => {
    setActionLoading('reject');
    await onReject(leave.id, note);
    setActionLoading(null);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
      animation: 'fadeIn 0.2s ease',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: 'var(--gray-800)', borderRadius: 'var(--radius-xl)',
        border: '1px solid var(--gray-600)',
        width: '100%', maxWidth: 520,
        boxShadow: 'var(--shadow-xl)',
        animation: 'fadeIn 0.25s ease',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--gray-700)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h3 style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>
            📋 Tinjau Pengajuan Cuti
          </h3>
          <button onClick={onClose} style={{
            background: 'var(--gray-700)', border: 'none', color: 'var(--gray-300)',
            width: 30, height: 30, borderRadius: '50%', cursor: 'pointer', fontSize: '1rem',
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {[
            ['👤 Karyawan', leave.user?.name || '-'],
            ['📧 Email', leave.user?.email || '-'],
            ['🏢 Departemen', leave.user?.department || '-'],
            ['📅 Periode', `${new Date(leave.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })} → ${new Date(leave.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}`],
            ['🗓️ Hari Kerja', `${leave.working_days} hari`],
            ['📝 Alasan', leave.reason],
            ['☎️ Kontak Darurat', leave.emergency_contact || '-'],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-500)', minWidth: 140 }}>{k}</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--gray-200)', flex: 1 }}>{v}</span>
            </div>
          ))}

          {/* Rejection note */}
          <div className="form-group" style={{ marginTop: '0.5rem' }}>
            <label className="form-label" style={{ color: 'var(--gray-400)' }}>
              Catatan Penolakan <span style={{ fontWeight: 400, color: 'var(--gray-600)' }}>(opsional, hanya untuk Tolak)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Alasan penolakan akan dikirim ke karyawan..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              id="rejection-note"
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1rem 1.5rem', borderTop: '1px solid var(--gray-700)',
          display: 'flex', gap: '0.75rem', justifyContent: 'flex-end',
        }}>
          <button onClick={onClose} className="btn btn-outline btn-sm">Batal</button>
          <button
            onClick={doReject}
            className="btn btn-danger btn-sm"
            disabled={!!actionLoading}
            id="btn-reject"
          >{actionLoading === 'reject' ? '⏳...' : '❌ Tolak'}</button>
          <button
            onClick={doApprove}
            className="btn btn-success btn-sm"
            disabled={!!actionLoading}
            id="btn-approve"
          >{actionLoading === 'approve' ? '⏳...' : '✅ Setujui'}</button>
        </div>
      </div>
    </div>
  );
}

// ===================== DAFTAR AJUAN (PENDING) =====================
export function DaftarAjuan({ showToast, onRefresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    leavesAPI.allLeaves({ status: 'pending', limit: 100 })
      .then(res => setItems(res?.items || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load, onRefresh]);

  const handleApprove = async (id) => {
    try {
      await leavesAPI.approve(id);
      showToast('Pengajuan berhasil disetujui!', 'success');
      setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const handleReject = async (id, note) => {
    try {
      await leavesAPI.reject(id, note);
      showToast('Pengajuan berhasil ditolak.', 'info');
      setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <Spinner color="green" />;

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Karyawan</th><th>Departemen</th><th>Periode</th>
              <th>Hari Kerja</th><th>Alasan</th><th>Diajukan</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={7}>
                <div className="empty-state">
                  <div className="empty-state-icon">🎉</div>
                  <h3>Tidak ada pengajuan pending</h3>
                  <p>Semua pengajuan cuti sudah diproses.</p>
                </div>
              </td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 600, color: 'var(--gray-100)' }}>{item.user?.name || '-'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--gray-500)' }}>{item.user?.email}</div>
                </td>
                <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{item.user?.department || '-'}</td>
                <td style={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                  {new Date(item.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} —{' '}
                  {new Date(item.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <span style={{ fontWeight: 700, color: 'var(--admin-300)' }}>{item.working_days}</span>
                  <span style={{ color: 'var(--gray-500)', fontSize: '0.8rem' }}> hari</span>
                </td>
                <td style={{ maxWidth: 160 }}>
                  <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.85rem', color: 'var(--gray-300)' }} title={item.reason}>
                    {item.reason}
                  </span>
                </td>
                <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                  {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td>
                  <button
                    onClick={() => setSelected(item)}
                    className="btn btn-primary-green btn-sm"
                    id={`btn-review-${item.id}`}
                  >👁 Tinjau</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalApproval
        leave={selected}
        onApprove={handleApprove}
        onReject={handleReject}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

// ===================== KELOLA HARI LIBUR =====================
export function KelolaHoliday({ showToast }) {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ date: '', name: '', type: 'nasional' });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    setLoading(true);
    holidaysAPI.getAll().then(res => setHolidays(res?.items || [])).catch(() => { }).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.date || !form.name) { showToast('Tanggal dan nama wajib diisi.', 'warning'); return; }
    setSubmitting(true);
    try {
      await holidaysAPI.create(form);
      showToast('Hari libur berhasil ditambahkan.', 'success');
      setForm({ date: '', name: '', type: 'nasional' });
      load();
    } catch (e) { showToast(e.message, 'error'); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Hapus "${name}"?`)) return;
    try {
      await holidaysAPI.delete(id);
      showToast('Hari libur dihapus.', 'info');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Add form */}
      <div style={{
        background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      }}>
        <h4 style={{ color: 'var(--admin-300)', marginBottom: '1rem', fontWeight: 700 }}>➕ Tambah Hari Libur</h4>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr auto', gap: '0.75rem', alignItems: 'end' }}>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <input type="date" className="form-input form-input-admin" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })} id="holiday-date" required />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Hari Libur</label>
            <input type="text" className="form-input form-input-admin" placeholder="Contoh: Hari Kemerdekaan RI"
              value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} id="holiday-name" required />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe</label>
            <select className="form-select form-select-admin" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })} id="holiday-type"
              style={{ background: '#1a2332', color: 'white' }}>
              <option value="nasional">🇮🇩 Nasional</option>
              <option value="cuti_bersama">🤝 Cuti Bersama</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary-green btn-sm" disabled={submitting} id="btn-add-holiday">
            {submitting ? '⏳' : '+ Tambah'}
          </button>
        </form>
      </div>

      {/* List */}
      {loading ? <Spinner color="green" /> : (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>No</th><th>Tanggal</th><th>Nama</th><th>Tipe</th><th>Aksi</th></tr></thead>
            <tbody>
              {holidays.length === 0 && (
                <tr><td colSpan={5}>
                  <div className="empty-state"><div className="empty-state-icon">📅</div><p>Belum ada hari libur.</p></div>
                </td></tr>
              )}
              {holidays.map((h, i) => (
                <tr key={h.id}>
                  <td style={{ color: 'var(--gray-500)' }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap', color: 'var(--admin-300)' }}>
                    {new Date(h.date).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'long', year: 'numeric' })}
                  </td>
                  <td style={{ color: 'var(--gray-200)' }}>{h.name}</td>
                  <td>
                    <span style={{
                      fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)',
                      background: h.type === 'nasional' ? 'rgba(5,150,105,0.15)' : 'rgba(99,102,241,0.15)',
                      color: h.type === 'nasional' ? 'var(--admin-300)' : '#a5b4fc',
                      fontWeight: 600,
                    }}>
                      {h.type === 'nasional' ? '🇮🇩 Nasional' : '🤝 Cuti Bersama'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleDelete(h.id, h.name)} className="btn btn-danger btn-sm" id={`btn-del-holiday-${h.id}`}>
                      🗑 Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===================== RIWAYAT SEMUA AJUAN =====================
export function RiwayatAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    leavesAPI.allLeaves({ status: filter || undefined, limit: 200 })
      .then(res => setItems(res?.items || []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [filter]);

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', approved: 'badge-approved', rejected: 'badge-rejected' };
    const icon = { pending: '⏳', approved: '✅', rejected: '❌' };
    return <span className={`badge ${map[s] || ''}`}>{icon[s]} {s}</span>;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {[['', 'Semua'], ['pending', 'Pending'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`btn btn-sm ${filter === v ? 'btn-primary-green' : 'btn-outline'}`}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner color="green" /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Karyawan</th><th>Departemen</th><th>Periode</th><th>Hari Kerja</th><th>Status</th><th>Diproses Oleh</th><th>Diajukan</th></tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={7}>
                  <div className="empty-state"><div className="empty-state-icon">📊</div><p>Tidak ada data.</p></div>
                </td></tr>
              )}
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-100)' }}>{item.user?.name || '-'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.user?.email}</div>
                  </td>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>{item.user?.department || '-'}</td>
                  <td style={{ fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                    {new Date(item.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })} — {new Date(item.end_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td><span style={{ fontWeight: 700, color: 'var(--admin-300)' }}>{item.working_days}</span></td>
                  <td>{statusBadge(item.status)}</td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>{item.admin?.name || '-'}</td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--gray-500)', whiteSpace: 'nowrap' }}>
                    {new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===================== REKOMENDASI SAW =====================
export function RekomendasiSAW() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.saw().then(setData).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner color="green" />;
  if (!data) return <div className="empty-state"><p>Gagal memuat data SAW.</p></div>;

  const bobot = data.bobot;
  const items = data.data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Bobot Kriteria */}
      <div style={{
        background: 'rgba(5,150,105,0.07)', border: '1px solid rgba(5,150,105,0.2)',
        borderRadius: 'var(--radius-lg)', padding: '1.25rem',
      }}>
        <h4 style={{ color: 'var(--admin-300)', marginBottom: '1rem', fontWeight: 700, fontSize: '0.95rem' }}>
          📐 Kriteria & Bobot SAW
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem' }}>
          {[
            { label: 'Sisa Kuota', key: 'sisa_kuota', icon: '📅', type: 'Benefit' },
            { label: 'Total Pengajuan', key: 'total_pengajuan', icon: '📋', type: 'Cost' },
            { label: 'Jumlah Pending', key: 'pending', icon: '⏳', type: 'Cost' },
            { label: '% Disetujui', key: 'approval_rate', icon: '✅', type: 'Benefit' },
            { label: 'Masa Kerja', key: 'masa_kerja', icon: '📆', type: 'Benefit' },
          ].map((c) => (
            <div key={c.key} style={{
              textAlign: 'center', padding: '0.75rem',
              background: 'rgba(0,0,0,0.2)', borderRadius: 'var(--radius-md)',
            }}>
              <div style={{ fontSize: '1.25rem' }}>{c.icon}</div>
              <div style={{ fontWeight: 700, color: 'white', fontSize: '1.1rem' }}>{((bobot[c.key] || 0) * 100).toFixed(0)}%</div>
              <div style={{ fontSize: '0.73rem', color: 'var(--gray-400)', marginTop: '0.125rem' }}>{c.label}</div>
              <div style={{
                fontSize: '0.65rem', marginTop: '0.25rem',
                color: c.type === 'Benefit' ? 'var(--admin-300)' : '#f87171', fontWeight: 600,
              }}>{c.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Ranking Table */}
      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📊</div>
          <h3>Belum ada karyawan</h3>
          <p>Belum ada data karyawan untuk dihitung.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Rank</th><th>Karyawan</th><th>Sisa Kuota</th>
                <th>Total Ajuan</th><th>Pending</th><th>% Approved</th>
                <th>Masa Kerja</th><th>Skor SAW</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.user_id}>
                  <td>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: item.rank <= 3
                        ? ['linear-gradient(135deg,#ffd700,#b8860b)', 'linear-gradient(135deg,#c0c0c0,#808080)', 'linear-gradient(135deg,#cd7f32,#8b4513)'][item.rank - 1]
                        : 'var(--gray-700)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontWeight: 800, fontSize: '0.85rem', color: item.rank <= 3 ? '#fff' : 'var(--gray-400)',
                    }}>
                      {item.rank <= 3 ? ['🥇', '🥈', '🥉'][item.rank - 1] : item.rank}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--gray-100)' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>{item.department || '-'}</div>
                  </td>
                  <td><span style={{ fontWeight: 700, color: item.remaining_quota > 5 ? 'var(--admin-300)' : '#f59e0b' }}>{item.remaining_quota}</span><span style={{ color: 'var(--gray-500)', fontSize: '0.78rem' }}> hari</span></td>
                  <td style={{ color: 'var(--gray-300)' }}>{item.total_requests}</td>
                  <td>
                    <span style={{ color: item.pending_requests > 0 ? '#fbbf24' : 'var(--gray-500)' }}>
                      {item.pending_requests}
                    </span>
                  </td>
                  <td style={{ color: item.approval_rate >= 80 ? 'var(--admin-300)' : '#f87171' }}>
                    {item.approval_rate.toFixed(1)}%
                  </td>
                  <td style={{ color: 'var(--gray-400)', fontSize: '0.85rem' }}>
                    {Math.floor(item.working_days / 365)} thn {Math.floor((item.working_days % 365) / 30)} bln
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{
                        height: 6, width: 60, background: 'var(--gray-700)', borderRadius: '3px', overflow: 'hidden',
                      }}>
                        <div style={{
                          height: '100%', width: `${(item.saw_score * 100).toFixed(0)}%`,
                          background: 'linear-gradient(90deg, var(--admin-primary), var(--admin-400))',
                          borderRadius: '3px',
                        }} />
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--admin-300)', fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                        {item.saw_score.toFixed(4)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
