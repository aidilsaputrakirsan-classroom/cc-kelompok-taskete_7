# 🐳 Docker Commands Cheat Sheet (Cloud Team)

Cheatsheet ini dikhususkan untuk mempermudah tim dalam mengelola Docker image dan container pada proyek **CloudApp**.

## 1. 🏗️ BUILD (Membangun Image)
Digunakan untuk membangun Docker Image dari `Dockerfile`.

**Perintah Dasar:** `docker build -t <nama-image>:<tag> <path>`
**Contoh Proyek (Backend):**
```bash
# Masuk ke folder backend dulu
cd backend

# Build image backend dengan tag v1
docker build -t cloudapp-backend:v1 .
```

## 2. 🏃 RUN (Menjalankan Container)
Digunakan untuk menjalankan container dari image yang sudah dibuat.

**Perintah Dasar:** `docker run -p <port-host>:<port-container> <nama-image>`
**Contoh Proyek (Backend Foreground - lihat log real-time):**
```bash
docker run -p 8000:8000 --env-file .env cloudapp-backend:v1
```
**Contoh Proyek (Backend Background / Detached mode):**
```bash
docker run -d -p 8000:8000 --env-file .env --name backend-api cloudapp-backend:v1
```

## 2. 🏃 RUN (Menjalankan Container)
Digunakan untuk menjalankan container dari image yang sudah dibuat.

**Perintah Dasar:** `docker run -p <port-host>:<port-container> <nama-image>`
**Contoh Proyek (Backend Foreground - lihat log real-time):**
```bash
docker run -p 8000:8000 --env-file .env cloudapp-backend:v1
```
**Contoh Proyek (Backend Background / Detached mode):**
```bash
docker run -d -p 8000:8000 --env-file .env --name backend-api cloudapp-backend:v1
```

## 3. 🔍 PS (Melihat Container)
Digunakan untuk melihat daftar container yang sedang berjalan atau sudah berhenti.

```bash
# Melihat container yang SEDANG BERJALAN
docker ps

# Melihat SEMUA container (termasuk yang error/stop)
docker ps -a
```

