# Operations Guide 

## 1. Tujuan Dokumen
Dokumen ini bertujuan sebagain panduan operasional untuk pengecekan kondisi sistem Microservices pada project panduan ini mencakup

- Melakukan cara pengecekan status kesehatan (health check) pada setiap service
- Membaca dan memahami informasi pada application logs
- Melakukan pelacakan alur request menggunakan correlation ID
- Melakukan pengecekan data metrics untuk memantau performa sistem
- Menangani permasalahan umum yang sering terjadi (common troubleshooting)
- Menentukan alur eskalasi apabila ditemukan gangguan pada sistem

## 2. Arsitektur Singkat Sistem 
| Service | Fungsi |
|---|---|
| `frontend` | Menampilkan antarmuka aplikasi |
| `gateway` | Menjadi pintu masuk utama dan meneruskan request ke service terkait |
| `auth-service` | Mengelola autentikasi seperti register, login, dan verify token |
| `item-service` | Mengelola data item/barang |
| `auth-db` | Database untuk `auth-service` |
| `item-db` | Database untuk `item-service` |

## 3. Menjalankan Sistem 

Sebelum melakukan proses monitoring dan pengujian, seluruh service pada aplikasi microservices harus dijalankan terlebih dahulu. Proses deployment lokal dilakukan menggunakan Docker Compose agar seluruh container seperti gateway, backend service, dan database dapat berjalan secara bersamaan.

Untuk menjalankan seluruh service, gunakan perintah berikut: 

```bash
docker compose up -d --build
```

Setelah seluruh service berhasil dijalankan, lakukan pengecekan status container untuk memastikan setiap service berada dalam kondisi aktif.

```bash
docker compose ps
```

Pastikan container utama memiliki status  `Up`. Untuk database, pastikan statusnya `healthy`.

## 4. Cara Cek Health
Health check digunakan untuk  memastikan setiap service pada sistem microservices berjalan dengan baik dan dapat menerima request. Endpoint health menyediakan informasi mengenai kondisi service secara sederhana sehingga dapat diketahui apakah service berada dalam kondisi normal atau mengalami gangguan.

### 4.1 Check Health melalui Gateway

Health check melalui gateway dilakukan untuk memastikan API Gateway dapat menerima request dan meneruskan permintaan ke service yang sesuai.

Command yang digunakan:

```bash
curl.exe http://localhost/health
curl.exe http://localhost/auth/health
curl.exe http://localhost/items/health
```

Hasil Pengujian :

##### Gateway Health Check

Request : 

```bash
curl.exe http://localhost/health
```

Response :
```bash
```

```bash
{
  "status": "healthy",
  "service": "gateway"
}
```
Status: ✅ PASS

##### Auth Service melalui Gateway

Request : 

```bash
curl.exe http://localhost/auth/health
```

Response :
```bash
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```
Status: ✅ PASS

##### Item Service melalui Gateway

Request:

```bash
curl.exe http://localhost/items/health
```

Response :
```bash
{
  "status": "healthy",
  "service": "item-service",
  "version": "2.1.0",
  "dependencies": {
    "auth-service": {
      "status": "available"
    },
    "database": {
      "status": "connected"
    }
  }
}
```
Status: ✅ PASS

### 4.2 Check Health Langsung ke Service

dilakukan dengan mengakses service melalui port masing-masing tanpa melewati API Gateway. Pengujian ini bertujuan memastikan setiap service dapat berjalan secara mandiri.

Command yang digunakan

```bash
curl.exe http://localhost:8001/health
curl.exe http://localhost:8002/health
```

Hasil Pengujian :

Auth Service
Request :

```bash
curl.exe http://localhost:8001/health
```

Response:

```bash
{
  "status": "healthy",
  "service": "auth-service",
  "version": "2.0.0"
}
```
Status: ✅ PASS


Item Service 
Request :

```bash
curl.exe http://localhost:8002/health
```

Response:

```bash
{
  "status": "healthy",
  "service": "item-service",
  "version": "2.1.0",
  "dependencies": {
    "auth-service": {
      "status": "available"
    },
    "database": {
      "status": "connected"
    }
  }
}
```
Status: ✅ PASS


Keterangan Endpoint : 

### Keterangan Endpoint

| Endpoint | Akses Melalui | Service Tujuan | Fungsi |
|---|---|---|---|
| `http://localhost/health` | Gateway | Gateway | Mengecek status kesehatan API Gateway |
| `http://localhost/auth/health` | Gateway | Auth Service | Mengecek status kesehatan Auth Service melalui API Gateway |
| `http://localhost/items/health` | Gateway | Item Service | Mengecek status kesehatan Item Service melalui API Gateway |
| `http://localhost:8001/health` | Langsung | Auth Service | Mengecek status kesehatan Auth Service secara langsung tanpa melalui Gateway |
| `http://localhost:8002/health` | Langsung | Item Service | Mengecek status kesehatan Item Service secara langsung tanpa melalui Gateway |


## 5. Testing Structured Logging

5.1 Lihat log Semua Service

```bash
docker compose logs
```

5.2 Melihat Log Auth Service
```bash
docker compose logs auth-service --tail=50
```

5.3 Lihat log Item Service

```bash
docker compose logs item-service --tail=50
```

5.4 Melihat Log Gateway

```bash
docker compose logs gateway --tail=50
```

5.5 Melihat Database

```bash
docker compose logs auth-db --tail=50
docker compose logs item-db --tail=50
```


5.6 Melihat Log secara Real-Time

```bash
docker compose logs -f auth-service item-service
```

Kode digunakan ketika ingin memantau log saat melakukan request dari Frontend, Swagger, atau terminal

## 6. Testing Correlation ID
Tujuan step ini Memastikan satu request bisa dilacak di semua service.

6.1 Mengirim Request dengan Correlation ID
Command yang digunakan:

```bash
curl.exe -H "X-Correlation-ID:test-123" http://localhost/items
```

Hasil Response : 
```bash
{
  "detail": [
    {
      "type": "missing",
      "loc": [
        "header",
        "authorization"
      ],
      "msg": "Field required",
      "input": null
    }
  ]
}
```
Berdasarkan response tersebut, request berhasil diterima oleh service, namun request ditolak karena endpoint /items membutuhkan header Authorization berupa token JWT.

Status:
✅ Request berhasil diteruskan ke service

6.2 Verifikasi Correlation ID pada Log Service

Command yang digunakan:

```bash
docker compose logs cuti-service --tail=100
```

Hasil Log :

```bash
{
  "timestamp": "2026-06-11T14:41:50.081842+00:00",
  "level": "WARNING",
  "service": "item-service",
  "logger": "logging_middleware",
  "message": "GET /items → 422 (79.66ms)",
  "correlation_id": "test-123",
  "method": "GET",
  "path": "/items",
  "status_code": 422,
  "duration_ms": 79.66
}
```

Berdasarkan log tersebut, nilai `correlation_id` berhasil tercatat sebagai  `test-123`, sesuai dengan header yang dikirimkan pada request.

Status:
✅ PASS

## 7. Testing Metrics Endpoint
Metrics endpoint digunakan untuk memantau performa service, seperti jumlah request, error rate, status code, dan waktu respons service.

7.1 Metrics Auth Service

Langsung Ke Service
Command:

```bash
curl.exe http://localhost:8001/metrics
```

Hasil Response :

```bash
{
  "service": "auth-service",
  "uptime_seconds": 4924.1,
  "total_requests": 489,
  "total_errors": 0,
  "error_rate_percent": 0.0,
  "status_codes": {
    "200": 489
  },
  "latency": {
    "p50_ms": 0.72,
    "p95_ms": 2.02,
    "p99_ms": 7.24,
    "avg_ms": 1.05
  }
}
```
Status: ✅ PASS

Melalui Gateaway

Command :
```bash
curl.exe http://localhost/auth/metrics
```

Response : 

```bash
{
  "service": "auth-service",
  "uptime_seconds": 4931.5,
  "total_requests": 491,
  "total_errors": 0,
  "error_rate_percent": 0.0,
  "status_codes": {
    "200": 491
  },
  "latency": {
    "p50_ms": 0.72,
    "p95_ms": 2.04,
    "p99_ms": 7.24,
    "avg_ms": 1.06
  }
}
```

Status: ✅ PASS


7.2 Metrics Item Service

Langsung ke service:

```bash
curl.exe http://localhost:8002/metrics
```
Melalui gateway:

```bash
curl.exe http://localhost/items/metrics
```

### Metrics yang Perlu Diperhatikan

| Metrics | Fungsi | Indikator Pengamatan |
|---|---|---|
| `uptime_seconds` | Menampilkan durasi service berjalan sejak pertama kali aktif | Memastikan service berjalan stabil dan tidak sering restart |
| `total_requests` | Menampilkan jumlah request yang telah diterima oleh service | Memantau jumlah trafik atau aktivitas request pada service |
| `total_errors` | Menampilkan jumlah request yang mengalami kegagalan | Mengetahui jumlah error yang terjadi pada service |
| `error_rate_percent` | Menampilkan persentase request yang mengalami error | Mengidentifikasi peningkatan error pada service |
| `status_codes` | Menampilkan distribusi response berdasarkan HTTP status code | Memantau jumlah request berhasil (`200`) maupun request gagal (`4xx/5xx`) |
| `latency.avg_ms` | Menampilkan rata-rata waktu response service | Mengukur performa rata-rata response time |
| `latency.p50_ms` | Menampilkan nilai latency pada 50% request | Melihat waktu response normal yang dirasakan sebagian besar pengguna |
| `latency.p95_ms` | Menampilkan nilai latency pada 95% request | Mengidentifikasi request yang mulai mengalami perlambatan |
| `latency.p99_ms` | Menampilkan nilai latency pada 99% request | Mendeteksi request dengan waktu response paling lambat |
| `endpoints` | Menampilkan metrics berdasarkan endpoint yang dipanggil | Mengetahui endpoint mana yang memiliki trafik atau error tertinggi |
| `error_alerting` | Menampilkan status peringatan ketika error rate meningkat | Memastikan sistem dapat memberikan indikasi ketika terjadi gangguan |


## 8. Common Troubleshooting

### 8.1 Masalah: 502 Bad Gateway

Gejala:

```text
502 Bad Gateway
```

Kemungkinan penyebab:

- Gateway tidak bisa terhubung ke service tujuan
- Service tujuan belum siap
- Konfigurasi routing di `nginx.conf` salah
- Port atau nama service tidak sesuai
- Gateway perlu di-restart setelah service lain hidup

Langkah pengecekan:

```bash
docker compose ps
docker compose logs gateway --tail=50
curl.exe http://localhost:8001/health
curl.exe http://localhost:8002/health
```

Jika service bisa diakses langsung melalui port `8001` atau `8002`, tetapi gagal melalui gateway, maka kemungkinan masalah berada pada konfigurasi gateway.

Contoh pengecekan ulang gateway:

```bash
docker compose restart gateway
curl.exe http://localhost/auth/health
```

### 8.2 Masalah: Database Disconnected

Gejala:

```json
{
  "database": {
    "status": "disconnected"
  }
}
```

Langkah pengecekan:

```bash
docker compose logs item-db --tail=50
docker compose exec item-db pg_isready -U postgres -d bye_virus
docker compose exec item-db psql -U postgres -d bye_virus -c "\dt"
```

Jika muncul:

```text
accepting connections
```

berarti database berjalan dan bisa menerima koneksi.

Jika service tetap membaca database `disconnected`, cek:

- Konfigurasi `DATABASE_URL`
- Kode health check pada service
- Migration atau tabel database
- Driver database yang digunakan service

Contoh `DATABASE_URL` yang benar untuk antar-container Docker:

```env
DATABASE_URL=postgresql://postgres:postgres@item-db:5432/bye_virus
```

Host harus menggunakan nama service Docker seperti `item-db`, bukan `localhost`.

### 8.3 Masalah: Role "root" Does Not Exist

Gejala pada log database:

```text
FATAL: role "root" does not exist
```

Kemungkinan penyebab:

- Healthcheck PostgreSQL menggunakan user default `root`
- Perintah `pg_isready` tidak menyebutkan user database
- Konfigurasi healthcheck di `docker-compose.yml` belum lengkap

Solusi:

Pastikan healthcheck menggunakan user PostgreSQL yang benar.

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres -d bye_virus"]
  interval: 5s
  timeout: 5s
  retries: 5
```

Setelah diperbaiki, jalankan ulang service:

```bash
docker compose up -d --build item-db item-service
```

### 8.4 Masalah: Service Tidak Berjalan

Langkah pengecekan:

```bash
docker compose ps
docker compose logs nama-service --tail=80
```

Contoh:

```bash
docker compose logs item-service --tail=80
```

Jika service mati, jalankan ulang:

```bash
docker compose up -d --build nama-service
```

Contoh:

```bash
docker compose up -d --build item-service
```

### 8.5 Masalah: Log Belum Berbentuk JSON

Gejala log masih terlihat seperti:

```text
INFO: Started server process
INFO: Application startup complete
```

Kemungkinan penyebab:

- Structured logging belum aktif
- Middleware logging belum ditambahkan
- `setup_logging()` belum dipanggil di `main.py`
- Environment variable `SERVICE_NAME` dan `LOG_LEVEL` belum ditambahkan
- Request yang dicek belum melewati middleware aplikasi

Yang perlu dicek:

- File `logging_config.py`
- File `logging_middleware.py`
- Pemanggilan `setup_logging()` di `main.py`
- Penambahan `RequestLoggingMiddleware`
- Environment variable `SERVICE_NAME`
- Environment variable `LOG_LEVEL`

### 8.6 Masalah: Metrics Tidak Bisa Diakses

Gejala:

```text
404 Not Found
```

atau:

```text
502 Bad Gateway
```

Kemungkinan penyebab:

- Endpoint `/metrics` belum dibuat di service
- Route metrics belum ditambahkan di gateway
- Service belum di-rebuild
- Gateway belum membaca konfigurasi terbaru

Langkah pengecekan:

```bash
curl.exe http://localhost:8001/metrics
curl.exe http://localhost:8002/metrics
docker compose logs gateway --tail=50
```

## 9. Escalation Path

Escalation path atau alur eskalasi adalah tahapan penanganan masalah ketika kendala yang ditemukan tidak dapat diselesaikan hanya melalui pengecekan awal. Dalam proses monitoring, Lead QA & Docs bertugas melakukan pemeriksaan pertama melalui health check, log service, metrics, dan correlation ID. Jika dari hasil pengecekan ditemukan masalah yang membutuhkan perbaikan teknis lebih lanjut, maka masalah tersebut perlu diteruskan kepada role yang sesuai dengan bidang tanggung jawabnya.

## 8.X Escalation Path (Alur Eskalasi)

| Level | Role | Kondisi / Masalah | Tindakan |
|------|------|-------------------|----------|
| Level 0 | Lead QA & Docs | Service down ringan, 502 sederhana, 404 endpoint, DB disconnected awal, log/metrics bermasalah | Cek health check, logs, metrics, correlation ID, docker compose ps/logs |
| Level 1A | Backend Service Owner | API error 500, logic error, health check gagal, dependency error (env/db) | Debug kode service, cek env, dependency, rebuild service |
| Level 1B | Gateway Owner | 502 Bad Gateway tidak terselesaikan, routing salah, service tidak terhubung | Cek nginx/gateway config, upstream mapping, restart gateway |
| Level 1C | Database Owner | role error, DB disconnected, connection/auth error | Cek DATABASE_URL, user/role DB, migration, docker DB config |
| Level 2 | DevOps / Infrastructure | Docker network error, port conflict, service tidak saling akses, compose issue | Restart/recreate container, cek network & port, validasi .env |
| Level 3 | System / Emergency | Banyak service gagal, sistem tidak bisa diakses, semua layer error | Full restart, rollback, rebuild semua service, investigasi root cause |

Alur eskalasi:


## 10. Checklist Operasional

Gunakan checklist berikut sebelum menyatakan sistem siap:

## Checklist Operasional Sistem

- [✓] Semua container berjalan dengan `docker compose ps`
- [✓] `auth-service` menunjukkan status `healthy`
- [✓] `item-service` menunjukkan status `healthy`
- [✓] Gateway dapat diakses melalui endpoint health (`/auth/health` atau sesuai routing gateway)
- [✓] Endpoint `/metrics` dapat diakses pada service atau gateway (jika diekspos)
- [✓] Log service dapat dibaca dengan jelas melalui Docker logs
- [✓] Correlation ID muncul pada response header
- [✓] Correlation ID dapat ditemukan di log service
- [✓] Tidak ada error database seperti `role "root" does not exist`
- [✓] Tidak ada error `502 Bad Gateway` pada gateway
