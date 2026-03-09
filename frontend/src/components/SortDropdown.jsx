function SortDropdown({ sortBy, onSortChange }) {
    return (
      <div style={styles.container}>
        <label style={styles.label}>⬆⬇ Urutkan berdasarkan:</label>
        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          style={styles.select}
        >
          <option value="newest">🕐 Terbaru</option>
          <option value="oldest">🕐 Terlama</option>
          <option value="name_asc">🔤 Nama (A-Z)</option>
          <option value="name_desc">🔤 Nama (Z-A)</option>
          <option value="price_asc">💰 Harga (Termurah)</option>
          <option value="price_desc">💰 Harga (Termahal)</option>
        </select>
      </div>
    )
  }
  
  const styles = {
    container: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
      marginBottom: "1rem",
      padding: "0.75rem 1rem",
      backgroundColor: "#fff",
      borderRadius: "8px",
      border: "1px solid #e0e0e0",
    },
    label: {
      fontSize: "0.9rem",
      fontWeight: "bold",
      color: "#555",
      whiteSpace: "nowrap",
    },
    select: {
      padding: "0.5rem 0.75rem",
      fontSize: "0.9rem",
      border: "2px solid #ddd",
      borderRadius: "6px",
      outline: "none",
      cursor: "pointer",
      backgroundColor: "#f8f9fa",
    },
  }
  
  export default SortDropdown