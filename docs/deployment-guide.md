# Deployment Guide

Dokumen ini menjelaskan deploy production tim **cc-kelompok-taskete_7** menggunakan **DeployCC** (bukan Railway).

| Item | Nilai |
|------|--------|
| Production URL | https://cc-kelompok-taskete7.akhzafachrozy.my.id |
| API base | `/api` (health: `/api/health`, docs: `/api/docs`) |
| CD workflow | `.github/workflows/cd.yml` (DeployCC + health check) |
| DeployCC docs | https://github.com/akhzaozy/deploycc |

---

## Alur deploy otomatis (CD)

1. Merge PR ke `main` → CI (`ci.yml`) jalan.
2. CI sukses → CD (`cd.yml`) terpicu (`workflow_run`).
3. CD mengirim ZIP ke DeployCC, lalu **health check** memanggil `GET /api/health`.
4. Health check harus HTTP **200** dan JSON `"status": "healthy"`. Jika gagal, job CD **gagal** (alert di GitHub Actions summary).

Health check di pipeline (retry ~3 menit):

```yaml
# Ringkasan — lihat .github/workflows/cd.yml
HEALTH_URL="${DOMAIN}/api/health"
# curl + verifikasi status == "healthy", else exit 1
```

---

## Environment variables (server)

Edit di server: `editenv` (file `backend/.env`).

| Variable | Production |
|----------|------------|
| `DATABASE_URL` | Dari DeployCC / Postgres (`${{Postgres.DATABASE_URL}}` atau manual) |
| `SECRET_KEY` | Random hex (jangan commit) |
| `ENVIRONMENT` | `production` |
| `ROOT_PATH` | `/api` |
| `ALLOWED_ORIGINS` | URL frontend production |

Frontend build: `frontend/.env.production` → `VITE_API_URL=https://cc-kelompok-taskete7.akhzafachrozy.my.id/api`

### GitHub Secrets

| Secret | Keterangan |
|--------|------------|
| `DEPLOY_API_KEY` | Opsional; default classroom key dipakai jika kosong |

---

## SSH & perintah server

Dari root repo (Windows): `ssh.bat` — kredensial ada di **CD job summary** (GitHub Actions).

Path deploy: `/www/wwwroot/cc/cc-kelompok-taskete7`

| Perintah | Fungsi |
|----------|--------|
| `svc-status` | Status systemd backend |
| `svc-restart` | Restart Uvicorn |
| `svc-logs` | Log systemd |
| `svc-applog` | Log aplikasi |
| `editenv` | Edit `backend/.env` |

---

## Rollback manual setelah deploy gagal

Gunakan langkah berikut jika **CD gagal di health check**, production error setelah merge, atau perlu kembali ke versi stabil.

### Opsi A — Revert commit di GitHub (disarankan)

Cocok jika bug ada di commit terbaru di `main`.

1. Identifikasi commit stabil terakhir: `git log --oneline -10` di `main`.
2. Revert commit bermasalah (buat commit baru, jangan rewrite history publik):
   ```bash
   git checkout main
   git pull origin main
   git revert <SHA-commit-bermasalah> --no-edit
   git push origin main
   ```
3. CI lalu CD akan deploy ulang versi sebelumnya secara otomatis.
4. Pantau Actions → pastikan step **Health check production API** hijau.
5. Verifikasi manual: `https://cc-kelompok-taskete7.akhzafachrozy.my.id/api/health`

### Opsi B — Re-run workflow commit lama (tanpa revert)

Jika `main` sudah benar di lokal tetapi deploy server rusak:

1. GitHub → **Actions** → workflow **CD — Deploy ke DeployCCC**.
2. **Run workflow** → pilih branch `main`, commit SHA yang ingin di-deploy (atau merge ulang).
3. Tunggu health check lulus.

### Opsi C — Perbaiki di server tanpa ubah Git (hotfix darurat)

Jika deploy ZIP sudah ter-upload tetapi service crash (mis. permission, env):

1. SSH ke server (`ssh.bat` / perintah di CD summary).
2. Cek: `svc-status`, `svc-logs`, `svc-applog`.
3. Perbaikan umum:
   ```bash
   chmod +x venv/bin/uvicorn
   # Jangan jalankan fixperm setelah chmod — bisa reset permission
   svc-restart
   ```
4. Cek env: `editenv` → `ROOT_PATH=/api`, `DATABASE_URL` terisi.
5. Tes: `curl -sS https://cc-kelompok-taskete7.akhzafachrozy.my.id/api/health`

Jika kode di server harus diselaraskan dengan repo, **Opsi A atau B** lebih aman daripada edit manual file di server.

### Opsi D — Rollback database (hati-hati)

Hanya jika migrasi/schema baru merusak data. Backup dulu (koordinasi tim). Untuk kelas, biasanya cukup perbaiki env + redeploy tanpa drop DB.

### Setelah rollback

- [ ] CD workflow hijau (termasuk health check)
- [ ] `/api/health` → `healthy`, `database: connected`
- [ ] Login & fitur utama di browser
- [ ] Catat di PR/issue: penyebab + commit yang di-revert

---

## Troubleshooting

| Masalah | Penyebab | Solusi |
|--------|----------|--------|
| **CD gagal: Health check** | Backend belum ready / crash / DB putus | SSH `svc-status`, `svc-logs`; lihat [Rollback](#rollback-manual-setelah-deploy-gagal) |
| **502 Bad Gateway** | Backend mati | `svc-restart`; cek log |
| **`203/EXEC`** | `venv/bin/uvicorn` tidak executable | `chmod +x venv/bin/uvicorn` → `svc-restart` |
| **`No such file or directory` uvicorn** | `venv` hilang | Buat ulang venv + `pip install -r backend/requirements.txt` |
| **Health: database does not exist** | DB belum dibuat | `ssh dbtool@localhost` → `CREATE DATABASE ...` |
| **Swagger invalid version** | OpenAPI salah path | `ROOT_PATH=/api`; tes `/api/openapi.json` |
| **Login gagal, health OK** | CORS / `VITE_API_URL` salah | Cek `ALLOWED_ORIGINS` dan `.env.production` |

### Urutan debug singkat

1. `https://.../api/health` — backend + DB OK?
2. `svc-status` — `active (running)`?
3. `svc-logs` / `svc-applog` — traceback?
4. `editenv` — env benar?
5. `chmod +x venv/bin/uvicorn` → `svc-restart`

### Kontak

DeployCC gagal berulang: hubungi **asdos** ([deploycc README](https://github.com/akhzaozy/deploycc)).

---

## Checklist setelah deploy

- [ ] CI hijau di `main`
- [ ] CD DeployCC hijau (**health check** lulus)
- [ ] `/api/health` → `healthy`, database `connected`
- [ ] Login & fitur utama di URL production
- [ ] `/api/docs` tampil
- [ ] README tim memuat link production DeployCC

---

## Referensi: Railway (tidak dipakai)

Tim memakai DeployCC. Jika perlu dokumentasi Railway lama, lihat commit history file ini.
