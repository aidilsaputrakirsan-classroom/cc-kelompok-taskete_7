# API Documentation — Cloud App (SIMCUTI)

## Base URL (Development)

- `http://127.0.0.1:8000`

> Sesuaikan dengan environment Anda. Di lokal, backend biasanya jalan di `http://127.0.0.1:8000`.

---

## Ringkasan Endpoint

| No | Method | URL                         | Deskripsi                             | Auth?      |
|----|--------|-----------------------------|----------------------------------------|-----------|
| 1  | GET    | `/health`                   | Cek status API                         | Tidak     |
| 2  | POST   | `/auth/register`            | Registrasi user baru                   | Tidak     |
| 3  | POST   | `/auth/login`               | Login dan dapatkan JWT token           | Tidak     |
| 4  | GET    | `/auth/me`                  | Profil user yang sedang login          | **Wajib** |
| 5  | POST   | `/items`                    | Buat item baru                         | **Wajib** |
| 6  | GET    | `/items`                    | List items + pagination + search       | **Wajib** |
| 7  | GET    | `/items/{item_id}`          | Detail item by ID                      | **Wajib** |
| 8  | PUT    | `/items/{item_id}`          | Update item by ID                      | **Wajib** |
| 9  | DELETE | `/items/{item_id}`          | Hapus item by ID                       | **Wajib** |
| 10 | GET    | `/team`                     | Informasi tim developer                | Tidak     |

---

## 1. Health

### GET `/health`

**Method**: `GET`  
**URL**: `http://127.0.0.1:8000/health`
**Deskripsi**: Mengecek apakah API sedang berjalan.

- **Auth required**: Tidak
- **Status sukses**: `200 OK`

**Contoh Response**

```json
{
  "status": "healthy",
  "version": "0.4.0"
}
```

**Contoh curl**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/health' \
  -H 'accept: application/json'
```

---

## 2. Authentication

### 2.1 Register

#### POST  `/auth/register`  

**Method**: `POST`  
**URL**: `http://127.0.0.1:8000/auth/register`
**Deskripsi**: Registrasi user baru.

- **Auth required**: Tidak
- **Status sukses**: `201 Created`

**Request Body**

```json
{
  "email": "user1@student.itk.ac.id",
  "name": "Nama Lengkap",
  "password": "password123"
}
```

**Response (201)**

```json
{
  "id": 7,
  "email": "user1@student.itk.ac.id",
  "name": "Nama Lengkap",
  "is_active": true,
  "created_at": "2026-03-18T09:55:33.764894+08:00"
}
```

**Contoh curl**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/register' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user1@student.itk.ac.id",
  "name": "Nama Lengkap",
  "password": "password123"
}'
```

---

### 2.2 Login

#### POST `/auth/login` 

**Method**: `POST`  
**URL**:  `http://127.0.0.1:8000/auth/login`
**Deskripsi**: Login dan mendapatkan JWT access token.

- **Auth required**: Tidak
- **Status sukses**: `200 OK`

**Request Body**

```json
{
  "email": "user1@student.itk.ac.id",
  "password": "password123"
}
```

**Response (200)**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3IiwiZXhwIjoxNzczODAyNjUzfQ.mj2q_N0sdGTS18G7hautCuFm1s_5hXPNEpCazrgwPwU",
  "token_type": "bearer",
  "user": {
    "id": 7,
    "email": "user1@student.itk.ac.id",
    "name": "Nama Lengkap",
    "is_active": true,
    "created_at": "2026-03-18T09:55:33.764894+08:00"
  }
}
```

**Contoh curl**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/auth/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "user1@student.itk.ac.id",
  "password": "password123"
}'
```

---

### 2.3 Get Current User

#### GET `/auth/me`

**Method**: `GET`  
**URL**: `http://127.0.0.1:8000/auth/me`
**Deskripsi**: Mengambil profil user yang sedang login.

- **Auth required**: **Ya** (`Authorization: Bearer <access_token>`)
- **Status sukses**: `200 OK`

**Response (200)**

```json
{
  "id": 0,
  "email": "string",
  "name": "string",
  "is_active": true,
  "created_at": "2026-03-18T03:06:29.421Z"
}
```

**Contoh curl**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/auth/me' \
  -H 'accept: application/json'
```

---

## 3. Items (Protected)

Semua endpoint `/items` **membutuhkan JWT token** di header:

```text
Authorization: Bearer <access_token>
```

### 3.1 Create Item

#### POST `/items`

**Method**: `POST`  
**URL**: `http://127.0.0.1:8000/items`
**Deskripsi**: Membuat item baru.

- **Auth required**: Ya
- **Status sukses**: `201 Created`

**Request Body**

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 10
} 
```

**Response (201)**

```json
{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 10,
  "id": 0,
  "created_at": "2026-03-18T03:02:12.936Z",
  "updated_at": "2026-03-18T03:02:12.936Z"
}
```

**Contoh curl**

```bash
curl -X 'POST' \
  'http://127.0.0.1:8000/items' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Laptop",
  "description": "Laptop untuk cloud computing",
  "price": 15000000,
  "quantity": 10
}'
```

---

### 3.2 List Items

#### GET `/items`

**Method**: `GET`  
**URL**: `http://127.0.0.1:8000/items?skip=12&limit=20&search=sad`
**Deskripsi**: Mengambil daftar items dengan pagination dan search.

- **Auth required**: Ya
- **Query params**:
  - `skip` (default `0`)
  - `limit` (default `20`, max `100`)
  - `search` (opsional — cari nama/deskripsi)
- **Status sukses**: `200 OK`

**Response (200)**

```json
{
  "total": 0,
  "items": [
    {
      "name": "Laptop",
      "description": "Laptop untuk cloud computing",
      "price": 15000000,
      "quantity": 10,
      "id": 0,
      "created_at": "2026-03-18T03:19:42.746Z",
      "updated_at": "2026-03-18T03:19:42.746Z"
    }
  ]
}
```

**Contoh curl**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/items?skip=12&limit=20&search=sad' \
  -H 'accept: application/json' 
```

---

### 3.3 Get Item by ID

#### GET `/items/{item_id}`

**Method**: `GET`  
**URL**: `http://127.0.0.1:8000/items/1`
**Deskripsi**: Mengambil satu item berdasarkan ID.

- **Auth required**: Ya
- **Status sukses**: `200 OK`
- **Status jika tidak ditemukan**: `404 Not Found`

**Contoh curl**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/items/1' \
  -H 'accept: application/json'
```

---

### 3.4 Update Item

#### PUT `/items/{item_id}`

**Method**: `PUT`  
**URL**: `http://127.0.0.1:8000/items/1`
**Deskripsi**: Mengupdate item berdasarkan ID.

- **Auth required**: Ya
- **Status sukses**: `200 OK`
- **Status jika tidak ditemukan**: `404 Not Found`

**Request Body (partial allowed)**

```json
{
  "name": "Laptop Pro",
  "price": 20000000
}
```

**Contoh curl**

```bash
curl -X 'PUT' \
  'http://127.0.0.1:8000/items/1' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "string",
  "description": "string",
  "price": 1,
  "quantity": 0
}'
```

---

### 3.5 Delete Item

#### DELETE `/items/{item_id}`

**Method**: `DELETE`  
**URL**: `http://127.0.0.1:8000/items/1`
**Deskripsi**: Menghapus item berdasarkan ID.

- **Auth required**: Ya
- **Status sukses**: `204 No Content`
- **Status jika tidak ditemukan**: `404 Not Found`

**Contoh curl**

```bash
curl -X 'DELETE' \
  'http://127.0.0.1:8000/items/1' \
  -H 'accept: */*'
```

---

## 4. Team

### GET `/team`

**Method**: `GET`  
**URL**: `http://127.0.0.1:8000/team`
**Deskripsi**: Menampilkan informasi tim pengembang (nama, NIM, role).

- **Auth required**: Tidak
- **Status sukses**: `200 OK`

**Contoh curl**

```bash
curl -X 'GET' \
  'http://127.0.0.1:8000/team' \
  -H 'accept: application/json'
```

