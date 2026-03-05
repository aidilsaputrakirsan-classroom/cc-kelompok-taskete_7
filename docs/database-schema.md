# Database Schema — Taskete 7

---

## Database Info

| Item | Detail |
|------|--------|
| **Database** | PostgreSQL 17 |
| **Nama Database** | `cloudapp` |
| **ORM** | SQLAlchemy 2.0.35 |
| **Driver** | psycopg2-binary |

---

## Tabel: `items`

Tabel utama untuk menyimpan data inventory/item.

| No | Kolom | Tipe Data | Constraint | Default | Deskripsi |
|----|-------|-----------|------------|---------|-----------|
| 1 | `id` | `INTEGER` | PRIMARY KEY, AUTO INCREMENT, INDEX | - | ID unik item |
| 2 | `name` | `VARCHAR(100)` | NOT NULL, INDEX | - | Nama item (maks 100 karakter) |
| 3 | `description` | `TEXT` | NULLABLE | `NULL` | Deskripsi item (opsional) |
| 4 | `price` | `FLOAT` | NOT NULL | - | Harga item (harus > 0) |
| 5 | `quantity` | `INTEGER` | NOT NULL | `0` | Jumlah stok (tidak boleh negatif) |
| 6 | `created_at` | `TIMESTAMP WITH TIME ZONE` | - | `NOW()` | Waktu pembuatan (otomatis) |
| 7 | `updated_at` | `TIMESTAMP WITH TIME ZONE` | NULLABLE | `NULL` | Waktu update terakhir (otomatis saat update) |

---

## Entity Relationship Diagram (ERD)

```
┌──────────────────────────────────────────────┐
│                   items                       │
├──────────────────────────────────────────────┤
│ PK │ id          │ INTEGER        │ NOT NULL │
│    │ name        │ VARCHAR(100)   │ NOT NULL │
│    │ description │ TEXT           │ NULLABLE │
│    │ price       │ FLOAT          │ NOT NULL │
│    │ quantity    │ INTEGER        │ NOT NULL │
│    │ created_at  │ TIMESTAMPTZ    │ DEFAULT  │
│    │ updated_at  │ TIMESTAMPTZ    │ NULLABLE │
└──────────────────────────────────────────────┘
```

---

## SQL Equivalent (Referensi Saja)

> **Catatan:** SQL di bawah ini **TIDAK perlu dijalankan manual**. Tabel dibuat otomatis oleh SQLAlchemy saat server pertama kali dijalankan via `Base.metadata.create_all(bind=engine)` di `main.py`. SQL ini hanya sebagai referensi untuk memahami struktur tabel yang dibuat.

```sql
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price FLOAT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX ix_items_id ON items (id);
CREATE INDEX ix_items_name ON items (name);
```

---

## Validasi (Pydantic Schema)

Validasi dilakukan di level aplikasi melalui Pydantic:

| Field | Validasi |
|-------|----------|
| `name` | Wajib, 1-100 karakter |
| `price` | Wajib, harus > 0 |
| `quantity` | Default 0, tidak boleh negatif (>= 0) |
| `description` | Opsional |

---

## Catatan

- Tabel dibuat otomatis oleh SQLAlchemy saat server pertama kali dijalankan (`Base.metadata.create_all()`)
- `created_at` diisi otomatis oleh database (server-side default)
- `updated_at` diisi otomatis oleh SQLAlchemy saat ada operasi update
- Saat ini hanya ada 1 tabel (`items`). Tabel tambahan akan ditambahkan sesuai kebutuhan di modul berikutnya.
