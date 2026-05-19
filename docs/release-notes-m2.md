# Release Notes Milestone 2 — SIMCUTI

Dokumen ini berisi informasi rilis untuk Milestone 2 pada aplikasi SIMCUTI. Pada tahap ini, aplikasi telah memasuki proses implementasi CI/CD serta deployment ke environment production guna mendukung proses pengembangan dan distribusi aplikasi yang lebih terintegrasi.
``

## 1. Fitur yang Telah Diimplementasikan

Pada Milestone 2, aplikasi SIMCUTI telah berhasil mengimplementasikan beberapa fitur utama yang mendukung proses pengajuan dan pengelolaan cuti secara digital. Fitur-fitur yang tersedia mencakup : 

| No | Modul | Fitur | Keterangan |
|---|---|---|---|
| 1 | Autentikasi | Register | Membuat akun baru untuk pengguna |
| 2 | Autentikasi | Login | Masuk ke aplikasi menggunakan akun yang terdaftar |
| 3 | Autentikasi | Logout | Keluar dari aplikasi dan mengakhiri sesi pengguna |
| 4 | Dashboard | Dashboard Kuota Cuti | Menampilkan informasi sisa kuota cuti pengguna |
| 5 | Pengajuan Cuti | Ajukan Cuti | Mengajukan cuti dengan mengisi tanggal mulai, tanggal selesai, alasan cuti, dan nomor kontak darurat |
| 6 | Pengajuan Cuti | Edit Pengajuan Cuti | Mengubah data pengajuan cuti yang sudah dibuat |
| 7 | Pengajuan Cuti | Hapus Pengajuan Cuti | Menghapus data pengajuan cuti |
| 8 | Pengajuan Cuti | Histori Cuti | Menampilkan riwayat atau histori pengajuan cuti pengguna |
| 9 | Kalender Libur | Daftar Kalender Libur | Menampilkan daftar tanggal merah atau hari libur nasional dalam satu tahun |

## 2. Production URL

Aplikasi SIMCUTI telah berhasil di-deploy ke environment production sehingga dapat diakses secara online. Berikut merupakan URL frontend, backend API, dan dokumentasi API yang digunakan pada aplikasi.

| Service | URL |
|---------|-----|
| Frontend| https://cc-kelompok-taskete7.akhzafachrozy.my.id/|
| Backend API | https://cc-kelompok-taskete7.akhzafachrozy.my.id/api/health |
| API Docs (Swagger) |https://cc-kelompok-taskete7.akhzafachrozy.my.id/api/docs |

## 3. Tech Stack

| Komponen | Teknologi |
|---|---|
| Frontend | React + Vite |
| Backend | FastAPI |
| Database | PostgreSQL |
| Containerization | Docker & Docker Compose |
| CI/CD | GitHub Actions |
| Deployment | Deploy SI |
| Testing Backend | pytest |
| Testing Frontend | Vitest |

## 4. CI/CD Summary

Pada Milestone 2, implementasi pipeline CI/CD diterapkan untuk mendukung proses pengujian, build, dan deployment aplikasi secara otomatis. Penggunaan pipeline ini membantu memastikan aplikasi dapat berjalan dengan baik sebelum dirilis ke environment production.

Tahapan yang terdapat pada pipeline meliputi:

- Pengujian backend menggunakan pytest.
- Pengujian frontend menggunakan Vitest.
- Proses build Docker image.
- Deployment aplikasi ke Deploy SI.
- Validasi aplikasi production melalui smoke testing.

## 5. Known Issues

| No | Kendala | Dampak |
|---|---|---|
| 1 | Terjadi merge conflict saat melakukan `git push origin main` karena perubahan kode bertabrakan dengan commit anggota tim lain | Proses deployment menjadi tertunda dan memerlukan penyesuaian atau penyelesaian conflict secara manual |
| 2 | Session login belum persisten | Pengguna perlu login kembali setelah melakukan refresh halaman |
| 3 | Validasi form masih sederhana | Beberapa input pengguna masih berpotensi menerima data yang kurang sesuai |
| 4 | Tampilan mobile belum sepenuhnya responsif | Beberapa komponen antarmuka belum tampil optimal pada ukuran layar tertentu |

## 6. Production Testing Summary
Pengujian production dilakukan setelah proses deployment aplikasi selesai untuk memastikan seluruh fitur utama dapat berjalan dengan baik pada environment production. Pengujian dilakukan menggunakan metode smoke testing terhadap fitur-fitur inti aplikasi SIMCUTI.

Hasil pengujian menunjukkan bahwa proses autentikasi, pengajuan cuti, pengelolaan data cuti, histori cuti, serta akses kalender libur dapat berjalan sesuai dengan fungsinya. Selain itu, koneksi frontend dan backend pada environment production juga berhasil berjalan dengan baik.

Hasil pengujian production secara lengkap dapat dilihat pada file :  [Production Testing](production-test.md).