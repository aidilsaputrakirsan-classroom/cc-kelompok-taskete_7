# API Test Results — Taskete 7

---

## Ringkasan Hasil Testing

| No | Endpoint | Method | Status Code | Result |
|----|----------|--------|-------------|--------|
| 1 | `/items` | POST | 201 ✅ | Item berhasil dibuat |
| 2 | `/items` | GET | 200 ✅ | List items dengan pagination |
| 3 | `/items/1` | GET | 200 ✅ | Single item ditemukan |
| 4 | `/items/1` | PUT | 200 ✅ | Item berhasil diupdate |
| 5 | `/items/1` | GET | 200 ✅ | Cek Item berhasil diupdate |
| 6 | `/items?search=laptop` | GET | 200 ✅ | Search berfungsi |
| 7 | `/items/1` | DELETE | 204 ✅ | Item berhasil dihapus |
| 8 | `/items/1` | GET | 404 ✅ | Item tidak ditemukan (expected) |

---

## Detail Testing

#### 1. Create Item (POST /items)

**Items Laptop**
![](screenshots/1-laptop.png)

**Items Mouse Wireless**
![](screenshots/1-mouse.png)

**Items Keyboard Mechanical**
![](screenshots/1-keyboard.png)

#### 2. List All Items (GET /items)
![](screenshots/2-list-all-items.png)

#### 3. Get Single Item (GET /items/1)
![](screenshots/3-get-single-items.png)

#### 4. Update Item (PUT /items/1)
![](screenshots/4-update-items.png)

#### 5. Check Updated Item (GET /items/1)
![](screenshots/5-check-updated-items.png)

#### 6. Search Items (GET /items?search=laptop)
![](screenshots/6-search-items.png)

#### 7. Delete Item (DELETE /items/1)
![](screenshots/7-delete-items.png)

#### 8. Verify Delete — 404 Not Found (GET /items/1)
![](screenshots/8-verify-delete.png)