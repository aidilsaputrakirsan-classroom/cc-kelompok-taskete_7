# Uts Demoscript - Taskete_7 

👥 Identitas Tim

Nama Tim: Taskete_7

Nama Aplikasi: SIMCUTI - Sistem Manajemen Cuti Karyawan

## 1. 🖥️ Live Demo (±10 Menit)


### ⏱️ Menit 0–1 — Menjalankan Aplikasi (DevOps)


 “Pada awal demo, kami menjalankan seluruh sistem menggunakan Docker Compose.”

- Membuka terminal di root project
    - dan menjalankan
  
        ```
        docker compose up -d
        ```

         ```
        docker compose ps
        ```

    Pastikan :
   -  Ada 3 container utama: database, backend, dan frontend
   - Ketiganya sudah running
   - Database memiliki ```healthy```
  
### ⏱️ Menit 1–3 — Login dan Register (Frontend)
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
  
  
### ⏱️ Menit 3–6 — Demo CRUD Procurement (Frontend + Backend)

- CREATE 2-3 items
- Edit 1 Items
- Search Item
- Update items
- Delete Item

  
### ⏱️ Menit 6–7 — Demo API Backend (Backend)
   
Buka : 

    ```
    http://localhost:8000/docs
    ```


### ⏱️ Menit 7–8 — Uji Penyimpanan Data (DevOps) 

Jalan kan :   

 ```
docker compose down
```

 ```
docker compose up -d
```

Kemudian :

- Login kembali
- Perlihatkan bahwa data procurement sebelumnya masih ada

Jelaskan 
- Data tersimpan karena menggunakan Docker Volume

### 💻 Code Walkthrough (±5 Menit)

Tunjukkan :

```
docker-compose.yml  
 ```

- Tunjukkan 

    ```Dockerfile```


  


