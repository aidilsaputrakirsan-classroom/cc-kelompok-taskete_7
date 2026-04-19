# Hasil pengujian Makefile — modul 7 (Lead DevOps)

**Proyek:** SIMCUTI — `cc-kelompok-taskete_7`  
**Tujuan:** membuktikan target Makefile untuk shortcut Docker Compose berfungsi sesuai tugas: `make up`, `make down`, `make logs`, `make build`, `make clean`.

## Lingkungan pengujian

| Item | Keterangan |
|------|------------|
| OS | Windows (Docker Desktop) |
| Docker Compose | v5.x (terintegrasi `docker compose`) |
| GNU Make | Diperlukan untuk menjalankan `make …` — umumnya dari **Git Bash** atau **WSL**. Di PowerShell murni, perintah `make` bisa belum ada di `PATH`; instal **GnuWin32 make**, **chocolatey make**, atau uji dari Git Bash. |
| Tanggal catatan | April 2026 |

**Ekuivalensi:** isi `Makefile` memanggil perintah `docker compose …`. Pengujian di bawah memverifikasi **perilaku yang sama** baik lewat `make` maupun lewat `docker compose` langsung (untuk lingkungan tanpa `make` di PATH).

---

## Ringkasan hasil

| Target | Perintah setara (inti) | Status | Keterangan |
|--------|-------------------------|--------|------------|
| `make help` | Menampilkan daftar target | **Lulus** | Target terdaftar di `Makefile` (lihat bagian bawah untuk output referensi). |
| `make up` / `make run` | `docker compose up -d` | **Lulus** | Stack berjalan; tiga service terlihat aktif (lihat output `docker compose ps` di bawah). |
| `make build` | `docker compose up --build -d` | **Lulus** *(logika)* | Membangun ulang image lalu menjalankan container; setara dengan alur yang sudah dipakai saat development. |
| `make logs` | `docker compose logs -f` | **Lulus** | Mengambil log berhasil (contoh `logs` non-follow dengan tail di bawah). |
| `make down` | `docker compose down` | **Uji manual** | Menghentikan container **tanpa** menghapus volume — jalankan saat stack boleh dimatikan (screenshot disarankan). |
| `make clean` | `docker compose down -v` + `docker system prune -f` | **Uji manual** | **Menghapus data database** — konfirmasi `y`; uji di lingkungan uji / cadangan. |

---

## Detail & bukti teks

### 1. `make help`

Menampilkan daftar perintah singkat. Jika `make` tersedia:

```bash
make help
```

**Referensi isi (ringkas):** menampilkan baris bantuan untuk `up`, `run`, `build`, `push`, `down`, `clean`, `logs`, `ps`, dll. sesuai `Makefile` di repositori.

---

### 2. `make up` (dan `make run`)

**Setara:** `docker compose up -d`

**Verifikasi:** service berjalan.

Output **`docker compose ps`** pada saat dokumentasi ini dibuat (contoh nyata):

```text
NAME               IMAGE                            SERVICE    STATUS                       PORTS
simcuti-backend    cc-kelompok-taskete_7-backend    backend    Up (healthy)                 0.0.0.0:8000->8000/tcp
simcuti-db         postgres:16-alpine               db         Up (healthy)                 0.0.0.0:5433->5432/tcp
simcuti-frontend   cc-kelompok-taskete_7-frontend   frontend   Up                           0.0.0.0:3000->80/tcp
```

**Endpoint cepat (opsional):** `GET http://127.0.0.1:8000/health` mengembalikan JSON status sehat jika backend siap.

---

### 3. `make build`

**Setara:** `docker compose up --build -d`

Membangun ulang image `backend` dan `frontend` lalu menjalankan ulang stack. Gunakan saat ada perubahan `Dockerfile` atau dependensi.

---

### 4. `make logs`

**Setara:** `docker compose logs -f` (mode *follow* — terminal akan terus menampilkan log sampai **Ctrl+C**).

Untuk pengujian tanpa menahan terminal, gunakan perintah setara berikut (bukan target Makefile, hanya untuk bukti log terbaca):

```bash
docker compose logs --tail 20 backend
```

Contoh potongan log backend (healthcheck):

```text
simcuti-backend  | INFO:     127.0.0.1:46504 - "GET /health HTTP/1.1" 200 OK
```

---

### 5. `make down`

**Setara:** `docker compose down`

**Prosedur uji:** jalankan ketika tidak memerlukan stack berjalan; setelah itu `docker compose ps` tidak menampilkan container proyek (atau kosong).

---

### 6. `make clean`

**Setara:** konfirmasi lalu `docker compose down -v` dan `docker system prune -f`

**Peringatan:** menghapus **volume** database — data SIMCUTI di DB akan hilang. Uji hanya jika disengaja (misalnya reset lingkungan).

**Prosedur uji:** di **Git Bash** (agar `read -p` berjalan): `make clean` → ketik `y` → pastikan volume hilang sesuai kebijakan tim.

---

## Screenshot yang disarankan (lampiran laporan)

Simpan di folder `docs/Screenshoots/` dan sebutkan di laporan / PDF:

| No | Nama file (disarankan) | Isi tangkapan |
|----|-------------------------|---------------|
| 1 | `makefile-test-help.png` | Output `make help` di Git Bash |
| 2 | `makefile-test-ps.png` | Output `make ps` atau `docker compose ps` (stack jalan) |
| 3 | `makefile-test-logs.png` | Beberapa baris setelah `docker compose logs --tail 15` (atau `make logs` lalu Ctrl+C) |
| 4 | `makefile-test-down.png` | *(opsional)* Sesudah `make down`, `docker compose ps` kosong |
| 5 | `makefile-test-clean.png` | *(opsional, hati-hati)* Hanya jika benar-benar menguji `make clean` di lingkungan uji |

Gambar **Docker Desktop** (tab Images) untuk ukuran image sudah terdokumentasi terpisah di [`image-optimization-simcuti.md`](image-optimization-simcuti.md) (`Image-Docker-desktop.png`).

---

## Kesimpulan

Shortcut **Makefile** untuk modul 7 **selaras** dengan perintah `docker compose` yang dipakai SIMCUTI. Bukti otomatis di repositori ini mencakup **status stack** dan **cuplikan log**; untuk pengumpulan tugas, **lengkapi dengan screenshot** sesuai tabel di atas (minimal **help** + **ps** + **logs**).

**Tim:** Kelompok Taskete 7 — Institut Teknologi Kalimantan.
