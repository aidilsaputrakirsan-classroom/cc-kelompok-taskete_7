# ============================================================
<<<<<<< HEAD
# SIMCUTI Backend — Dockerfile
# Python 3.12-slim, layer-optimized build
# ============================================================

FROM python:3.12-slim

# Metadata
LABEL maintainer="cc-kelompok-taskete_7"
LABEL description="SIMCUTI Backend — FastAPI + PostgreSQL"
=======
# Dockerfile — Backend Portal Cuti (FastAPI)
# ============================================================

# Base image Python 3.12 slim
FROM python:3.12-slim

# Install curl untuk healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2

# Set working directory
WORKDIR /app

<<<<<<< HEAD
# Install system dependencies (psycopg2 butuh libpq-dev)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements dulu (layer cache optimization)
COPY requirements.txt .

# Install Python dependencies
=======
# Install dependencies terlebih dahulu (layer caching)
COPY requirements.txt .
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode aplikasi
COPY . .

<<<<<<< HEAD
# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Jalankan backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
=======
# Dokumentasikan port
EXPOSE 8000

# Jalankan aplikasi dengan uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
>>>>>>> ad6031cfa72468c089f9b36d076169268b9573e2
