function Spinner({ size = 40, color = "#1F4E79", message = "" }) {
  return (
    <div style={styles.wrapper}>
      <div
        style={{
          ...styles.spinner,
          width: `${size}px`,
          height: `${size}px`,
          borderColor: `${color}20`,
          borderTopColor: color,
          borderWidth: `${Math.max(3, size / 10)}px`,
        }}
      />
      {message && <p style={styles.message}>{message}</p>}
    </div>
  )
}

/**
 * ButtonSpinner: small inline spinner for buttons
 */
export function ButtonSpinner({ size = 16, color = "white" }) {
  return (
    <span
      style={{
        ...styles.buttonSpinner,
        width: `${size}px`,
        height: `${size}px`,
        borderColor: `${color}40`,
        borderTopColor: color,
      }}
    />
  )
}

/**
 * FullPageSpinner: overlay spinner for page-level loading
 */
export function FullPageSpinner({ message = "Memuat..." }) {
  return (
    <div style={styles.overlay}>
      <div style={styles.overlayContent}>
        <div style={styles.pulseContainer}>
          <div style={styles.pulseRing} />
          <div
            style={{
              ...styles.spinner,
              width: "48px",
              height: "48px",
              borderColor: "#1F4E7920",
              borderTopColor: "#1F4E79",
              borderWidth: "4px",
              position: "relative",
              zIndex: 1,
            }}
          />
        </div>
        <p style={styles.overlayMessage}>{message}</p>
      </div>
    </div>
  )
}

/**
 * SkeletonCard: placeholder skeleton for item cards
 */
export function SkeletonCard() {
  return (
    <div style={styles.skeleton}>
      <div style={styles.skeletonHeader}>
        <div style={{ ...styles.skeletonLine, width: "60%", height: "1.1rem" }} />
        <div style={{ ...styles.skeletonLine, width: "25%", height: "1rem" }} />
      </div>
      <div style={{ ...styles.skeletonLine, width: "80%", height: "0.85rem", marginTop: "0.75rem" }} />
      <div style={styles.skeletonMeta}>
        <div style={{ ...styles.skeletonLine, width: "30%", height: "0.75rem" }} />
        <div style={{ ...styles.skeletonLine, width: "40%", height: "0.75rem" }} />
      </div>
      <div style={styles.skeletonActions}>
        <div style={{ ...styles.skeletonLine, width: "45%", height: "2rem", borderRadius: "6px" }} />
        <div style={{ ...styles.skeletonLine, width: "45%", height: "2rem", borderRadius: "6px" }} />
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "2rem",
  },
  spinner: {
    borderStyle: "solid",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
    boxSizing: "border-box",
  },
  message: {
    color: "#555",
    fontSize: "0.95rem",
    margin: 0,
    fontFamily: "'Segoe UI', Arial, sans-serif",
    fontWeight: 500,
  },
  buttonSpinner: {
    display: "inline-block",
    borderWidth: "2px",
    borderStyle: "solid",
    borderRadius: "50%",
    animation: "spin 0.7s linear infinite",
    boxSizing: "border-box",
    verticalAlign: "middle",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.85)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 5000,
  },
  overlayContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "1.25rem",
  },
  pulseContainer: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  pulseRing: {
    position: "absolute",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    border: "2px solid #1F4E79",
    opacity: 0.3,
    animation: "pulse 1.5s ease-in-out infinite",
  },
  overlayMessage: {
    color: "#1F4E79",
    fontSize: "1rem",
    fontWeight: 600,
    margin: 0,
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  // Skeleton styles
  skeleton: {
    backgroundColor: "white",
    padding: "1.25rem",
    borderRadius: "10px",
    border: "1px solid #e0e0e0",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  skeletonHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.5rem",
  },
  skeletonLine: {
    backgroundColor: "#e8e8e8",
    borderRadius: "4px",
    animation: "shimmer 1.5s ease-in-out infinite",
  },
  skeletonMeta: {
    display: "flex",
    gap: "1rem",
    marginTop: "0.75rem",
    marginBottom: "0.75rem",
  },
  skeletonActions: {
    display: "flex",
    gap: "0.5rem",
    borderTop: "1px solid #f0f0f0",
    paddingTop: "0.75rem",
  },
}

export default Spinner
