# ============================================================
# Dockerfile — Backend Portal Cuti (FastAPI)
# ============================================================

# Base image Python 3.12 slim
FROM python:3.12-slim

# Install curl untuk healthcheck
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Install dependencies terlebih dahulu (layer caching)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode aplikasi
COPY . .

# Dokumentasikan port
EXPOSE 8000

# Jalankan aplikasi dengan uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]