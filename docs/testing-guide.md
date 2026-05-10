# 🧪 Testing Guide

Dokumentasi ini digunakan sebagai panduan untuk menjalankan testing backend dan frontend, membaca hasil CI/CD, serta melakukan debugging jika terjadi error pada project.



## 1. Cara Run Test Lokal Backend

Bagian ini digunakan untuk menjalankan seluruh testing backend secara lokal menggunakan `pytest`. Testing backend bertujuan untuk memastikan endpoint API, authentication, dan fitur CRUD berjalan dengan baik sebelum code di-push ke GitHub.

#### Langkah-langkah menjalankan test backend:

Masuk ke folder backend:

```bash
cd backend
```
Install dependency jika belum pernah dilakukan:
```bash
pip install -r requirements.txt
```
Jalankan test:
```bash
pytest
```
Jika ingin melihat hasil test lebih detail:
```bash
pytest -v
```
Jika command pytest belum terbaca, install dulu:
```bash
pip install pytest
```
Lalu jalankan lagi:
```bash
pytest
```

---

## 2. Cara Run Test Lokal Frontend

Bagian ini digunakan untuk menjalankan testing frontend. Testing frontend bertujuan memastikan komponen React dan fitur frontend berjalan dengan baik.

#### Langkah-langkah menjalankan test frontend:

Masuk ke folder frontend:

```bash
cd frontend
```
Install dependency jika belum pernah dilakukan:
```bash
npm install
```
Jalankan test frontend:
```bash
npm test
```
Jika perintah npm test tidak tersedia, cek bagian scripts pada file:
```bash
frontend/package.json
```
Perintah test frontend dapat menyesuaikan konfigurasi project, misalnya:
```bash
npm run test
```
atau:
```bash
npm run test -- --run
```

---

## 3. Cara Membaca CI Log di GitHub Actions

Bagian ini digunakan untuk melihat hasil CI/CD setelah melakukan push atau Pull Request ke GitHub repository.

**Langkah membaca log CI:**
### Langkah Membaca CI Log

1. Buka repository GitHub.
2. Masuk ke tab **Actions**.
3. Pilih workflow yang sedang berjalan atau gagal.
4. Klik job yang ingin diperiksa:
   - Test Backend
   - Test Frontend
   - Build Docker
5. Buka step yang berwarna merah jika terjadi error.
6. Baca pesan error pada log.



## 4. Cara Debug Test Failure

Bagian ini digunakan untuk membantu menemukan penyebab error ketika testing gagal.

### Langkah Debug Test

1. Baca pesan error pada terminal atau GitHub Actions.
2. Cari nama file test yang gagal.
3. Periksa assertion yang bermasalah.
4. Bandingkan hasil aktual dengan hasil yang diharapkan.
5. Periksa endpoint backend yang digunakan.
6. Pastikan dependency sudah terinstall.
7. Jalankan ulang test secara lokal.
8. Commit dan push ulang setelah error diperbaiki.

### Contoh Test Gagal

```python
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 999
```

Kode tersebut gagal karena endpoint `/health` seharusnya mengembalikan status code `200`.

### Perbaikan

```python
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
```

Jalankan ulang test:

```bash
pytest
```

---

## 5. Cara Menambahkan Test Baru

Penambahan test dilakukan untuk memastikan fitur baru atau perubahan kode tetap berjalan dengan baik dan tidak menimbulkan error pada aplikasi.

### Menambahkan Test Backend

File test backend disimpan di folder:

```bash
backend/tests/
```

Contohnama file test:

```bash
backend/tests/test_health.py
```

Contoh sederhana penulisan test backend:

```bash
def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == 200
```

### Hal yang Perlu Diperhatikan Saat Membuat Test

1. Nama file test sebaiknya menggunakan awalan test_.untuk backend
2. Fungsi test harus memiliki nama yang jelas agar mudah dipahami. dan Nama fungsi test harus diawali dnegan test_.
3. Setelah menambah test baru, jalankan testing lokal terlebih dahulu sebelum melakukan push ke GitHub.

## 6. Menjalankan Semua Test
Sebelum membuat Pull Request, semua test perlu dijalankan untuk memastikan tidak ada error.

Backend:
```bash
cd backend
python -m pytest
```

Frontend:
```bash
cd frontend
npm test
```

Dengan Docker Compose:
```bash
docker compose up -d --build
docker compose exec backend pytest
```
Jika semua test berhasil, perubahan aman untuk di-push ke branch.

## 7. Validasi Hasil Test
Bagian ini digunakan untuk memastikan hasil testing sudah berhasil dan aman untuk di-push ke repository.

#### Contoh hasil berhasil 

dianggap berhasil jika muncul:
```bash
passed
```
atau:
```bash
All tests passed
```

- Jika seluruh test berhasil, maka perubahan aman untuk dibuat Pull Request dan di-merge ke branch utama.
- Jika terdapat test yang gagal, Pull Request sebaiknya tidak di-merge terlebih dahulu. Error harus diperbaiki sampai test berhasil. 

Validasi juga dilakukan melalui GitHub Actions. Jika status CI berwarna hijau atau bertuliskan passing, berarti workflow berhasil dijalankan.