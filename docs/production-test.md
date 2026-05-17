# 📋Production Testing

File ini berisi hasil pengujian production (smoke testing) pada aplikasi yang telah di-deploy ke Railway. 

Pengujian dilakukan dengan membandingkan hasil aplikasi pada environment development (localhost) dan production (Railway) untuk memastikan aplikasi tetap stabil setelah deployment.

## 1. Smoke Test Checklist

Smoke test dilakukan untuk memastikan seluruh fitur utama aplikasi dapat berjalan dengan baik pada environment production setelah proses deployment ke Railway selesai dilakukan.

| Tahapan Pengujian | Langkah Pengujian | Hasil yang Diharapkan | Status |
|-------------------|------------------|----------------------|--------|
| Membuka Frontend Production | Membuka URL frontend Railway melalui browser | Halaman berhasil dimuat tanpa error atau blank page | ✅ |
| Register User | Mengisi form registrasi dengan data user baru | Akun berhasil dibuat dan tersimpan di database | ✅ |
| Login User | Login menggunakan akun yang telah didaftarkan | User berhasil masuk ke dalam aplikasi | ✅ |
| Create Item | Menambahkan item/data baru | Data berhasil ditambahkan ke database | ✅  |
| Read Item | Melihat daftar item pada aplikasi | Item yang ditambahkan muncul pada daftar | ✅  |
| Update Item | Mengedit item yang telah dibuat | Data item berhasil diperbarui | ✅  |
| Delete Item | Menghapus item dari daftar | Item berhasil dihapus dari sistem | ✅ |
| Health Check Backend | Mengakses endpoint `/health` backend | Status backend menunjukkan healthy dan database connected |✅|


## 2. Perbandingan Development dan Production

Perbandingan dilakukan untuk memastikan fitur-fitur yang berjalan pada environment development (localhost) juga dapat berjalan dengan baik pada environment production (Railway) tanpa mengalami kendala setelah deployment.

| Test | Development (localhost) | Production (Railway) | Status |
|------|------------------------|---------------------|--------|
| Backend `/health` | ✅ | ✅ | PASS |
| Register User | ✅| ✅ | PASS  |
| Login User | ✅   | ✅  | PASS |
| Create Item | ✅  | ✅  | PASS |
| Read Items | ✅   | ✅  | PASS |
| Update Item | ✅  | ✅  | PASS |
| Delete Item | ✅  | ✅  | PASS |
| Search Item | ✅  | ✅  | PASS |

Keterangan
✅ PASS : Fitur telah dites dan berhasil 

## 📄 Kesimpulan

Berdasarkan hasil smoke test checklist dan perbandingan antara environment development dan production, seluruh fitur utama aplikasi berhasil berjalan dengan baik pada Railway. Fitur register, login, create, read, update, delete, search, serta endpoint health check dapat digunakan tanpa kendala baik pada localhost maupun production. Hal ini menunjukkan bahwa proses deployment berhasil dilakukan dan aplikasi telah siap digunakan pada environment production.