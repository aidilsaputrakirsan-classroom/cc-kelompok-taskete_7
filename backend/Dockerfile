# ============================================================
# SIMCUTI Backend — Dockerfile (multi-stage, modul 6)
# Stage 1: venv + pip install deps
# Stage 2: hanya runtime + salinan venv + kode (image lebih ramping)
# ============================================================

# ---------- Stage 1: builder ----------
FROM python:3.12-slim AS builder

WORKDIR /app

# psycopg2-binary biasanya pakai wheel; libpq-dev jaga-jaga jika build dari source
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Virtualenv terisolasi untuk dependencies (sesuai tugas modul 6)
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# ---------- Stage 2: runtime ----------
FROM python:3.12-slim

LABEL maintainer="cc-kelompok-taskete_7"
LABEL description="SIMCUTI Backend — FastAPI + PostgreSQL (multi-stage)"

WORKDIR /app

# Runtime: libpq untuk psycopg2, curl untuk HEALTHCHECK (bukan dev headers)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Salin venv dari builder (tanpa pip cache / toolchain build)
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY . .

# User non-root (modul 5)
RUN useradd -m appuser && chown -R appuser:appuser /app
USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
