# Uts Demoscript - Taskete_7 

👥 Identitas Tim

Nama Tim: Taskete_7

Nama Aplikasi: SIMCUTI - Sistem Manajemen Cuti Karyawan

Anggota:

| Nama | NIM | Peran |
|------|-----|-------|
| Noviansyah  | 10231072 | Lead Backend |
| Irwan Maulana  | 10231046 | Lead Frontend |
| Rayhan Iqbal  | 10231080 | Lead DevOps |
| Amalia Tiara Rezfani  | 10231012 | Lead QA & Docs |

## 1. 🖥️ Live Demo (±10 Menit)

⏱️ Menit 0–1 — Menjalankan Aplikasi (DevOps)
    - 

 “Pada awal demo, kami menjalankan seluruh sistem menggunakan Docker Compose.”

- Membuka terminal di root project
    - dan menjalankan
  
        ```
        docker compose up -d
        docker compose ps
        ```

    Pastikan :
   -  Ada 3 container utama: database, backend, dan frontend
   - Ketiganya sudah running
   - Database memiliki ```healthy```
  
    ⏱️ Menit 1–3 — Login dan Register (Frontend)
    - 

    “Selanjutnya kami memperlihatkan fitur autentikasi pengguna.”

    - Buka
        ```
         http://localhost:3000
        ```
    
    - Langkah : 
      - Register Akun baru 
      - Tunjukkan validasi 
      - form (jika ada)
      - Login menggunakan akun tersebut
  
    - Tunjukkan
      - User berhasil login
      - Masuk ke halaman Dashboard SIMCUTI
  
  
    ⏱️ Menit 3–6 — Demo CRUD Procurement (Frontend + Backend)
     - 
    “Selanjutnya kami mendemonstrasikan fitur utama pada SIMCUTI, yaitu pengelolaan pengajuan cuti.”

    - CREATE 2-3 data pengajuan cuti ( Misalnya tanggal mulai, tanggal selesai, dan alasan cuti)
    - Tampilkan seluruh daftar cuti yang sudah diajukan
    - Lalu tunjukkan status pengajuan:
        - Ada data dengan status Menunggu, Ada data yang sudah Disetujui, Ada data yang Ditolak
    - “Status pengajuan akan berubah setelah diproses oleh atasan atau admin. Jadi karyawan dapat melihat apakah cutinya masih menunggu, sudah diterima, atau ditolak.”
  
     - Tunjukkan : 
       - Perubahan data langsung tersimpan di database
    - Frontend terhubung dengan backend API
  
    ⏱️ Menit 6–7 — Demo API Backend (Backend)
    -

    “Backend aplikasi kami menggunakan REST API.”

    ```
    http://localhost:8000/docs
    ```

    Tunjukkan 
    - Dokumentasi API (Swagger UI)
    - Endpoint autentikasi dan procurement
   - Endpoint /health untuk pengecekan sistem

    Jelaskan singkat:

   - Backend menggunakan FastAPI
   - Dokumentasi API dibuat otomatis

    ⏱️ Menit 7–8 — Uji Penyimpanan Data (DevOps)
    - 

    “Kami juga menguji apakah data tetap tersimpan saat container dimatikan.”
    
    ```
    docker compose down
    docker compose up -d
    ```

    Kemudian :

    Login kembali
    Perlihatkan bahwa data procurement sebelumnya masih ada

    Jelaskan 
    - Data tersimpan karena menggunakan Docker Volume

    ⏱️ Menit 8–10 — Penjelasan Docker (DevOps)
    - 

    “Terakhir, kami menjelaskan konfigurasi Docker yang digunakan.”

    Buka :

    ```
    docker-compose.yml  
    ```

    Jelaskan: 
    -  Ada 3 service: db, backend, frontend
   - ```depends_on ```dipakai agar backend menunggu database
   - ```healthcheck ``` memastikan service siap digunakan
   - Volume dipakai untuk penyimpanan database

  

## 2.  💻 Code Walkthrough (±5 Menit)

⏱️ Menit 0–2 — Konfigurasi Docker Compose (DevOps)
- 
  
Tunjukkan 
```
docker-compose.yml  
```

Jelaskan:

- Susunan service
- Network antar container
- Volume database

⏱️ Menit 2–3 — Backend (Backend)
- 

Buka : 
```
backend/Dockerfile 
```

Jelaskan :
- Base image yang digunakan (Python)
- Instalasi dependencies
- Proses build image

Tambahkan:

- Authentication menggunakan JWT


⏱️ Menit 3–4 — Frontend (Frontend)
- 

Buka:

```
frontend/Dockerfile 
```

Jelaskan:

- Menggunakan multi-stage build
- React dibuild terlebih dahulu
- Hasil build dijalankan menggunakan Nginx

⏱️ Menit 4–5 — Dokumentasi (Dokumentasi)
- 

Tunjukkan:

```
README.md
```


Jelaskan:

- Cara menjalankan project
- Struktur folder
- Fungsi utama sistem SIMCUTI

## 3. 🎤 Individual Viva

Setiap anggota menjelaskan:

- Bagian yang dikerjakan
- Alasan menggunakan teknologi tertentu
- Konsep yang dipakai misalnya:

  - Docker & Docker Compose
  - REST API
  - JWT Authentication
  - CRUD
  - Docker Volume dan Healthcheck