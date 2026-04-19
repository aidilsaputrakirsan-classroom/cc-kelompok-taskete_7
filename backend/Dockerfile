# ============================================================
# SIMCUTI Backend — Dockerfile
# Python 3.12-slim, layer-optimized build
# ============================================================

FROM python:3.12-slim

# Metadata
LABEL maintainer="cc-kelompok-taskete_7"
LABEL description="SIMCUTI Backend — FastAPI + PostgreSQL"

# Set working directory
WORKDIR /app

# Install system dependencies (psycopg2 butuh libpq-dev)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements dulu (layer cache optimization)
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode aplikasi
COPY . .

# User non-root (modul 5 — keamanan container)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Jalankan backend
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]