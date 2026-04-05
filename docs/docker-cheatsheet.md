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