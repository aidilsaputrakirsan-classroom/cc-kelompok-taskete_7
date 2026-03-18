import { useState } from "react"
import { ButtonSpinner } from "./Spinner"

function LoginPage({ onLogin, onRegister }) {
  const [isRegister, setIsRegister] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (isRegister) {
        if (!formData.name.trim()) {
          setError("Nama wajib diisi")
          setLoading(false)
          return
        }
        if (formData.password.length < 8) {
          setError("Password minimal 8 karakter")
          setLoading(false)
          return
        }
        await onRegister(formData)
      } else {
        await onLogin(formData.email, formData.password)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.logoContainer}>
          <span style={styles.logo}>☁️</span>
        </div>
        <h1 style={styles.title}>Cloud App</h1>
        <p style={styles.subtitle}>Komputasi Awan — SI ITK</p>

        {/* Tab Switch */}
        <div style={styles.tabs}>
          <button
            style={{ ...styles.tab, ...(isRegister ? {} : styles.tabActive) }}
            onClick={() => { setIsRegister(false); setError("") }}
          >
            🔐 Login
          </button>
          <button
            style={{ ...styles.tab, ...(isRegister ? styles.tabActive : {}) }}
            onClick={() => { setIsRegister(true); setError("") }}
          >
            📝 Register
          </button>
        </div>

        {error && (
          <div style={styles.error}>
            <span>❌</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegister && (
            <div style={styles.field}>
              <label style={styles.label}>Nama Lengkap</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nama Lengkap"
                style={styles.input}
                disabled={loading}
              />
            </div>
          )}

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@student.itk.ac.id"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimal 8 karakter"
              required
              style={styles.input}
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            style={{
              ...styles.btnSubmit,
              ...(loading ? styles.btnDisabled : {}),
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <ButtonSpinner size={16} color="white" />{" "}
                {isRegister ? "Mendaftarkan..." : "Masuk..."}
              </>
            ) : (
              isRegister ? "📝 Register" : "🔐 Login"
            )}
          </button>
        </form>

        <p style={styles.footer}>
          {isRegister
            ? "Sudah punya akun? "
            : "Belum punya akun? "}
          <span
            style={styles.link}
            onClick={() => { setIsRegister(!isRegister); setError("") }}
          >
            {isRegister ? "Login di sini" : "Daftar di sini"}
          </span>
        </p>
      </div>
    </div>
  )
}

const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(135deg, #1F4E79 0%, #2E75B6 50%, #1a365d 100%)",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  card: {
    backgroundColor: "white",
    padding: "2.5rem",
    borderRadius: "20px",
    width: "100%",
    maxWidth: "420px",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)",
    animation: "fadeInUp 0.5s ease",
  },
  logoContainer: {
    textAlign: "center",
    marginBottom: "0.25rem",
  },
  logo: {
    fontSize: "3rem",
    display: "inline-block",
    animation: "fadeIn 0.8s ease",
  },
  title: {
    textAlign: "center",
    margin: "0 0 0.25rem 0",
    color: "#1F4E79",
    fontSize: "1.8rem",
    fontWeight: 700,
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    margin: "0 0 1.5rem 0",
    fontSize: "0.85rem",
  },
  tabs: {
    display: "flex",
    marginBottom: "1.5rem",
    borderRadius: "10px",
    overflow: "hidden",
    border: "2px solid #e0e0e0",
  },
  tab: {
    flex: 1,
    padding: "0.7rem",
    border: "none",
    backgroundColor: "#f0f0f0",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: "bold",
    color: "#888",
    transition: "all 0.25s ease",
  },
  tabActive: {
    backgroundColor: "#1F4E79",
    color: "white",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "0.3rem",
  },
  label: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "#555",
  },
  input: {
    padding: "0.75rem 1rem",
    border: "2px solid #e0e0e0",
    borderRadius: "10px",
    fontSize: "1rem",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  btnSubmit: {
    padding: "0.85rem",
    background: "linear-gradient(135deg, #548235 0%, #6aa03f 100%)",
    color: "white",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "bold",
    marginTop: "0.5rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    transition: "all 0.25s ease",
    boxShadow: "0 4px 12px rgba(84, 130, 53, 0.3)",
  },
  btnDisabled: {
    opacity: 0.7,
    cursor: "not-allowed",
  },
  error: {
    backgroundColor: "#FFEBEE",
    color: "#C62828",
    padding: "0.6rem 1rem",
    borderRadius: "8px",
    marginBottom: "0.5rem",
    fontSize: "0.9rem",
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    border: "1px solid #FFCDD2",
    animation: "fadeInUp 0.2s ease",
  },
  footer: {
    textAlign: "center",
    marginTop: "1.25rem",
    fontSize: "0.85rem",
    color: "#888",
  },
  link: {
    color: "#1F4E79",
    fontWeight: "bold",
    cursor: "pointer",
    textDecoration: "underline",
  },
}

export default LoginPage