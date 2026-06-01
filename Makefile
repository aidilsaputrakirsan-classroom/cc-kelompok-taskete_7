# ============================================================
# SIMCUTI — Makefile
# Shortcut commands untuk Docker Compose
# cc-kelompok-taskete_7 | Institut Teknologi Kalimantan
#
# Usage: make <target>
# ============================================================

.PHONY: up run build dev down clean push push-hub restart logs logs-auth logs-cuti logs-frontend logs-db ps \
        shell-auth shell-cuti shell-db seed help

COMPOSE_DEV = docker compose -f docker-compose.yml -f docker-compose.dev.yml

# ===== Docker Hub (untuk: make push DOCKERHUB_USER=namauser) =====
DOCKERHUB_USER ?=
TAG ?= latest
# Modul 6 — tag terpisah: backend:v2 & frontend:v1
BACKEND_TAG ?= v2
FRONTEND_TAG ?= v1
# Prefix image lokal setelah docker compose build (biasanya <nama-folder-repo>_backend)
COMPOSE_IMAGE_PREFIX ?= cc-kelompok-taskete_7

# ===== COLORS =====
GREEN  = \033[0;32m
YELLOW = \033[0;33m
CYAN   = \033[0;36m
RESET  = \033[0m

# ===== TARGETS =====

## Tampilkan perintah yang tersedia
help:
	@echo ""
	@echo "$(CYAN)🏢 SIMCUTI — Docker Compose Commands$(RESET)"
	@echo "$(CYAN)=====================================...$(RESET)"
	@echo ""
	@echo "$(GREEN)  make up | make run$(RESET)   Start semua services (background); run = alias up"
	@echo "$(GREEN)  make build$(RESET)           Rebuild images + start"
	@echo "$(GREEN)  make dev$(RESET)             Start stack dengan hot-reload (dev override)"
	@echo "$(GREEN)  make push$(RESET)            Tag + push backend & frontend (TAG sama, default latest)"
	@echo "$(GREEN)  make push-hub$(RESET)         Push modul 6: simcuti-backend:$(BACKEND_TAG) & simcuti-frontend:$(FRONTEND_TAG)"
	@echo "$(GREEN)  make down$(RESET)            Stop & hapus containers"
	@echo "$(YELLOW)  make clean$(RESET)           Stop + hapus containers & volumes (⚠️ DATA HILANG!)"
	@echo "$(GREEN)  make restart$(RESET)         Restart semua services"
	@echo "$(GREEN)  make ps$(RESET)              Status semua services"
	@echo "$(GREEN)  make logs$(RESET)            Lihat logs semua services (follow)"
	@echo "$(GREEN)  make logs-auth$(RESET)       Lihat logs auth-service"
	@echo "$(GREEN)  make logs-cuti$(RESET)       Lihat logs cuti-service (item-service)"
	@echo "$(GREEN)  make logs-frontend$(RESET)   Lihat logs frontend saja"
	@echo "$(GREEN)  make logs-db$(RESET)         Lihat logs database (auth-db + cuti-db)"
	@echo "$(GREEN)  make shell-auth$(RESET)      Shell auth-service"
	@echo "$(GREEN)  make shell-cuti$(RESET)      Shell cuti-service"
	@echo "$(GREEN)  make shell-db$(RESET)        Masuk ke psql database"
	@echo "$(GREEN)  make seed$(RESET)            Jalankan database seeder"
	@echo ""

## Start semua services (background) — gateway menunggu auth & cuti healthy
up:
	@echo "$(GREEN)🚀 Starting SIMCUTI microservices...$(RESET)"
	docker compose up -d --wait
	@echo ""
	@echo "$(GREEN)✅ Services started (health checks passed)!$(RESET)"
	@echo "$(CYAN)   🚪 Gateway   : http://localhost$(RESET)"
	@echo "$(CYAN)   🌐 Frontend  : http://localhost:3000$(RESET)"
	@echo "$(CYAN)   🔐 Auth API  : http://localhost:8001/health$(RESET)"
	@echo "$(CYAN)   📦 Cuti API  : http://localhost:8002/health$(RESET)"
	@echo "$(CYAN)   📊 Status    : make ps$(RESET)"

## Alias modul 5: make run = make up
run: up

## Rebuild images + start
build:
	@echo "$(YELLOW)🔨 Building & starting SIMCUTI microservices...$(RESET)"
	docker compose up --build -d --wait
	@echo ""
	@echo "$(GREEN)✅ Build complete! Services started.$(RESET)"
	@echo "$(CYAN)   🚪 Gateway  : http://localhost$(RESET)"
	@echo "$(CYAN)   🌐 Frontend : http://localhost:3000$(RESET)"

## Start stack development dengan hot-reload (uvicorn --reload + Vite HMR)
dev:
	@echo "$(YELLOW)🔧 Starting SIMCUTI in development mode (hot-reload)...$(RESET)"
	$(COMPOSE_DEV) up --build -d --wait
	@echo ""
	@echo "$(GREEN)✅ Dev stack started!$(RESET)"
	@echo "$(CYAN)   🚪 Gateway (API) : http://localhost$(RESET)"
	@echo "$(CYAN)   ⚡ Frontend HMR  : http://localhost:5173$(RESET)"
	@echo "$(CYAN)   🔐 Auth API       : http://localhost:8001/health$(RESET)"
	@echo "$(CYAN)   📦 Cuti API       : http://localhost:8002/health$(RESET)"

## Stop & hapus containers (volume tetap ada)
down:
	@echo "$(YELLOW)🛑 Stopping SIMCUTI services...$(RESET)"
	docker compose down
	@echo "$(GREEN)✅ Services stopped. Data tetap aman di volume!$(RESET)"

## Stop + hapus containers DAN volumes (⚠️ data hilang!)
clean:
	@echo "$(YELLOW)⚠️  WARNING: Ini akan menghapus SEMUA data database!$(RESET)"
	@read -p "Lanjutkan? [y/N] " confirm && [ "$$confirm" = "y" ] || exit 1
	docker compose down -v
	docker system prune -f
	@echo "$(GREEN)✅ Semua container, volume, dan cache dihapus.$(RESET)"

## Push image backend + frontend ke Docker Hub (login dulu: docker login)
## Contoh: make push DOCKERHUB_USER=namauser TAG=latest
## Jika error "No such image", cek nama image: docker images — lalu set COMPOSE_IMAGE_PREFIX=...
push:
	@if [ -z "$(DOCKERHUB_USER)" ]; then \
		echo "Set DOCKERHUB_USER, contoh: make push DOCKERHUB_USER=namauser"; \
		exit 1; \
	fi
	docker compose build backend frontend
	docker tag $(COMPOSE_IMAGE_PREFIX)_backend:latest $(DOCKERHUB_USER)/simcuti-backend:$(TAG)
	docker tag $(COMPOSE_IMAGE_PREFIX)_frontend:latest $(DOCKERHUB_USER)/simcuti-frontend:$(TAG)
	docker push $(DOCKERHUB_USER)/simcuti-backend:$(TAG)
	docker push $(DOCKERHUB_USER)/simcuti-frontend:$(TAG)
	@echo "$(GREEN)✅ Push: $(DOCKERHUB_USER)/simcuti-backend:$(TAG) & simcuti-frontend:$(TAG)$(RESET)"

## Push ke Docker Hub — tag terpisah (modul 6): backend v2, frontend v1
## Contoh: make push-hub DOCKERHUB_USER=namauser
## Opsional: BACKEND_TAG=v2 FRONTEND_TAG=v1 (default sudah v2 / v1)
push-hub:
	@if [ -z "$(DOCKERHUB_USER)" ]; then \
		echo "Set DOCKERHUB_USER, contoh: make push-hub DOCKERHUB_USER=namauser"; \
		exit 1; \
	fi
	docker compose build backend frontend
	docker tag $(COMPOSE_IMAGE_PREFIX)_backend:latest $(DOCKERHUB_USER)/simcuti-backend:$(BACKEND_TAG)
	docker tag $(COMPOSE_IMAGE_PREFIX)_frontend:latest $(DOCKERHUB_USER)/simcuti-frontend:$(FRONTEND_TAG)
	docker push $(DOCKERHUB_USER)/simcuti-backend:$(BACKEND_TAG)
	docker push $(DOCKERHUB_USER)/simcuti-frontend:$(FRONTEND_TAG)
	@echo "$(GREEN)✅ Push: $(DOCKERHUB_USER)/simcuti-backend:$(BACKEND_TAG) & simcuti-frontend:$(FRONTEND_TAG)$(RESET)"

## Restart semua services
restart:
	@echo "$(YELLOW)🔄 Restarting all services...$(RESET)"
	docker compose restart
	@echo "$(GREEN)✅ Services restarted!$(RESET)"

## Status semua services
ps:
	@echo "$(CYAN)📊 SIMCUTI Services Status:$(RESET)"
	docker compose ps

## Lihat logs semua services (follow)
logs:
	docker compose logs -f

## Lihat logs auth-service
logs-auth:
	docker compose logs -f auth-service

## Lihat logs cuti-service (item-service)
logs-cuti:
	docker compose logs -f cuti-service

## Lihat logs frontend saja
logs-frontend:
	docker compose logs -f frontend

## Lihat logs database (auth-db + cuti-db)
logs-db:
	docker compose logs -f auth-db cuti-db

## Masuk ke shell auth-service
shell-auth:
	docker compose exec auth-service bash

## Masuk ke shell cuti-service
shell-cuti:
	docker compose exec cuti-service bash

## Masuk ke psql auth database
shell-db:
	docker compose exec auth-db psql -U postgres -d auth_db

## Jalankan seeder manual (jika ada di auth-service)
seed:
	@echo "$(GREEN)🌱 Running seeder (auth-service)...$(RESET)"
	docker compose exec auth-service python seed.py 2>/dev/null || echo "seed.py tidak ditemukan — lewati"
