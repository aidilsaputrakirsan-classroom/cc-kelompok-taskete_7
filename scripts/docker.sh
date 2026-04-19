#!/usr/bin/env bash
# ============================================================
# SIMCUTI — helper Docker / Compose (modul 5 Lead CI/CD)
# Repo: cc-kelompok-taskete_7
#
# Usage (dari root repo, pakai Git Bash / WSL / Linux):
#   ./scripts/docker.sh run
#   ./scripts/docker.sh build
#   ./scripts/docker.sh push
#   ./scripts/docker.sh clean
#
# Push butuh username Docker Hub:
#   export DOCKERHUB_USER=namauser
#   ./scripts/docker.sh push
#
# Jika nama image lokal beda, set:
#   export COMPOSE_IMAGE_PREFIX=prefix_dari_docker_images
# ============================================================

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

DOCKERHUB_USER="${DOCKERHUB_USER:-}"
TAG="${TAG:-latest}"
# Default: prefix image hasil `docker compose build` = nama folder project + underscore
COMPOSE_IMAGE_PREFIX="${COMPOSE_IMAGE_PREFIX:-cc-kelompok-taskete_7}"

run() {
  echo "🚀 SIMCUTI — docker compose up -d"
  docker compose up -d
  echo "✅ Frontend http://localhost:3000 | Backend http://localhost:8000/docs"
}

build() {
  echo "🔨 SIMCUTI — docker compose up --build -d"
  docker compose up --build -d
  echo "✅ Build selesai."
}

push() {
  if [[ -z "$DOCKERHUB_USER" ]]; then
    echo "Error: set DOCKERHUB_USER (username Docker Hub), contoh:"
    echo "  export DOCKERHUB_USER=namaanda"
    echo "  $0 push"
    exit 1
  fi
  echo "📦 Build backend + frontend, lalu push ke Docker Hub sebagai ${DOCKERHUB_USER}/simcuti-*:${TAG}"
  docker compose build backend frontend

  local bimg="${COMPOSE_IMAGE_PREFIX}_backend:latest"
  local fimg="${COMPOSE_IMAGE_PREFIX}_frontend:latest"

  docker tag "$bimg" "${DOCKERHUB_USER}/simcuti-backend:${TAG}"
  docker tag "$fimg" "${DOCKERHUB_USER}/simcuti-frontend:${TAG}"
  docker push "${DOCKERHUB_USER}/simcuti-backend:${TAG}"
  docker push "${DOCKERHUB_USER}/simcuti-frontend:${TAG}"
  echo "✅ Push selesai."
}

clean() {
  echo "⚠️  Ini akan menghapus container + volume database (data hilang)."
  read -r -p "Lanjutkan? [y/N] " confirm
  if [[ "${confirm}" != "y" ]]; then
    echo "Dibatalkan."
    exit 0
  fi
  docker compose down -v
  docker system prune -f
  echo "✅ Bersih."
}

help() {
  cat <<EOF
SIMCUTI — scripts/docker.sh

  run    — docker compose up -d
  build  — docker compose up --build -d
  push   — build, tag, push simcuti-backend & simcuti-frontend (butuh DOCKERHUB_USER)
  clean  — docker compose down -v + prune (konfirmasi)

Opsional: TAG=v1 DOCKERHUB_USER=u ./scripts/docker.sh push
Opsional: COMPOSE_IMAGE_PREFIX=prefix jika 'docker images' menunjukkan prefix lain.
EOF
}

case "${1:-help}" in
  run)   run ;;
  build) build ;;
  push)  push ;;
  clean) clean ;;
  help|-h|--help) help ;;
  *)
    echo "Perintah tidak dikenal: $1"
    help
    exit 1
    ;;
esac
