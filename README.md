# ☁️ Cloud App - [Nama Proyek Tim Anda]

Deskripsi singkat aplikasi (1-2 paragraf): apa yang dilakukan, 
untuk siapa, masalah apa yang diselesaikan.

## 👥 Tim

| Nama | NIM | Peran |
|------|-----|-------|
| Noviansyah  | 10231072 | Lead Backend |
| Irwan Maulana  | 10231046 | Lead Frontend |
| Rayhan Iqbal  | 10231080 | Lead DevOps |
| Amalia Tiara Rezfani  | 10231012 | Lead QA & Docs |

## 🛠️ Tech Stack

| Teknologi | Fungsi |
|-----------|--------|
| FastAPI   | Backend REST API |
| React     | Frontend SPA |
| PostgreSQL | Database |
| Docker    | Containerization |
| GitHub Actions | CI/CD |
| Railway/Render | Cloud Deployment |

## 🏗️ Architecture

```
[React Frontend] <--HTTP--> [FastAPI Backend] <--SQL--> [PostgreSQL]
```

*(Diagram ini akan berkembang setiap minggu)*

## 🚀 Getting Started

### Prasyarat
- Python 3.10+
- Node.js 18+
- Git

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Buka http://localhost:8000 untuk verifikasi API berjalan.

Buka http://localhost:8000/docs untuk melihat dokumentasi Swagger.

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Buka http://localhost:5173 untuk melihat aplikasi.

## 📅 Roadmap

| Minggu | Target | Status |
|--------|--------|--------|
| 1 | Setup & Hello World | ✅ |
| 2 | REST API + Database | ⬜ |
| 3 | React Frontend | ⬜ |
| 4 | Full-Stack Integration | ⬜ |
| 5-7 | Docker & Compose | ⬜ |
| 8 | UTS Demo | ⬜ |
| 9-11 | CI/CD Pipeline | ⬜ |
| 12-14 | Microservices | ⬜ |
| 15-16 | Final & UAS | ⬜ |


## 📁 Project Structure

```
cc-kelompok-taskete_7/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── frontend/
│       ├── src/
│       ├── public/
│       ├── index.html
│       ├── package.json
│       └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── ...
├── docs/
│   ├── member-[iqbal].md
│   ├── member-[Irwan].md
│   ├── member-[opi].md
│   └── member-Amalia-Tiara-Rezfani.md
├── .gitignore
└── README.md
```

*Struktur ini akan berkembang sesuai milestone mingguan.*
