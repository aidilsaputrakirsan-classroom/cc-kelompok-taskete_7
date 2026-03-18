import ItemCard from "./ItemCard"
import Spinner, { SkeletonCard } from "./Spinner"

function ItemList({ items, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div>
        <div style={styles.loadingHeader}>
          <Spinner size={24} message="" />
          <span style={styles.loadingText}>Memuat data...</span>
        </div>
        <div style={styles.grid}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div style={styles.empty}>
        <p style={styles.emptyIcon}>📭</p>
        <p style={styles.emptyText}>Belum ada item.</p>
        <p style={styles.emptyHint}>
          Gunakan form di atas untuk menambahkan item pertama.
        </p>
      </div>
    )
  }

  return (
    <div style={styles.grid}>
      {items.map((item, index) => (
        <div
          key={item.id}
          style={{
            animation: `fadeInUp 0.3s ease ${index * 0.05}s both`,
          }}
        >
          <ItemCard
            item={item}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  )
}

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
    gap: "1rem",
  },
  loadingHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0.5rem",
    marginBottom: "1rem",
  },
  loadingText: {
    color: "#1F4E79",
    fontSize: "0.95rem",
    fontWeight: 600,
  },
  empty: {
    textAlign: "center",
    padding: "3rem",
    backgroundColor: "#f8f9fa",
    borderRadius: "12px",
    border: "2px dashed #ddd",
    animation: "fadeIn 0.3s ease",
  },
  emptyIcon: {
    fontSize: "3rem",
    margin: "0 0 0.5rem 0",
  },
  emptyText: {
    fontSize: "1.1rem",
    color: "#555",
    margin: "0 0 0.25rem 0",
  },
  emptyHint: {
    fontSize: "0.9rem",
    color: "#888",
    margin: 0,
  },
}

export default ItemList