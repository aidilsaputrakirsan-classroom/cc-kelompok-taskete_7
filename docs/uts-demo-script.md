# Skrip demo UTS — SIMCUTI (tutorial singkat)

Dokumen ini untuk **Lead QA & Docs** / tim: urutan demo ke dosen + **tutorial singkat** menjalankan stack lewat Docker. Sesuaikan langkah UI dengan tampilan aplikasi terbaru.

**Anggota tim:** cc-kelompok-taskete_7 — ITK.

---

## Tutorial singkat — jalankan dengan Docker

**Prasyarat:** Docker Desktop menyala, terminal di folder root repo.

```bash
cd cc-kelompok-taskete_7
docker compose up -d --build
```

Tunggu sampai service stabil (±1 menit). Cek:

```bash
docker compose ps
```

| Layanan | URL / port |
|---------|------------|
| Frontend | http://localhost:3000 |
| API / Swagger | http://localhost:8000/docs |
| Health | http://localhost:8000/health |
| PostgreSQL (host) | `localhost:5433` |

**Matikan stack (data DB tetap di volume):**

```bash
docker compose down
```

**Restart tanpa rebuild:**

```bash
docker compose restart
```

**Shortcut (jika `make` tersedia, mis. Git Bash):** `make up`, `make down`, `make build`, `make ps` — lihat [`makefile-testing-results.md`](makefile-testing-results.md).

---

## Skrip demo ke dosen (~12–15 menit)

### 1. Persiapan (1 menit)

- Buka terminal di root project.
- Pastikan stack jalan: `docker compose ps` → tiga service **Up** (backend & db idealnya **healthy**).
- Siapkan tab browser: **Frontend** (3000) dan **Swagger** (8000/docs).

### 2. Bukti Docker (2 menit)

- Tunjukkan `docker compose ps`.
- Buka `http://localhost:8000/health` → JSON `healthy` / aplikasi SIMCUTI.
- (Opsional) Tunjukkan Docker Desktop → **Images** → ukuran image backend/frontend lokal.

### 3. API (2–3 menit)

- Buka **Swagger** `http://localhost:8000/docs`.
- Tunjukkan endpoint utama (sesuai implementasi): health, auth, data cuti/karyawan, dll.
- Jalankan satu request **publik** + satu yang butuh token (jika ada).

### 4. Frontend (4–5 menit)

- Buka `http://localhost:3000`.
- Alur singkat: **login** (atau register jika memang dipakai) → halaman utama fitur cuti.
- Tunjukkan **satu alur utama**: mis. lihat daftar / ajukan cuti / ubah status — **sesuaikan dengan menu aktual**.
- Tunjukkan pesan sukses/error (toast) jika ada.

### 5. Data & ketahanan (2 menit)

- `docker compose restart` → refresh browser → data masih konsisten (karena volume DB).
- Jangan demo `docker compose down -v` kecuali dosen minta reset (data hilang).

### 6. Penutup (1 menit)

- Tunjukkan `README.md` / `docs/docker-architecture.md` / `docker-compose.yml` di editor (arsitektur singkat).
- Siap jawab: peran masing-masing anggota, JWT/CORS, Dockerfile multi-stage, isi `docker-compose.yml`.

---

## Checklist sebelum masuk ruang UTS

- [ ] `docker compose up -d` sukses tanpa error.
- [ ] Frontend dan Swagger bisa dibuka.
- [ ] Akun demo / data uji sudah siap (jika perlu login).
- [ ] Laptop ter-charge, koneksi stabil, font browser zoom nyaman untuk proyektor.

---

## Lampiran terkait

- [Hasil pengujian Makefile](makefile-testing-results.md)
- [Ukuran & dokumentasi image](image-optimization-simcuti.md)
- [Arsitektur Docker](docker-architecture.md)
