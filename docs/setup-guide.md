# Setup Guide — cc-kelompok-taskete_7 (SIMCUTI)

Panduan ini menjelaskan langkah dari **clone** sampai aplikasi bisa berjalan lokal (backend + frontend) untuk orang yang baru pertama kali membuka repo ini.

## Prasyarat

- **Git**
- **Python 3.10+** (disarankan 3.10/3.11)
- **Node.js 18+**
- **PostgreSQL** (lokal) + kredensial user `postgres` (atau user lain)

## 1) Clone repository

```bash
git clone <URL_REPO_KALIAN>
cd cc-kelompok-taskete_7
```

## 2) Setup database PostgreSQL

1. Pastikan service PostgreSQL menyala.
2. Buat database (sesuaikan nama DB jika berbeda):

```sql
CREATE DATABASE cloudapp;
```

## 3) Backend (FastAPI)

### 3.1 Buat & isi file environment

Masuk folder backend:

```bash
cd backend
```

Copy template env:

```bash
cp .env.example .env
```

Lalu edit `backend/.env` dan isi minimal:

- `DATABASE_URL`
- `SECRET_KEY`
- `ALLOWED_ORIGINS`

Contoh (sesuaikan password/db):

```env
DATABASE_URL=postgresql://postgres:YOURPASSWORD@localhost:5432/cloudapp
SECRET_KEY=your-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

> Catatan: file `.env` **tidak boleh di-commit**. Yang di-commit hanya `.env.example`.

### 3.2 Install dependencies

Jika kamu pakai virtualenv (disarankan):

```bash
python -m venv venv
./venv/Scripts/activate
pip install -r requirements.txt
```

> Jika kamu memakai conda, aktifkan environment conda kamu dulu baru `pip install -r requirements.txt`.

### 3.3 Jalankan backend

```bash
uvicorn main:app --reload --port 8000
```

Cek:
- API health: `http://localhost:8000/health`
- Swagger: `http://localhost:8000/docs`

## 4) Frontend (React + Vite)

Buka terminal baru dari root repo:

```bash
cd frontend
```

### 4.1 Buat & isi file environment

Copy template:

```bash
cp .env.example .env
```

Opsi konfigurasi umum:

- **Mode langsung ke backend**:

```env
VITE_API_URL=http://localhost:8000
```

- **Mode proxy Vite** (disarankan saat dev):

```env
VITE_API_URL=/api
VITE_API_PROXY_TARGET=http://localhost:8000
```

### 4.2 Install dependencies & jalankan

```bash
npm install
npm run dev
```

Buka: `http://localhost:5173`

## 5) Alur testing cepat (Auth + CRUD)

1. Buka frontend `http://localhost:5173`
2. Register user baru
3. Login
4. Coba CRUD items
5. Logout → harus kembali ke login page

## Troubleshooting

### Backend gagal start: `email-validator is not installed`

Jalankan ulang install dependencies:

```bash
pip install -r requirements.txt
```

### Backend gagal install `psycopg2-binary` di Windows (butuh C++ Build Tools)

Opsi paling cepat:
- Pakai Python 3.10/3.11 environment khusus project (lebih kompatibel).

Atau:
- Install **Microsoft C++ Build Tools** lalu ulangi `pip install -r requirements.txt`.

### Frontend tidak bisa akses API / CORS error

Pastikan:
- Backend pakai `ALLOWED_ORIGINS` yang berisi origin frontend (mis. `http://localhost:5173`)
- Jika pakai proxy Vite, set:
  - `VITE_API_URL=/api`
  - `VITE_API_PROXY_TARGET=http://localhost:8000`

