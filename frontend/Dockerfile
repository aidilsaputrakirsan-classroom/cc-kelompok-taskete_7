# ============================================================
# SIMCUTI Frontend — Dockerfile (Multi-Stage Build)
#
# Stage 1: Build React app dengan Node.js
# Stage 2: Serve static files dengan Nginx Alpine
#
# Image final ~25 MB (vs ~1 GB jika single-stage)
# ============================================================

# ============================================================
# STAGE 1: Builder — Node.js untuk build React
# ============================================================
FROM node:20-alpine AS builder

LABEL maintainer="cc-kelompok-taskete_7"
LABEL stage="builder"

WORKDIR /app

# Copy dependency files dulu (cache optimization)
# Jika package.json belum berubah, layer ini di-cache
COPY package.json package-lock.json* ./

# npm ci = clean install (lebih cepat & reproducible dari npm install)
RUN npm ci --silent

# Copy seluruh source code
COPY . .

# Set API URL (bisa di-override saat docker compose build)
# Nilai ini di-embed langsung ke dalam JavaScript bundle
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL

# Build → output di /app/dist/
RUN npm run build

# ============================================================
# STAGE 2: Production — Nginx Alpine untuk serve static files
# ============================================================
FROM nginx:1.25-alpine

LABEL description="SIMCUTI Frontend — Nginx + React Build"

# Copy build output dari stage builder
COPY --from=builder /app/dist/ /usr/share/nginx/html/

# Copy custom Nginx config (SPA routing)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Nginx port
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q --spider http://localhost:80 || exit 1

# Nginx runs in foreground
CMD ["nginx", "-g", "daemon off;"]
