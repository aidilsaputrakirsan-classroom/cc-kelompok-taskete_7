function Header({ totalItems, isConnected, user, onLogout }) {
  return (
    <header style={styles.header}>
      <div>
        <h1 style={styles.title}>☁️ Cloud App</h1>
        <p style={styles.subtitle}>Komputasi Awan — SI ITK</p>
      </div>
      <div style={styles.right}>
        <div style={styles.stats}>
          <span style={styles.badge}>📦 {totalItems} items</span>
          <span style={{
            ...styles.status,
            backgroundColor: isConnected ? "#E8F5E9" : "#FFEBEE",
            color: isConnected ? "#2E7D32" : "#C62828",
            borderColor: isConnected ? "#A5D6A7" : "#EF9A9A",
          }}>
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </span>
        </div>
        {user && (
          <div style={styles.user}>
            <div style={styles.avatar}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <span style={styles.userName}>{user.name}</span>
            <button onClick={onLogout} style={styles.btnLogout}>
              🚪 Logout
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

const styles = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)",
    color: "white",
    borderRadius: "16px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 20px rgba(31, 78, 121, 0.3)",
  },
  title: { margin: 0, fontSize: "1.8rem", fontWeight: 700 },
  subtitle: { margin: "0.25rem 0 0 0", fontSize: "0.85rem", opacity: 0.75 },
  right: { display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.6rem" },
  stats: { display: "flex", gap: "0.5rem", alignItems: "center" },
  badge: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: "0.35rem 0.8rem",
    borderRadius: "20px",
    fontSize: "0.8rem",
    backdropFilter: "blur(4px)",
  },
  status: {
    padding: "0.3rem 0.75rem",
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    border: "1px solid",
  },
  user: { display: "flex", gap: "0.6rem", alignItems: "center" },
  avatar: {
    width: "32px",
    height: "32px",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.85rem",
    fontWeight: "bold",
    border: "2px solid rgba(255,255,255,0.4)",
  },
  userName: { fontSize: "0.85rem", opacity: 0.9, fontWeight: 500 },
  btnLogout: {
    padding: "0.35rem 0.9rem",
    backgroundColor: "rgba(255,255,255,0.15)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.8rem",
    fontWeight: 500,
    transition: "all 0.2s ease",
    backdropFilter: "blur(4px)",
  },
}

export default Header