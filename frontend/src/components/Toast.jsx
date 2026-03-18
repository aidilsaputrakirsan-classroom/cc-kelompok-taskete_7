import { useState, useEffect } from "react"

function Toast({ message, type = "success", duration = 3500, onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    const showTimer = setTimeout(() => setIsVisible(true), 10)

    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => {
      clearTimeout(showTimer)
      clearTimeout(dismissTimer)
    }
  }, [duration])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 300)
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }

  const colors = {
    success: {
      bg: "linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)",
      border: "#4CAF50",
      text: "#2E7D32",
      progressBar: "#4CAF50",
      shadow: "rgba(76, 175, 80, 0.3)",
    },
    error: {
      bg: "linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)",
      border: "#F44336",
      text: "#C62828",
      progressBar: "#F44336",
      shadow: "rgba(244, 67, 54, 0.3)",
    },
    warning: {
      bg: "linear-gradient(135deg, #FFF8E1 0%, #FFECB3 100%)",
      border: "#FF9800",
      text: "#E65100",
      progressBar: "#FF9800",
      shadow: "rgba(255, 152, 0, 0.3)",
    },
    info: {
      bg: "linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)",
      border: "#2196F3",
      text: "#1565C0",
      progressBar: "#2196F3",
      shadow: "rgba(33, 150, 243, 0.3)",
    },
  }

  const colorScheme = colors[type] || colors.success

  return (
    <div
      style={{
        ...styles.toast,
        background: colorScheme.bg,
        borderLeft: `4px solid ${colorScheme.border}`,
        color: colorScheme.text,
        boxShadow: `0 8px 32px ${colorScheme.shadow}, 0 2px 8px rgba(0,0,0,0.08)`,
        transform: isVisible && !isExiting
          ? "translateX(0) scale(1)"
          : "translateX(120%) scale(0.8)",
        opacity: isVisible && !isExiting ? 1 : 0,
      }}
    >
      <div style={styles.content}>
        <span style={styles.icon}>{icons[type]}</span>
        <span style={styles.message}>{message}</span>
        <button
          onClick={handleClose}
          style={{
            ...styles.closeBtn,
            color: colorScheme.text,
          }}
          aria-label="Tutup notifikasi"
        >
          ✕
        </button>
      </div>

      {/* Progress bar countdown */}
      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressBar,
            backgroundColor: colorScheme.progressBar,
            animationDuration: `${duration}ms`,
          }}
        />
      </div>
    </div>
  )
}

/**
 * ToastContainer: manages a stack of toasts.
 * Usage: <ToastContainer toasts={toasts} onRemove={removeToast} />
 */
export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration || 3500}
          onClose={() => onRemove(toast.id)}
        />
      ))}
    </div>
  )
}

/**
 * Custom hook: useToast
 * Returns { toasts, addToast, removeToast }
 */
let toastIdCounter = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const addToast = (message, type = "success", duration = 3500) => {
    const id = ++toastIdCounter
    setToasts((prev) => [...prev, { id, message, type, duration }])

    // Auto cleanup
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration + 400)

    return id
  }

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast }
}

const styles = {
  container: {
    position: "fixed",
    top: "1.5rem",
    right: "1.5rem",
    zIndex: 9999,
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
    maxWidth: "420px",
    width: "100%",
    pointerEvents: "none",
  },
  toast: {
    pointerEvents: "auto",
    borderRadius: "12px",
    overflow: "hidden",
    transition: "all 0.35s cubic-bezier(0.4, 0, 0.2, 1)",
    backdropFilter: "blur(8px)",
  },
  content: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    padding: "1rem 1.25rem",
  },
  icon: {
    fontSize: "1.25rem",
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontSize: "0.9rem",
    fontWeight: 600,
    lineHeight: 1.4,
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  closeBtn: {
    background: "none",
    border: "none",
    fontSize: "1rem",
    cursor: "pointer",
    opacity: 0.6,
    padding: "0.25rem",
    lineHeight: 1,
    flexShrink: 0,
    transition: "opacity 0.2s",
    borderRadius: "4px",
  },
  progressTrack: {
    height: "3px",
    backgroundColor: "rgba(0,0,0,0.06)",
    width: "100%",
  },
  progressBar: {
    height: "100%",
    width: "100%",
    transformOrigin: "left",
    animation: "toastProgress linear forwards",
  },
}

export default Toast
