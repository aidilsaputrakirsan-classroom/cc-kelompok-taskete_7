# API Contract — Cloud App Microservices

## Base URLs

| Environment | Gateway URL |
|-------------|-------------|
| Local Development | http://localhost |
| Production | https://cc-kelompok-taskete7.akhzafachrozy.my.id/ |

## Authentication

All protected endpoints require JWT token in header:
```
Authorization: Bearer <access_token>
```

Token diperoleh dari `POST /auth/login`.  
Token expire setelah 30 menit (configurable via TOKEN_EXPIRE_MINUTES).

## Error Response Format

Semua error menggunakan format yang konsisten:
```json
{
    "detail": "Error message description"
}
```

| Status Code | Meaning |
|-------------|---------|
| 200 | Success |
| 201 | Created |
| 204 | Deleted (no content) |
| 400 | Bad request / validation error |
| 401 | Unauthorized / invalid token |
| 404 | Resource not found |
| 422 | Validation error (Pydantic) |
| 429 | Rate limited |
| 503 | Service unavailable |

## Auth Service Endpoints

### POST /auth/register
- **Rate limit**: 5 req/s
- **Body**: `{"email": "str", "password": "str (min 8, 1 uppercase, 1 digit)", "name": "str"}`
- **Response 201**: `{"id": int, "email": "str", "name": "str"}`

### POST /auth/login
- **Rate limit**: 5 req/s
- **Body**: `{"email": "str", "password": "str"}`
- **Response 200**: `{"access_token": "str", "token_type": "bearer"}`

### GET /auth/verify
- **Internal**: Dipanggil oleh service lain, bukan frontend
- **Header**: `Authorization: Bearer <token>`
- **Response 200**: `{"user_id": int, "email": "str", "name": "str"}`

## Item Service Endpoints

### GET /items?search=&skip=0&limit=20
- **Auth**: Required
- **Response 200**: `{"total": int, "items": [ItemResponse]}`

### POST /items
- **Auth**: Required
- **Body**: `{"name": "str", "description": "str?", "price": float, "quantity": int?}`
- **Response 201**: ItemResponse

### GET /items/{id}
- **Auth**: Required
- **Response 200**: ItemResponse

### PUT /items/{id}
- **Auth**: Required
- **Body**: Partial update (any field from ItemCreate)
- **Response 200**: ItemResponse

### DELETE /items/{id}
- **Auth**: Required
- **Response 204**: No content