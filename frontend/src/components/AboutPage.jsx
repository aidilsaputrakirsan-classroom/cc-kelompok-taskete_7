/**
 * SIMCUTI — About Page
 * Informasi tim, tech stack, dan ringkasan proyek.
 * Dibuat oleh Lead Frontend sebagai tugas Modul 9 (Git Workflow).
 */

import { useState } from 'react';

const TEAM = [
  {
    name: 'Noviansyah',
    nim: '10231072',
    role: 'Lead Backend',
    github: 'Noviansyahhh',
    emoji: '🛠️',
    color: '#0891b2',
  },
  {
    name: 'Irwan Maulana',
    nim: '10231046',
    role: 'Lead Frontend',
    github: 'Irwannnnn',
    emoji: '🎨',
    color: '#2563eb',
  },
  {
    name: 'Rayhan Iqbal',
    nim: '10231080',
    role: 'Lead DevOps',
    github: 'RayhanIIqbal13',
    emoji: '⚙️',
    color: '#eab308',
  },
  {
    name: 'Amalia Tiara Rezfani',
    nim: '10231012',
    role: 'Lead QA & Docs',
    github: '10231012tiara',
    emoji: '📝',
    color: '#16a34a',
  },
];

const TECH_STACK = [
  {
    category: 'Frontend',
    icon: '⚛️',
    color: '#2563eb',
    description: 'Single Page Application dengan React & Vite untuk pengalaman pengguna yang cepat dan responsif.',
  },
  {
    category: 'Backend',
    icon: '⚡', y'],
    color: '#059669',
    description: 'REST API berkinerja tinggi dengan FastAPI, dilengkapi ORM SQLAlchemy untuk manajemen data.',
  },
  {
    category: 'Database',
    icon: '🗄️',
    color: '#7c3aed',
    description: 'Database relasional PostgreSQL dengan migrasi schema menggunakan Alembic.',
  },
  {
    category: 'DevOps',
    icon: '🐳',
    color: '#0891b2',
    description: 'Containerisasi penuh dengan Docker & orkestrasi via Docker Compose. CI/CD dengan GitHub Actions.',
  },
];

const MILESTONES = [
  { phase: 'Fase 1', title: 'Foundation', weeks: 'Minggu 1-4', status: 'done', desc: 'Setup repo, Docker, dan dasar backend + frontend.' },
  { phase: 'Fase 2', title: 'Full-Stack App', weeks: 'Minggu 5-8', status: 'done', desc: 'Implementasi fitur CRUD, Auth, dan dashboard.' },
  { phase: 'Fase 3', title: 'CI/CD & Deploy', weeks: 'Minggu 9-11', status: 'current', desc: 'Git workflow, branch protection, CI/CD pipeline.' },
  { phase: 'Fase 4', title: 'Monitoring', weeks: 'Minggu 12-16', status: 'upcoming', desc: 'Logging, monitoring, dan presentasi akhir.' },
];

function AboutPage({ onBack }) {
  const [activeTab, setActiveTab] = useState('team');

  const tabs = [
    { id: 'team', label: 'Tim Kami', icon: '👥' },
    { id: 'tech', label: 'Tech Stack', icon: '🧰' },
    { id: 'timeline', label: 'Timeline', icon: '🗺️' },
  ];

  return (
    <div style={styles.wrapper}>
      {/* Hero Header */}
      <div style={styles.hero} className="fade-in">
        <button onClick={onBack} style={styles.backBtn} id="about-back-btn">
          ← Kembali
        </button>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>☁️ Cloud Computing Project</div>
          <h1 style={styles.heroTitle}>SIMCUTI</h1>
          <p style={styles.heroSubtitle}>
            Sistem Informasi Manajemen Cuti Karyawan
          </p>
          <p style={styles.heroDesc}>
            Aplikasi cloud-native full-stack yang dibangun sebagai proyek mata kuliah
            Komputasi Awan — Sistem Informasi, Institut Teknologi Kalimantan.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={styles.tabContainer} className="fade-in">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`about-tab-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            style={{
              ...styles.tab,
              ...(activeTab === tab.id ? styles.tabActive : {}),
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content} className="fade-in">
        {activeTab === 'team' && <TeamSection />}
        {activeTab === 'tech' && <TechSection />}
        {activeTab === 'timeline' && <TimelineSection />}
      </div>

      {/* Footer */}
      <div style={styles.footer} className="fade-in">
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>
          © 2026 SIMCUTI — Institut Teknologi Kalimantan
        </p>
        <p style={{ color: '#cbd5e1', fontSize: '0.75rem', marginTop: '0.25rem' }}>
          Cloud Computing SI ITK · Modul 9 – Git Workflow & Branching
        </p>
      </div>
    </div>
  );
}

/* ─── Team Section ─── */
function TeamSection() {
  return (
    <div>
      <SectionHeader
        title="Tim Pengembang"
        desc="Kelompok Taskete — Cloud Computing SI ITK 2026"
      />
      <div style={styles.teamGrid}>
        {TEAM.map((member, i) => (
          <div
            key={i}
            className="fade-in"
            style={{
              ...styles.teamCard,
              animationDelay: `${i * 0.1}s`,
              borderTop: `3px solid ${member.color}`,
            }}
          >
            <div style={{
              ...styles.teamAvatar,
              background: `linear-gradient(135deg, ${member.color}22, ${member.color}11)`,
              color: member.color,
            }}>
              <span style={{ fontSize: '1.5rem' }}>{member.emoji}</span>
            </div>
            <h3 style={styles.teamName}>{member.name}</h3>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: `${member.color}12`,
              color: member.color,
              border: `1px solid ${member.color}30`,
            }}>
              {member.role}
            </span>
            <p style={styles.teamNim}>NIM: {member.nim}</p>
            <p style={styles.teamFocus}>{member.focus}</p>
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener noreferrer"
              style={styles.githubLink}
            >
              @{member.github}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Tech Section ─── */
function TechSection() {
  return (
    <div>
      <SectionHeader
        title="Technology Stack"
        desc="Teknologi yang digunakan dalam membangun SIMCUTI"
      />

      {/* Architecture Diagram */}
      <div style={styles.archCard}>
        <h4 style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          🏗️ Arsitektur Sistem
        </h4>
        <div style={styles.archFlow}>
          <div style={styles.archNode}>
            <span style={{ fontSize: '1.5rem' }}>🌐</span>
            <span style={styles.archLabel}>Browser</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: '#2563eb' }}>
            <span style={{ fontSize: '1.5rem' }}>⚛️</span>
            <span style={styles.archLabel}>React + Vite</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: '#059669' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span style={styles.archLabel}>FastAPI</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: '#7c3aed' }}>
            <span style={{ fontSize: '1.5rem' }}>🗄️</span>
            <span style={styles.archLabel}>PostgreSQL</span>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
          Seluruh komponen dijalankan dalam Docker container via Docker Compose
        </p>
      </div>

      {/* Tech Cards */}
      <div style={styles.techGrid}>
        {TECH_STACK.map((tech, i) => (
          <div
            key={i}
            className="fade-in"
            style={{
              ...styles.techCard,
              animationDelay: `${i * 0.1}s`,
            }}
          >
            <div style={styles.techHeader}>
              <span style={{ fontSize: '1.75rem' }}>{tech.icon}</span>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                  {tech.category}
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
              {tech.description}
            </p>
            <div style={styles.techTags}>
              {tech.items.map((item, j) => (
                <span key={j} style={{
                  ...styles.techTag,
                  backgroundColor: `${tech.color}10`,
                  color: tech.color,
                  border: `1px solid ${tech.color}25`,
                }}>
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Timeline Section ─── */
function TimelineSection() {
  return (
    <div>
      <SectionHeader
        title="Project Timeline"
        desc="Fase pengembangan SIMCUTI selama 1 semester"
      />
      <div style={styles.timeline}>
        {MILESTONES.map((m, i) => (
          <div key={i} className="fade-in" style={{
            ...styles.timelineItem,
            animationDelay: `${i * 0.1}s`,
          }}>
            {/* Indicator */}
            <div style={styles.timelineIndicator}>
              <div style={{
                ...styles.timelineDot,
                backgroundColor: m.status === 'done' ? '#16a34a' :
                  m.status === 'current' ? 'var(--primary)' : '#cbd5e1',
                boxShadow: m.status === 'current' ? '0 0 0 4px var(--primary-light)' : 'none',
              }} />
              {i < MILESTONES.length - 1 && (
                <div style={{
                  ...styles.timelineLine,
                  backgroundColor: m.status === 'done' ? '#16a34a' : '#e2e8f0',
                }} />
              )}
            </div>

            {/* Content */}
            <div style={{
              ...styles.timelineCard,
              borderLeft: m.status === 'current'
                ? '3px solid var(--primary)'
                : m.status === 'done'
                  ? '3px solid #16a34a'
                  : '3px solid #e2e8f0',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  padding: '0.2rem 0.5rem',
                  borderRadius: 4,
                  backgroundColor: m.status === 'done' ? '#f0fdf4' :
                    m.status === 'current' ? 'var(--primary-light)' : '#f8fafc',
                  color: m.status === 'done' ? '#16a34a' :
                    m.status === 'current' ? 'var(--primary)' : 'var(--text-muted)',
                }}>
                  {m.status === 'done' ? '✅ Selesai' :
                    m.status === 'current' ? '🔵 Sedang Berjalan' : '⏳ Akan Datang'}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.weeks}</span>
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                {m.phase}: {m.title}
              </h4>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                {m.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */
function SectionHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em' }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {desc}
      </p>
      <div style={{ width: 40, height: 4, background: 'var(--primary)', marginTop: '0.75rem', borderRadius: 2 }} />
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: '#fafafa',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },

  /* Hero */
  hero: {
    position: 'relative',
    background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 60%, #3b82f6 100%)',
    padding: '3rem 4rem 4rem',
    color: 'white',
  },
  backBtn: {
    position: 'absolute',
    top: '1.5rem',
    left: '2rem',
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    color: 'white',
    padding: '0.5rem 1rem',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 600,
    backdropFilter: 'blur(8px)',
    transition: 'all 0.2s ease',
  },
  heroContent: {
    maxWidth: 640,
    margin: '0 auto',
    textAlign: 'center',
    paddingTop: '1rem',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.2)',
    padding: '0.35rem 1rem',
    borderRadius: 20,
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
    marginBottom: '1rem',
    backdropFilter: 'blur(8px)',
  },
  heroTitle: {
    fontSize: '2.75rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    margin: '0 0 0.5rem',
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    opacity: 0.9,
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  heroDesc: {
    fontSize: '0.875rem',
    opacity: 0.7,
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 520,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  /* Tabs */
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0 2rem',
    marginTop: '-1.5rem',
    position: 'relative',
    zIndex: 1,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.875rem 1.75rem',
    borderRadius: 10,
    border: '1px solid var(--border-color)',
    background: 'white',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    color: 'var(--text-secondary)',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  tabActive: {
    background: 'var(--primary)',
    color: 'white',
    borderColor: 'var(--primary)',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
  },

  /* Content */
  content: {
    maxWidth: 1000,
    margin: '0 auto',
    padding: '3rem 2rem',
  },

  /* Team Grid */
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
    gap: '1.25rem',
  },
  teamCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.75rem 1.25rem',
    textAlign: 'center',
    transition: 'all 0.25s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  teamAvatar: {
    width: 56,
    height: 56,
    borderRadius: 14,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1rem',
  },
  teamName: {
    fontWeight: 700,
    fontSize: '1rem',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '0.6875rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: 6,
    marginBottom: '0.75rem',
  },
  teamNim: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '0.5rem',
  },
  teamFocus: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)',
    lineHeight: 1.5,
    marginBottom: '0.75rem',
  },
  githubLink: {
    fontSize: '0.75rem',
    color: 'var(--primary)',
    fontWeight: 600,
    textDecoration: 'none',
  },

  /* Tech */
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1.25rem',
  },
  techCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    transition: 'all 0.25s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  techHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  techTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  techTag: {
    fontSize: '0.6875rem',
    fontWeight: 700,
    padding: '0.25rem 0.6rem',
    borderRadius: 6,
  },

  /* Architecture */
  archCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.75rem',
    marginBottom: '1.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  archFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
  },
  archNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border-color)',
    background: '#fafafa',
    minWidth: 100,
  },
  archLabel: {
    fontSize: '0.75rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
  },
  archArrow: {
    fontSize: '1.25rem',
    color: 'var(--text-muted)',
    fontWeight: 700,
  },

  /* Timeline */
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  timelineItem: {
    display: 'flex',
    gap: '1.25rem',
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 20,
    flexShrink: 0,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: '50%',
    flexShrink: 0,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 20,
  },
  timelineCard: {
    flex: 1,
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.25rem 1.5rem',
    marginBottom: '0.75rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },

  /* Footer */
  footer: {
    textAlign: 'center',
    padding: '2rem',
    borderTop: '1px solid var(--border-color)',
  },
};

export default AboutPage;
