# Reliability Testing Documentation

## 1. Tujuan Pengujian
Dokumentasi ini dibuat untuk menguji reliability pada arsitektur microservices SIMCUTI, khususnya komunikasi antara Auth Service dan Cuti Service. Pengujian dilakukan berdasarkan skenario yang diminta pada Modul 13, yaitu:
1. Service Down Testing
2. Timeout Testing
3. Recovery Testing

## 2. Lingkungan Pengujian

#### Services yang digunakan
- Gateaway
- Auth Service 
- Item Service
- Auth Database
- Item Database

#### Menjalankan Sistem
```text
docker compose up -d 
docker compose ps
```
Semua container harus berada pada status running sebelum pengujian dilakukan.


##### Status Container yang Diharapkan

| Container            | Status       |
| -------------------- | ------------ |
| simcuti-gateway      | Up           |
| simcuti-auth-service | Up (healthy) |
| simcuti-cuti-service | Up (healthy) |
| simcuti-auth-db      | Up (healthy) |
| simcuti-cuti-db      | Up (healthy) |


## Test Scenario 1 Service Down
Memastikan sistem dapat menangani kondisi ketika Auth Service tidak tersedia dan mencegah terjadinya cascading failure.

##### Cara Reproduce

1. Jalankan seluruh container.
```text
docker compose ps
```
2. Matikan Auth Service 

```text
docker compose stop auth-service
```

2. Matikan Auth Service 
   
```text
docker compose stop auth-service
```

3. Verifikasi Auth Service
```text
docker compose ps
```

4. Periksa request endpoint yang membutuhkan autentikasi


##### Expected Behavior 

* Item/Cuti Service mencoba menghubungi Auth Service.
* Sistem melakukan retry beberapa kali.
* Setelah retry gagal, sistem mengembalikan HTTP 503.
* Circuit Breaker berubah ke status OPEN.
* Status health berubah menjadi degraded.

##### Hasil Test

| Pengujian               | Hasil              |
| ----------------------- | ------------------ |
| Retry berjalan          | ✅ Berhasil         |
| HTTP 503 saat auth down | ✅ Berhasil         |
| Circuit Breaker OPEN    | ✅ Berhasil         |
| Fast fail saat OPEN     | ✅ Berhasil (~3 ms) |
| Status health degraded  | ✅ Berhasil         |
| Endpoint public tetap dapat diakses | ✅ Berhasil |
| Endpoint stats tetap dapat diakses | ✅ Berhasil |

### Hasil Aktual

* Setelah Auth Service dihentikan, request ke endpoint menghasilkan HTTP 503.
* Circuit Breaker berubah ke status OPEN setelah mencapai failure threshold sebanyak 5 kali.
* Request berikutnya langsung ditolak tanpa menunggu timeout.
* Health endpoint menunjukkan status degraded.
* * Endpoint `/items/public` dan `/items/stats` tetap dapat diakses dengan HTTP 200 meskipun Auth Service tidak tersedia.

### Kesimpulan

Service Down Testing berhasil dan sistem mampu menangani kegagalan layanan dengan baik melalui retry dan circuit breaker.


## 4. Timeout Tezting
Memastikan sistem dapat menangani kondisi ketika Auth Service merespons terlalu lambat atau mengalami timeout.

##### Cara Reproduce
1. Simulasikan Auth Service lambat atau tidak merespons.
2. Kirim request ke endpoint yang membutuhkan autentikasi.
3. Periksa log pada Cuti Service.


##### Expected Behavior

* Sistem mendeteksi timeout.
* Retry dilakukan sebanyak 3 kali.
* Menggunakan exponential backoff (0.5 detik, 1 detik).
* Setelah seluruh retry gagal, sistem mengembalikan HTTP 503.

##### Hasil Test

| Pengujian                    | Hasil      |
| ---------------------------- | ---------- |
| Retry attempt 1/3            | ✅ Berhasil |
| Retry attempt 2/3            | ✅ Berhasil |
| Retry attempt 3/3            | ✅ Berhasil |
| Exponential backoff berjalan | ✅ Berhasil |
| HTTP 503 setelah retry habis | ✅ Berhasil |

##### Hasil Aktual

Log service menunjukkan:

```text
Cannot connect to Auth Service (attempt 1/3)
Retrying in 0.5s...
Cannot connect to Auth Service (attempt 2/3)
Retrying in 1.0s...
Cannot connect to Auth Service (attempt 3/3)
Auth Service unreachable after 3 attempts
```

Request menghasilkan HTTP 503 dengan waktu sekitar 13,4 detik.

##### Kesimpulan

Timeout handling berhasil berjalan sesuai rancangan dengan mekanisme retry dan exponential backoff.

## 5. Recovery Testing
Memastikan sistem dapat kembali beroperasi normal setelah Auth Service pulih.

##### Cara Reproduce

1. Nyalakan kembali Auth Service.

```bash
docker compose start auth-service
```

2. Tunggu cooldown Circuit Breaker selama 30 detik.

```bash
sleep 35
```

3. Kirim request menggunakan token yang valid.
4. Periksa endpoint health.


##### Expected Behavior
* Circuit Breaker berpindah dari OPEN ke HALF_OPEN.
* Request uji berhasil.
* Circuit Breaker kembali ke CLOSED.
* Health endpoint kembali healthy.

##### Hasil Test

| Pengujian                  | Hasil      |
| -------------------------- | ---------- |
| Auth Service kembali aktif | ✅ Berhasil |
| Recovery request berhasil  | ✅ Berhasil |
| Circuit Breaker CLOSED     | ✅ Berhasil |
| Status healthy             | ✅ Berhasil |

##### Hasil Aktual

* Setelah Auth Service dinyalakan kembali dan cooldown selesai, request berhasil diproses.
* Endpoint `/items` mengembalikan HTTP 200.
* Circuit Breaker kembali ke status CLOSED.
* Health endpoint menunjukkan status healthy.

##### Kesimpulan

Recovery process berhasil dan sistem dapat kembali ke kondisi normal setelah layanan pulih.

# 6. Ringkasan Hasil Pengujian

| No | Skenario Pengujian   | Status   |
| -- | -------------------- | -------- |
| 1  | Service Down Testing | ✅ Passed |
| 2  | Timeout Testing      | ✅ Passed |
| 3  | Recovery Testing     | ✅ Passed |

---

# 7. Kesimpulan Akhir

Berdasarkan hasil pengujian Modul 13, implementasi reliability pada sistem microservices SIMCUTI telah berjalan dengan baik. Retry mechanism berhasil menangani kegagalan sementara, circuit breaker mampu mencegah cascading failure saat Auth Service tidak tersedia, dan proses recovery memungkinkan sistem kembali beroperasi normal setelah service dipulihkan. Seluruh skenario pengujian yang dipersyaratkan pada Modul 13 dinyatakan berhasil.
