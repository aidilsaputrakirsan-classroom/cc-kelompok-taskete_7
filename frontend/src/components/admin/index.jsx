/**
 * SIMCUTI — Admin Components (White & Blue Minimalist)
 */
import { useState, useEffect, useCallback } from 'react';
import { leavesAPI, holidaysAPI, analyticsAPI } from '../../api';
import { Spinner } from '../shared';

// ===================== STATUS SUMMARY CARDS =====================
export function SummaryCards({ data }) {
  if (!data) return <Spinner />;
  const cards = [
    { label: 'Total Karyawan', value: data.total_karyawan, icon: '👥' },
    { label: 'Total Pengajuan', value: data.total_pengajuan, icon: '📋' },
    { label: 'Menunggu', value: data.pending_count, icon: '⏳', color: '#b45309' },
    { label: 'Disetujui', value: data.approved_count, icon: '✅', color: '#15803d' },
    { label: 'Ditolak', value: data.rejected_count, icon: '❌', color: '#b91c1c' },
    { label: 'Total Cuti Diambil', value: data.total_hari_cuti_approved, icon: '📆' },
  ];
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.5rem' }}>
      {cards.map((c) => (
        <div key={c.label} className="card" style={{ textAlign: 'left', padding: '1.5rem', backgroundColor: '#ffffff' }}>
          <div style={{ fontSize: '1.25rem', marginBottom: '1rem', opacity: 0.6 }}>{c.icon}</div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: c.color || 'var(--text-primary)', lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {c.label}
          </div>
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
      background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(2px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem',
    }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="card fade-in" style={{ 
        width: '100%', maxWidth: 540, padding: 0, 
        overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        margin: '2rem auto' 
      }}>
        <div style={{
          padding: '1.25rem 1.75rem', borderBottom: '1px solid var(--border-color)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#fcfcfc'
        }}>
          <h3 style={{ fontWeight: 800, fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.025em' }}>Detail Pengajuan Cuti</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--text-muted)', fontWeight: 300 }}>&times;</button>
        </div>

        <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {[
            ['Nama Karyawan', leave.user?.name],
            ['Departemen', leave.user?.department],
            ['Rencana Tanggal', `${new Date(leave.start_date).toLocaleDateString('id-ID')} — ${new Date(leave.end_date).toLocaleDateString('id-ID')}`],
            ['Durasi Efektif', `${leave.working_days} Hari Kerja`],
            ['Alasan Cuti', leave.reason],
          ].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{k}</span>
              <span style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>{v}</span>
            </div>
          ))}

          <div className="form-group" style={{ marginTop: '0.75rem' }}>
            <label className="form-label" style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Catatan Penolakan (Opsional)</label>
            <textarea
              className="form-input"
              placeholder="Berikan alasan logis jika Anda menolak..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <div style={{
          padding: '1.25rem 2rem', borderTop: '1px solid var(--border-color)',
          display: 'flex', gap: '1rem', justifyContent: 'flex-end', background: '#fcfcfc'
        }}>
          <button onClick={onClose} className="btn btn-outline" style={{ minWidth: 100 }}>Batal</button>
          <button onClick={doReject} className="btn btn-danger" disabled={!!actionLoading} style={{ minWidth: 100 }}>
            {actionLoading === 'reject' ? '...' : 'Tolak'}
          </button>
          <button onClick={doApprove} className="btn btn-primary-purple" disabled={!!actionLoading} style={{ minWidth: 120 }}>
            {actionLoading === 'approve' ? '...' : 'Setujui'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================== DAFTAR AJUAN =====================
export function DaftarAjuan({ showToast, onRefresh }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    leavesAPI.allLeaves({ status: 'pending', limit: 100 })
      .then(res => setItems(res?.items || []))
      .catch(err => { showToast?.(err.response?.data?.detail || err.message, 'error'); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load, onRefresh]);

  const handleApprove = async (id) => {
    try {
      await leavesAPI.approve(id);
      showToast('Pengajuan telah disetujui.', 'success');
      setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };
  const handleReject = async (id, note) => {
    try {
      await leavesAPI.reject(id, note);
      showToast('Pengajuan telah ditolak.', 'info');
      setSelected(null); load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  if (loading) return <Spinner />;

  return (
    <>
      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>Karyawan</th><th>Periode</th><th>Durasi</th><th>Alasan</th><th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 && (
              <tr><td colSpan={5} className="empty-state"><h3>Semua pengajuan telah diproses.</h3><p>Tidak ada pengajuan yang memerlukan tindakan saat ini.</p></td></tr>
            )}
            {items.map((item) => (
              <tr key={item.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.user?.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{item.user?.department}</div>
                </td>
                <td>{new Date(item.start_date).toLocaleDateString('id-ID')} — {new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{item.working_days} hari</td>
                <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.reason}</td>
                <td>
                  <button onClick={() => setSelected(item)} className="btn btn-primary-purple btn-sm">Tinjau</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ModalApproval leave={selected} onApprove={handleApprove} onReject={handleReject} onClose={() => setSelected(null)} />
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
    holidaysAPI.getAll()
      .then(res => setHolidays(res?.items || []))
      .catch(err => { showToast?.(err.message, 'error'); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
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
    if (!confirm(`Hapus agenda libur: ${name}?`)) return;
    try {
      await holidaysAPI.delete(id);
      showToast('Data berhasil dihapus.', 'info');
      load();
    } catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.875rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Tambah Agenda Libur Baru</h4>
        <form onSubmit={handleAdd} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', alignItems: 'end' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Tanggal Libur</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Keterangan Libur</label>
            <input type="text" className="form-input" placeholder="Idul Fitri, Tahun Baru, dll..." value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">Jenis Agenda</label>
            <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="nasional">Hari Libur Nasional</option>
              <option value="cuti_bersama">Cuti Bersama</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary-purple btn-lg" disabled={submitting}>
            {submitting ? '...' : '+ Simpan'}
          </button>
        </form>
      </div>

      {loading ? <Spinner /> : (
        <div className="table-container">
          <table className="table">
            <thead><tr><th>No</th><th>Tanggal</th><th>Agenda Libur</th><th>Kategori</th><th>Opsi</th></tr></thead>
            <tbody>
              {holidays.map((h, i) => (
                <tr key={h.id}>
                  <td>{i + 1}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{new Date(h.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</td>
                  <td>{h.name}</td>
                  <td><span className={`badge ${h.type === 'nasional' ? 'badge-approved' : 'badge-pending'}`}>{h.type === 'nasional' ? 'Nasional' : 'Cuti Bersama'}</span></td>
                  <td><button onClick={() => handleDelete(h.id, h.name)} className="btn btn-outline btn-sm">Hapus</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===================== RIWAYAT SEMUA =====================
export function RiwayatAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    leavesAPI.allLeaves({ status: filter || undefined, limit: 200 })
      .then(res => setItems(res?.items || []))
      .catch(err => { console.error(err); })
      .finally(() => setLoading(false));
  }, [filter]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        {[['', 'Semua'], ['pending', 'Menunggu'], ['approved', 'Disetujui'], ['rejected', 'Ditolak']].map(([v, l]) => (
          <button key={v} onClick={() => setFilter(v)}
            className={`btn btn-sm ${filter === v ? 'btn-primary-purple' : 'btn-outline'}`}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr><th>Karyawan</th><th>Periode Cuti</th><th>Lama</th><th>Status</th><th>Diproses Oleh</th></tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.user?.department}</div>
                  </td>
                  <td>{new Date(item.start_date).toLocaleDateString('id-ID')} — {new Date(item.end_date).toLocaleDateString('id-ID')}</td>
                  <td style={{ fontWeight: 800 }}>{item.working_days} hr</td>
                  <td><span className={`badge badge-${item.status}`}>{item.status}</span></td>
                  <td style={{ fontSize: '0.85rem', fontWeight: 500 }}>{item.admin?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ===================== SAW RECOMMENDATION =====================
export function RekomendasiSAW() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.saw().then(setData).catch(() => { }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <div className="empty-state"><h3>Gagal menarik data kalkulasi SAW.</h3></div>;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div className="card" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h4 style={{ marginBottom: '1.5rem', fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Kriteria & Bobot Penilaian (SAW)</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1.25rem' }}>
          {[
            { label: 'Sisa Kuota', key: 'sisa_kuota' },
            { label: 'Total Ajuan', key: 'total_pengajuan' },
            { label: 'Pending', key: 'pending' },
            { label: 'Approval Rate', key: 'approval_rate' },
            { label: 'Masa Kerja', key: 'masa_kerja' },
          ].map((c) => (
            <div key={c.key} style={{ textAlign: 'center', padding: '1rem', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', background: 'white' }}>
              <div style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--primary)' }}>{(data.bobot[c.key] * 100).toFixed(0)}%</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem', fontWeight: 700, textTransform: 'uppercase' }}>{c.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr><th>Rank</th><th>Karyawan</th><th>Sisa Cuti</th><th>Total Ajuan</th><th>SAW Score</th></tr>
          </thead>
          <tbody>
            {data.data.map((item) => (
              <tr key={item.user_id}>
                <td style={{ fontWeight: 800, color: item.rank === 1 ? 'var(--primary)' : 'inherit' }}>#{item.rank}</td>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>{item.remaining_quota} hari</td>
                <td>{item.total_requests} kali</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ height: 8, width: 80, background: '#e2e8f0', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.saw_score * 100}%`, background: 'var(--primary)' }} />
                    </div>
                    <span style={{ fontWeight: 700, minWidth: 40 }}>{item.saw_score.toFixed(3)}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
