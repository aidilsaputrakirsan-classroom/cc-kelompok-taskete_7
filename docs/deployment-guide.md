# Deployment Guide

## Railway Setup
1. Login ke Railway via GitHub
2. Buat project baru
3. Tambah PostgreSQL database service
4. Deploy backend (root: /backend)
5. Deploy frontend (root: /frontend)

## Environment Variables

### Backend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| DATABASE_URL | ${{Postgres.DATABASE_URL}} |
| SECRET_KEY | (random hex 64 chars) |
| CORS_ORIGINS | https://frontend-url.railway.app |
| ENVIRONMENT | production |

### Frontend (Railway)
| Variable | Contoh Value |
|----------|-------------|
| VITE_API_URL | https://backend-url.railway.app |

### GitHub Secrets
| Secret | Keterangan |
|--------|-----------|
| RAILWAY_TOKEN | Token dari railway.app/account/tokens |

## Troubleshooting

| Masalah | Penyebab | Solusi |
|--------|----------|--------|
| **502 Bad Gateway** / Cloudflare error | Backend mati / crash | `svc-status`; perbaiki lalu `svc-restart` |
| **`203/EXEC`** di `svc-status` | `venv/bin/uvicorn` tidak executable | `chmod +x venv/bin/uvicorn` → `svc-restart` (tanpa `fixperm` setelahnya) |
| **`No such file or directory` uvicorn** | `venv` hilang / belum `pip install` | Buat ulang venv + `pip install -r backend/requirements.txt` + `uvicorn[standard]` |
| **Health: database does not exist** | DB belum dibuat | `ssh dbtool@localhost` → `CREATE DATABASE cc_kelompok_taskete7_db;` |
| **Swagger: "invalid version field"** | Schema diambil dari `/openapi.json` (HTML frontend) | Set `ROOT_PATH=/api` di `backend/.env`; deploy `main.py` terbaru; tes `/api/openapi.json` |
| **Login gagal, health OK** | CORS / URL API frontend salah | Cek `ALLOWED_ORIGINS` dan `frontend/.env.production` → `VITE_API_URL` harus pakai `/api` |
| **CI gagal `NameError: fix`** | Sisa resolve conflict di `main.py` | Hapus teks sisa (`fix/update-main-config`, `main`, marker `<<<<<<<`) |
| **Permission denied** buat venv | Ownership folder | `fixperm` → `rm -rf venv` → `python3 -m venv venv` |
| Deploy ulang, service mati lagi | `fixperm` reset permission | `chmod +x venv/bin/uvicorn` setiap setelah deploy yang mengubah `venv` |

### Urutan debug singkat

1. `https://.../api/health` — backend + DB OK?
2. `svc-status` — `active (running)`?
3. `svc-logs` / `svc-applog` — ada traceback?
4. `editenv` — `ROOT_PATH=/api`, `ALLOWED_ORIGINS` benar?
5. `chmod +x venv/bin/uvicorn` → `svc-restart`

### Kontak

Jika deploy DeployCC gagal berulang: hubungi **asdos** (sesuai README [deploycc](https://github.com/akhzaozy/deploycc)).

---

## Checklist setelah deploy

- [ ] CI hijau di `main`
- [ ] CD DeployCC hijau
- [ ] `/api/health` → `healthy`, database `connected`
- [ ] Login & fitur utama di URL production
- [ ] `/api/docs` tampil (setelah `ROOT_PATH` + kode terbaru)
- [ ] README tim memuat link production DeployCC