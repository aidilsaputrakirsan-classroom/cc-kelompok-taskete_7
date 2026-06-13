/**
 * SIMCUTI — About Page (Nordic Redesign)
 */
import { useState } from 'react';

const TEAM = [
  {
    name: 'Noviansyah',
    nim: '10231072',
    role: 'Lead Backend',
    github: 'Noviansyahhh',
    emoji: '🛠️',
    color: '#0d9488', // Teal
  },
  {
    name: 'Irwan Maulana',
    nim: '10231046',
    role: 'Lead Frontend',
    github: 'Irwannnnn',
    emoji: '🎨',
    color: '#2563eb', // Electric Blue
  },
  {
    name: 'Rayhan Iqbal',
    nim: '10231080',
    role: 'Lead DevOps',
    github: 'RayhanIIqbal13',
    emoji: '⚙️',
    color: '#d97706', // Amber
  },
  {
    name: 'Amalia Tiara Rezfani',
    nim: '10231012',
    role: 'Lead QA & Docs',
    github: '10231012tiara',
    emoji: '📝',
    color: '#16a34a', // Emerald
  },
];

const TECH_STACK = [
  {
    category: 'Frontend',
    icon: '⚛️',
    items: ['React 18', 'Vite', 'Vanilla CSS'],
    color: '#2563eb',
    description: 'Single Page Application dengan React & Vite untuk pengalaman pengguna yang cepat dan responsif.',
  },
  {
    category: 'Backend',
    icon: '⚡',
    items: ['FastAPI', 'Python 3', 'SQLAlchemy'],
    color: '#0d9488',
    description: 'REST API berkinerja tinggi dengan FastAPI, dilengkapi ORM SQLAlchemy untuk manajemen data.',
  },
  {
    category: 'Database',
    icon: '🗄️',
    items: ['PostgreSQL', 'Alembic Migrations'],
    color: '#7c3aed',
    description: 'Database relasional PostgreSQL dengan migrasi schema menggunakan Alembic.',
  },
  {
    category: 'DevOps',
    icon: '🐳',
    items: ['Docker', 'Docker Compose', 'GitHub Actions'],
    color: '#0891b2',
    description: 'Containerisasi penuh dengan Docker & orkestrasi via Docker Compose. CI/CD dengan GitHub Actions.',
  },
];

const MILESTONES = [
  { phase: 'Fase 1', title: 'Foundation', weeks: 'Minggu 1-4', status: 'done', desc: 'Setup repo, Docker, dan dasar backend + frontend.' },
  { phase: 'Fase 2', title: 'Full-Stack App', weeks: 'Minggu 5-8', status: 'done', desc: 'Implementasi fitur CRUD, Auth, dan dashboard.' },
  { phase: 'Fase 3', title: 'CI/CD & Deploy', weeks: 'Minggu 9-11', status: 'done', desc: 'Git workflow, branch protection, CI/CD pipeline.' },
  { phase: 'Fase 4', title: 'Monitoring & Security', weeks: 'Minggu 12-16', status: 'done', desc: 'Logging, monitoring, rate-limiting, dan hardening.' },
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
            Aplikasi cloud-native full-stack yang dibangun sebagai proyek akhir mata kuliah
            Komputasi Awan — Program Studi Sistem Informasi, Institut Teknologi Kalimantan.
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
            onMouseEnter={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#f1f5f9';
              }
            }}
            onMouseLeave={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.backgroundColor = '#ffffff';
              }
            }}
          >
            <span style={{ fontSize: '1.1rem', display: 'inline-flex' }}>{tab.icon}</span>
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
          Cloud Computing SI ITK · Kelompok Taskete
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
              animationDelay: `${i * 0.08}s`,
              borderTop: `4px solid ${member.color}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
            }}
          >
            <div style={{
              ...styles.teamAvatar,
              background: `${member.color}10`,
              color: member.color,
              border: `1px solid ${member.color}20`,
            }}>
              <span style={{ fontSize: '1.5rem' }}>{member.emoji}</span>
            </div>
            <h3 style={styles.teamName}>{member.name}</h3>
            <span style={{
              ...styles.roleBadge,
              backgroundColor: `${member.color}12`,
              color: member.color,
              border: `1px solid ${member.color}25`,
            }}>
              {member.role}
            </span>
            <p style={styles.teamNim}>NIM: {member.nim}</p>
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

      {/* Architecture Diagram Card */}
      <div className="card" style={styles.archCard}>
        <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          🏗️ Arsitektur Sistem
        </h4>
        <div style={styles.archFlow}>
          <div style={styles.archNode}>
            <span style={{ fontSize: '1.5rem' }}>👤</span>
            <span style={styles.archLabel}>User</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: 'var(--primary)', background: 'var(--primary-light)' }}>
            <span style={{ fontSize: '1.5rem' }}>🚪</span>
            <span style={{ ...styles.archLabel, color: 'var(--primary)' }}>API Gateway</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: '#0d9488' }}>
            <span style={{ fontSize: '1.5rem' }}>⚡</span>
            <span style={styles.archLabel}>Layanan API</span>
          </div>
          <span style={styles.archArrow}>→</span>
          <div style={{ ...styles.archNode, borderColor: '#7c3aed' }}>
            <span style={{ fontSize: '1.5rem' }}>🗄️</span>
            <span style={styles.archLabel}>PostgreSQL</span>
          </div>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1.5rem', fontWeight: 500 }}>
          Seluruh komponen dijalankan dalam Docker Container dan dideploy pada layanan Railway Cloud
        </p>
      </div>

      {/* Tech Cards */}
      <div style={styles.techGrid}>
        {TECH_STACK.map((tech, i) => (
          <div
            key={i}
            className="card"
            style={styles.techCard}
          >
            <div style={styles.techHeader}>
              <span style={{ fontSize: '1.75rem', display: 'inline-flex' }}>{tech.icon}</span>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                  {tech.category}
                </h3>
              </div>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              {tech.description}
            </p>
            <div style={styles.techTags}>
              {tech.items.map((item, j) => (
                <span key={j} style={{
                  ...styles.techTag,
                  backgroundColor: `${tech.color}08`,
                  color: tech.color,
                  border: `1px solid ${tech.color}20`,
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
        {MILESTONES.map((m, i) => {
          const isDone = m.status === 'done';
          const isCurrent = m.status === 'current';
          return (
            <div key={i} className="fade-in" style={styles.timelineItem}>
              {/* Indicator */}
              <div style={styles.timelineIndicator}>
                <div style={{
                  ...styles.timelineDot,
                  backgroundColor: isDone ? '#10b981' : isCurrent ? 'var(--primary)' : '#cbd5e1',
                  boxShadow: isCurrent ? '0 0 0 4px var(--primary-light)' : 'none',
                }} />
                {i < MILESTONES.length - 1 && (
                  <div style={{
                    ...styles.timelineLine,
                    backgroundColor: isDone ? '#10b981' : '#e2e8f0',
                  }} />
                )}
              </div>

              {/* Content */}
              <div style={{
                ...styles.timelineCard,
                borderLeft: isCurrent
                  ? '3px solid var(--primary)'
                  : isDone
                    ? '3px solid #10b981'
                    : '3px solid #e2e8f0',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    padding: '0.2rem 0.5rem',
                    borderRadius: 4,
                    backgroundColor: isDone ? '#ecfdf5' : isCurrent ? 'var(--primary-light)' : '#f8fafc',
                    color: isDone ? '#10b981' : isCurrent ? 'var(--primary)' : 'var(--text-muted)',
                  }}>
                    {isDone ? '✅ Selesai' : isCurrent ? '🔵 Sedang Berjalan' : '⏳ Akan Datang'}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>{m.weeks}</span>
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', color: 'var(--text-primary)' }}>
                  {m.phase}: {m.title}
                </h4>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem', lineHeight: 1.5 }}>
                  {m.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Shared Components ─── */
function SectionHeader({ title, desc }) {
  return (
    <div style={{ marginBottom: '2.5rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.03em', fontFamily: "'Outfit', sans-serif" }}>
        {title}
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
        {desc}
      </p>
      <div style={{ width: 32, height: 4, background: 'var(--primary)', marginTop: '0.75rem', borderRadius: 2 }} />
    </div>
  );
}

/* ─── Styles ─── */
const styles = {
  wrapper: {
    minHeight: '100vh',
    backgroundColor: 'var(--bg-main)',
    fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
  },

  /* Hero Banner */
  hero: {
    position: 'relative',
    background: '#ffffff',
    borderBottom: '1px solid var(--border-color)',
    padding: '4.5rem 2rem 4rem',
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: '1.5rem',
    left: '2rem',
    background: '#ffffff',
    border: '1px solid var(--border-color)',
    color: 'var(--text-secondary)',
    padding: '0.5rem 1.1rem',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontSize: '0.8125rem',
    fontWeight: 600,
    transition: 'all 0.15s ease',
    boxShadow: 'var(--shadow-sm)',
    outline: 'none',
  },
  heroContent: {
    maxWidth: 680,
    margin: '0 auto',
    paddingTop: '0.5rem',
  },
  heroBadge: {
    display: 'inline-block',
    background: 'var(--primary-light)',
    border: '1px solid rgba(37, 99, 235, 0.15)',
    color: 'var(--primary)',
    padding: '0.35rem 1rem',
    borderRadius: 20,
    fontSize: '0.725rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    marginBottom: '1.25rem',
    textTransform: 'uppercase'
  },
  heroTitle: {
    fontSize: '3rem',
    fontWeight: 800,
    letterSpacing: '-0.04em',
    margin: '0 0 0.5rem',
    fontFamily: "'Outfit', sans-serif"
  },
  heroSubtitle: {
    fontSize: '1.125rem',
    color: 'var(--text-secondary)',
    fontWeight: 500,
    margin: '0 0 1rem',
  },
  heroDesc: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 560,
    marginLeft: 'auto',
    marginRight: 'auto',
  },

  /* Tabbed Navigation */
  tabContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0 2rem',
    marginTop: '-1.25rem',
    position: 'relative',
    zIndex: 10,
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.8rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--border-color)',
    background: '#ffffff',
    fontSize: '0.875rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    color: 'var(--text-secondary)',
    boxShadow: 'var(--shadow-sm)',
    fontFamily: "'Outfit', sans-serif",
    outline: 'none',
  },
  tabActive: {
    background: 'var(--primary)',
    color: 'white',
    borderColor: 'var(--primary)',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
  },

  /* Grid Layouts */
  content: {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '3.5rem 2rem',
  },

  /* Developer Cards */
  teamGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
    gap: '1.5rem',
  },
  teamCard: {
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '2rem 1.5rem',
    textAlign: 'center',
    transition: 'all var(--transition-normal)',
    boxShadow: 'var(--shadow-sm)',
  },
  teamAvatar: {
    width: 60,
    height: 60,
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.25rem',
  },
  teamName: {
    fontWeight: 700,
    fontSize: '1.05rem',
    color: 'var(--text-primary)',
    margin: '0 0 0.5rem',
  },
  roleBadge: {
    display: 'inline-block',
    fontSize: '0.675rem',
    fontWeight: 700,
    padding: '0.2rem 0.65rem',
    borderRadius: 6,
    marginBottom: '0.75rem',
    textTransform: 'uppercase',
    letterSpacing: '0.02em',
  },
  teamNim: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    marginBottom: '0.75rem',
    fontWeight: 500,
  },
  githubLink: {
    fontSize: '0.775rem',
    color: 'var(--primary)',
    fontWeight: 700,
    textDecoration: 'none',
  },

  /* Tech Cards */
  techGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '1.5rem',
  },
  techCard: {
    background: 'white',
    padding: '1.75rem',
    boxShadow: 'var(--shadow-sm)',
    border: '1px solid var(--border-color)',
  },
  techHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '0.85rem',
  },
  techTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.4rem',
  },
  techTag: {
    fontSize: '0.675rem',
    fontWeight: 700,
    padding: '0.25rem 0.65rem',
    borderRadius: 6,
  },

  /* Architecture Diagram */
  archCard: {
    background: 'white',
    padding: '2rem',
    marginBottom: '2rem',
    boxShadow: 'var(--shadow-sm)',
  },
  archFlow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    flexWrap: 'wrap',
    marginTop: '1rem',
  },
  archNode: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem 1.5rem',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border-color)',
    background: '#ffffff',
    minWidth: 120,
    boxShadow: 'var(--shadow-sm)',
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

  /* Project Timeline */
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  timelineItem: {
    display: 'flex',
    gap: '1.5rem',
  },
  timelineIndicator: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: 24,
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
    minHeight: 24,
  },
  timelineCard: {
    flex: 1,
    background: 'white',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border-color)',
    padding: '1.5rem',
    marginBottom: '1rem',
    boxShadow: 'var(--shadow-sm)',
  },

  /* Page Footer */
  footer: {
    textAlign: 'center',
    padding: '2.5rem',
    borderTop: '1px solid var(--border-color)',
    backgroundColor: '#ffffff',
    marginTop: '2rem',
  },
};

export default AboutPage;
