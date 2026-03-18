import { useState, useEffect, useCallback } from "react"
import Header from "./components/Header"
import SearchBar from "./components/SearchBar"
import ItemForm from "./components/ItemForm"
import ItemList from "./components/ItemList"
import LoginPage from "./components/LoginPage"
import { ToastContainer, useToast } from "./components/Toast"
import {
  fetchItems, createItem, updateItem, deleteItem,
  checkHealth, login, register, setToken, clearToken,
} from "./services/api"

function App() {
  // ==================== AUTH STATE ====================
  const [user, setUser] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // ==================== APP STATE ====================
  const [items, setItems] = useState([])
  const [totalItems, setTotalItems] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isConnected, setIsConnected] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")

  // ==================== TOAST NOTIFICATIONS ====================
  const { toasts, addToast, removeToast } = useToast()

  // ==================== LOAD DATA ====================
  const loadItems = useCallback(async (search = "") => {
    setLoading(true)
    try {
      const data = await fetchItems(search)
      setItems(data.items)
      setTotalItems(data.total)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
      } else {
        addToast("Gagal memuat data: " + err.message, "error")
      }
      console.error("Error loading items:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    checkHealth().then((healthy) => {
      setIsConnected(healthy)
      if (!healthy) {
        addToast("Backend tidak terhubung. Pastikan server berjalan.", "warning", 5000)
      }
    })
  }, [])

  useEffect(() => {
    if (isAuthenticated) {
      loadItems()
    }
  }, [isAuthenticated, loadItems])

  // ==================== AUTH HANDLERS ====================

  const handleLogin = async (email, password) => {
    const data = await login(email, password)
    setUser(data.user)
    setIsAuthenticated(true)
    addToast(`Selamat datang, ${data.user.name}! 👋`, "success")
  }

  const handleRegister = async (userData) => {
    // Register lalu otomatis login
    await register(userData)
    addToast("Registrasi berhasil! Sedang login...", "info", 2000)
    await handleLogin(userData.email, userData.password)
  }

  const handleLogout = () => {
    clearToken()
    setUser(null)
    setIsAuthenticated(false)
    setItems([])
    setTotalItems(0)
    setEditingItem(null)
    setSearchQuery("")
  }

  // ==================== ITEM HANDLERS ====================

  const handleSubmit = async (itemData, editId) => {
    try {
      if (editId) {
        await updateItem(editId, itemData)
        setEditingItem(null)
        addToast(`Item "${itemData.name}" berhasil diperbarui! ✏️`, "success")
      } else {
        await createItem(itemData)
        addToast(`Item "${itemData.name}" berhasil ditambahkan! 🎉`, "success")
      }
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
        addToast("Sesi berakhir. Silakan login kembali.", "warning")
      } else {
        addToast("Gagal menyimpan item: " + err.message, "error")
        throw err
      }
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    window.scrollTo({ top: 0, behavior: "smooth" })
    addToast(`Mengedit "${item.name}"`, "info", 2000)
  }

  const handleDelete = async (id) => {
    const item = items.find((i) => i.id === id)
    if (!window.confirm(`Yakin ingin menghapus "${item?.name}"?`)) return
    try {
      await deleteItem(id)
      addToast(`Item "${item?.name}" berhasil dihapus! 🗑️`, "success")
      loadItems(searchQuery)
    } catch (err) {
      if (err.message === "UNAUTHORIZED") {
        handleLogout()
        addToast("Sesi berakhir. Silakan login kembali.", "warning")
      } else {
        addToast("Gagal menghapus: " + err.message, "error")
      }
    }
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    loadItems(query)
  }

  // ==================== RENDER ====================

  // Jika belum login, tampilkan login page
  if (!isAuthenticated) {
    return (
      <>
        <ToastContainer toasts={toasts} onRemove={removeToast} />
        <LoginPage onLogin={handleLogin} onRegister={handleRegister} />
      </>
    )
  }

  // Jika sudah login, tampilkan main app
  return (
    <div style={styles.app}>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <div style={styles.container}>
        <Header
          totalItems={totalItems}
          isConnected={isConnected}
          user={user}
          onLogout={handleLogout}
        />
        <ItemForm
          onSubmit={handleSubmit}
          editingItem={editingItem}
          onCancelEdit={() => setEditingItem(null)}
        />
        <SearchBar onSearch={handleSearch} />
        <ItemList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </div>
    </div>
  )
}

const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f0f2f5",
    padding: "2rem",
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  container: { maxWidth: "900px", margin: "0 auto" },
}

export default App