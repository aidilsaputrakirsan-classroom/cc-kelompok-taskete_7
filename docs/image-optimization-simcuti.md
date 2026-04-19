# Ukuran image Docker SIMCUTI — sebelum vs sesudah optimasi (modul 6)

Dokumen ini mendokumentasikan perbandingan ukuran image **backend** dan **frontend** proyek `cc-kelompok-taskete_7` untuk tugas **Lead CI/CD**: membandingkan kondisi **sebelum** dan **sesudah** optimasi Dockerfile (khususnya backend multi-stage + virtualenv).

## Ringkasan optimasi backend

| Aspek | Sebelum optimasi | Sesudah optimasi |
|--------|------------------|------------------|
| Struktur Dockerfile | **Satu stage**: `pip install` ke environment global Python, `libpq-dev` ikut terpasang di image yang dipakai saat runtime | **Dua stage**: Stage *builder* membuat `/opt/venv` dan menginstal dependensi di dalam venv; stage akhir hanya menyalin venv + kode, runtime cukup `libpq5` (bukan `libpq-dev`) |
| Tujuan | Cepat dipahami, satu file | Memisahkan artefak build dari image produksi, mengurangi beban layer runtime |
| Nama image lokal (Compose) | `cc-kelompok-taskete_7-backend:latest` | `cc-kelompok-taskete_7-backend:latest` (sama; isi layer berbeda) |

## Perbandingan ukuran (referensi)

Angka di bawah diperoleh dari perintah `docker images` pada lingkungan pengembangan (Docker Desktop Windows). **Ukuran bisa sedikit berbeda** antar mesin dan versi Docker.

| Image | Sebelum optimasi | Sesudah optimasi | Catatan |
|--------|------------------|------------------|---------|
| **Backend** `cc-kelompok-taskete_7-backend` | **~365 MB** (perkiraan satu-stage: `libpq-dev` + dependensi build tetap ada di image akhir) | **346 MB** | Diukur setelah multi-stage + venv; tanpa menyalin toolchain build ke stage final |
| **Frontend** `cc-kelompok-taskete_7-frontend` | **~75 MB** | **74.5 MB** | Sudah multi-stage (Node build → Nginx); perubahan utama modul 6 ada di backend |

**Kesimpulan singkat:** optimasi **multi-stage + venv** pada backend mengarah pada image runtime yang **tidak lagi membawa header pengembangan PostgreSQL** (`libpq-dev`) di layer akhir, sehingga ukuran lebih terkendali dibanding pola satu-stage dengan paket dev yang sama.

## Cara mengukur ulang (bisa dilampirkan ke laporan)

Dari **akar repositori** (`cc-kelompok-taskete_7`):

```bash
docker compose build backend frontend
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | grep cc-kelompok-taskete_7
```

Untuk detail layer:

```bash
docker history cc-kelompok-taskete_7-backend:latest --no-trunc
```

## Push ke Docker Hub (sesuai modul: backend `:v2`, frontend `:v1`)

Setelah `docker login`, dari root repo:

```bash
make push-hub DOCKERHUB_USER=<username_docker_hub>
```

Ini akan menandai dan mendorong:

- `<username_docker_hub>/simcuti-backend:v2`
- `<username_docker_hub>/simcuti-frontend:v1`

Lihat juga `Makefile` (target `push-hub`) dan `scripts/docker.sh` (perintah `push-hub`).

## Lampiran terkait

- Perbandingan base image Python (`python:3.12` vs `slim` vs `alpine`): [`image-comparison.md`](image-comparison.md)
- Arsitektur container: [`docker-architecture.md`](docker-architecture.md)
