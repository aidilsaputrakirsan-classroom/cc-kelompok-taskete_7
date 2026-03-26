# REST API — Cloud App (cc-kelompok-taskete_7)

Dokumen ini merangkum endpoint REST yang tersedia pada backend **Cloud App** (repository `cc-kelompok-taskete_7`).

```
Base URL  : http://127.0.0.1:8000
Swagger UI: http://127.0.0.1:8000/docs
```

## Token akses (JWT)

Endpoint yang terproteksi akan memverifikasi token JWT. Sertakan header berikut pada request:

```http
Authorization: Bearer <access_token>
```

Token biasanya didapat dari `POST /auth/login`.

---

## Ringkasan Endpoint

### Sistem (publik)


| Metode | Endpoint | Deskripsi | Perlu JWT? |
| ------ | --------- | -------------------- | -------------- |
| `GET`  | `/health` | Cek status API       | Tidak          |
| `GET`  | `/team`   | Menampilkan data tim | Tidak          |


### Autentikasi


| Metode | Endpoint | Fungsi | Perlu JWT? |
| ------ | ---------------- | ------------------------------------- | -------------- |
| `POST` | `/auth/register` | Registrasi user baru                  | Tidak          |
| `POST` | `/auth/login`    | Login dan mendapatkan JWT token       | Tidak          |
| `GET`  | `/auth/me`       | Melihat profil user yang sedang login | Ya             |


### Item (butuh JWT)


| Metode | Endpoint | Keterangan | Perlu JWT? |
| -------- | ------------------ | --------------------------------------------------- | -------------- |
| `GET`    | `/items/stats`     | Statistik item (jumlah item, stok, rata-rata harga) | Ya             |
| `POST`   | `/items`           | Menambahkan item baru                               | Ya             |
| `GET`    | `/items`           | List items + search + pagination                    | Ya             |
| `GET`    | `/items/{item_id}` | Detail item berdasarkan ID                          | Ya             |
| `PUT`    | `/items/{item_id}` | Update item berdasarkan ID                          | Ya             |
| `DELETE` | `/items/{item_id}` | Hapus item berdasarkan ID                           | Ya             |


---

## Detail API

## A. System

### 1. Health Check

- URL: `/health`
- Method: `GET`
- Auth Required?: ❌ No
- Request Body: `none`
- Response (200 OK):

```json
{
  "status": "healthy",
  "version": "0.4.2"
}
```

- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/health' \
  -H 'accept: application/json'
```

- request url

```text
http://127.0.0.1:8000/health
```

### 2. Team Info

- URL: `/team`
- Method: `GET`
- Auth Required?: ❌ No
- Request Body: `none`
- Response (200 OK):

```json
{
  "team": "cc-kelompok-taskete_7",
  "members": [
    {
      "name": "Noviansyah",
      "nim": "10231072",
      "role": "Lead Backend"
    },
    {
      "name": "Irwan Maulana",
      "nim": "10231046",
      "role": "Lead Frontend"
    },
    {
      "name": "Rayhan Iqbal",
      "nim": "10231080",
      "role": "Lead DevOps"
    },
    {
      "name": "Amalia Tiara Rezfani",
      "nim": "10231012",
      "role": "Lead QA & Docs"
    }
  ]
}
```

- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/team' \
  -H 'accept: application/json'
```

- request url

```text
http://127.0.0.1:8000/team
```

---

## B. Authentication

### 1. Register

- URL: `/auth/register`
- Method: `POST`
- Auth Required?: ❌ No
- Request Body:

```json
{
  "email": "nama1@student.itk.ac.id",
  "name": "John Doe1",
  "password": "StrongPass1234!"
}
```

- Response (201 Created):

```json
{
  "id": 12,
  "email": "nama1@student.itk.ac.id",
  "name": "John Doe1",
  "is_active": true,
  "created_at": "2026-03-26T09:13:05.733646+08:00"
}
```

- curl

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "nama1@student.itk.ac.id",
  "name": "John Doe1",
  "password": "StrongPass1234!"
}'
```

- request url

```text
http://127.0.0.1:8000/auth/register
```

### 2. Login

- URL: `/auth/login`
- Method: `POST`
- Auth Required?: ❌ No
- Request Body: `application/x-www-form-urlencoded`


| Field    | Type   | Required | Description                                   |
| -------- | ------ | -------- | --------------------------------------------- |
| username | String | ✅ Yes    | Email user (contoh: `user@student.itk.ac.id`) |
| password | String | ✅ Yes    | Password user                                 |


- Response (200 OK):

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTMzNH0.q1R5_3rrVWG1tKY-3cfoteIsYERm-OPq08A5G-yTzeA",
  "token_type": "bearer",
  "user": {
    "id": 12,
    "email": "nama1@student.itk.ac.id",
    "name": "John Doe1",
    "is_active": true,
    "created_at": "2026-03-26T09:13:05.733646+08:00"
  }
}
```

- curl

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'grant_type=password&username=nama1%40student.itk.ac.id&password=StrongPass1234!&scope=&client_id=string&client_secret=string'
```

- request url

```text
http://127.0.0.1:8000/auth/login
```

### 3. Get Current User

- URL: `/auth/me`
- Method: `GET`
- Auth Required?: ✅ Yes
- Request Body: `none`
- Header wajib:

```text
Authorization: Bearer JWT_TOKEN_STRING
```

- Response (200 OK):

```json
{
  "id": 12,
  "email": "nama1@student.itk.ac.id",
  "name": "John Doe1",
  "is_active": true,
  "created_at": "2026-03-26T09:13:05.733646+08:00"
}
```

- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/auth/me' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTQ4NH0.Qfb-QP0n3zlSsoqD2AqH2TUQUKyojTaGCBF9ancPXLE'
```

- request url

```text
http://127.0.0.1:8000/auth/me
```

---

## C. Items (Protected)

### 1. Item Statistics

- URL: `/items/stats`
- Method: `GET`
- Auth Required?: ✅ Yes
- Request Body: `none`
- Response (200 OK):

```json
{
  "total_items": 2,
  "total_stock": 30,
  "average_price": 12000000
}
```

- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/items/stats' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4'
```

- request url

```text
http://127.0.0.1:8000/items/stats
```

### 2. Create Item

- URL: `/items`
- Method: `POST`
- Auth Required?: ✅ Yes
- Request Body:

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 15
}
```

- Response (201 Created):

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 15,
  "id": 12,
  "created_at": "2026-03-26T09:25:01.684260+08:00",
  "updated_at": null
}
```

- curl

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/items' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 15
}'
```

- request url

```text
http://127.0.0.1:8000/items
```

### 3. Get Items (List + Search + Pagination)

- URL: `/items`
- Method: `GET`
- Auth Required?: ✅ Yes
- Query Parameters:


| Parameter | Type    | Required | Description                                       |
| --------- | ------- | -------- | ------------------------------------------------- |
| skip      | Integer | ❌ No     | Jumlah data yang dilewati (default `0`)           |
| limit     | Integer | ❌ No     | Jumlah data per halaman (default `20`, max `100`) |
| search    | String  | ❌ No     | Kata kunci pencarian nama/deskripsi               |


- Response (200 OK):

```json
{
  "total": 3,
  "items": [
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 15000000,
      "quantity": 15,
      "id": 12,
      "created_at": "2026-03-26T09:25:01.684260+08:00",
      "updated_at": null
    },
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 15000000,
      "quantity": 15,
      "id": 11,
      "created_at": "2026-03-26T09:25:00.640355+08:00",
      "updated_at": null
    },
    {
      "name": "Laptop",
      "description": "Laptop rtx 5060",
      "price": 15000000,
      "quantity": 20,
      "id": 9,
      "created_at": "2026-03-26T09:22:26.102013+08:00",
      "updated_at": null
    }
  ]
}
```
- Success code: `200`
- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/items?skip=0&limit=20&search=laptop' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4'
```

- request url

```text
http://127.0.0.1:8000/items?skip=0&limit=20&search=laptop
```

### 4. Get Item by ID

- URL: `/items/{item_id}`
- Method: `GET`
- Auth Required?: ✅ Yes
- Path Parameters:


| Parameter | Type    | Description                |
| --------- | ------- | -------------------------- |
| item_id   | Integer | ID item yang ingin dilihat |


- Request Body: `none`
- Response (200 OK):

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 15,
  "id": 12,
  "created_at": "2026-03-26T09:25:01.684260+08:00",
  "updated_at": null
}
```
- Success code: `200`
- Not found: `404`
- curl

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/items/12' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4'
```

- request url

```text
http://127.0.0.1:8000/items/12
```

### 5. Update Item

- URL: `/items/{item_id}`
- Method: `PUT`
- Auth Required?: ✅ Yes
- Request Body (partial update diperbolehkan):

```json
{
  "name": "laptop",
  "description": "Laptop untuk saya",
  "price": 180000000,
  "quantity": 40
}
```

- Response (200 OK):

```json
{
  "name": "laptop",
  "description": "Laptop untuk saya",
  "price": 180000000,
  "quantity": 40,
  "id": 12,
  "created_at": "2026-03-26T09:25:01.684260+08:00",
  "updated_at": "2026-03-26T09:39:18.153015+08:00"
}
```
- Success code: `200`
- Not found: `404`   
- curl

```bash
curl -X 'PUT' \
  'http://127.0.0.1:8000/items/12' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "laptop",
  "description": "Laptop untuk saya",
  "price": 180000000,
  "quantity": 40
}'
```

- request url

```text
http://127.0.0.1:8000/items/1
```

### 6. Delete Item

- URL: `/items/{item_id}`
- Method: `DELETE`
- Auth Required?: ✅ Yes
- Request Body: `none`
- Success code: `204`
- Not found: `404`
- curl

```bash
curl -X 'DELETE' \
  'http://127.0.0.1:8000/items/12' \
  -H 'accept: */*' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMiIsImV4cCI6MTc3NDQ5MTU3M30.7NAzFyq-EqIKbzc3ODldbEf1JDooJDkX_cz9TIqosa4'
```

- request url

```text
http://127.0.0.1:8000/items/1
```

