# UAS Presentation Outline

## Slide 1: Title
- Nama proyek: simcuti
- Nama tim: Taskete_7
- Anggota: 
  * Noviansyah
  * Irwan Maulana
  * Rayhan Iqbal 
  * Amalia Tiara Rezfani

## Slide 2: Problem & Solution
- Masalah yang diselesaikan: Proses pengajuan dan pencatatan cuti masih dilakukan secara manual menggunakan formulir atau spreadsheet sehingga tidak efisien, rentan kesalahan, dan sulit dipantau secara real-time.

- Target pengguna: 
* Karyawan yang ingin mengajukan dan memantau sisa cuti serta 
* manajer atau tim HR yang bertugas mengelola dan menyetujui permohonan cuti.

- Solusi: Menyediakan platform manajemen SDM berbasis web dengan fitur pengajuan cuti online, pengecekan sisa cuti secara real-time, serta sistem persetujuan otomatis yang memanfaatkan infrastruktur cloud sehingga data selalu tersedia, akurat, dan dapat diakses dari mana saja.

## Slide 3: Architecture Journey
- Week 1-4: Monolith (1 backend, 1 DB)
- Week 5-7: Containerized (Docker Compose)
- Week 9-11: CI/CD (GitHub Actions + Railway)
- Week 12-14: Microservices (2 services + gateway)

## Slide 4: Tech Stack & Infrastructure
- Diagram arsitektur final
- Jumlah containers, services, endpoints
- CI/CD pipeline flow
- Monitoring & observability

## Slide 5: Live Demo
- Flow: Open app → register → login → create child/items → view items
  → update → delete → check /status page → show CI/CD badge
- Backup: recorded video jika internet bermasalah

## Slide 6: Challenges & Lessons Learned
- Challenge 1: Komunikasi antar service → Solution: HTTP REST dengan Circuit Breaker
- Challenge 2: Keamanan API → Solution: Nginx Rate Limiting dan Pydantic Validation
- Challenge 3: Sinkronisasi Environment → Solution: Audit credentials dan Docker volumes
- Biggest learning: Observability (Logs/Metrics) dan pentingnya DevOps praktis

## Slide 7: Team Contributions
- [Noviansyah] — Lead Backend — FastAPI, Database Integration, JWT Authentication, CRUD API
- [Irwan Maulana] — Lead Frontend — React UI, API Integration, User Interface
- [Rayhan Iqbal ] — Lead DevOps — Docker, Docker Compose, Railway Deployment, GitHub Actions
- [Amalia Tiara Rezfami] — Lead QA & Docs — Testing, Reliability Testing, README, Deployment Guide, Documentation
  
## Demo Script (Urutan Langkah)

1. Buka aplikasi SIMCUTI (https://cc-kelompok-taskete7.akhzafachrozy.my.id/)
2. Register user baru
3. Login menggunakan akun yang dibuat
4. Membuat task baru
5. Menampilkan daftar task
6. Mengubah task
7. Menandai task sebagai selesai
8. Menampilkan statistik task
9. Menghapus task
10. Membuka Swagger API Documentation (/docs)
11. Menampilkan GitHub Actions dengan status pipeline berhasil
12. Menampilkan README dan dokumentasi proyek