# ============================================================
# SIMCUTI — Makefile
# Shortcut commands untuk Docker Compose
# cc-kelompok-taskete_7 | Institut Teknologi Kalimantan
#
# Usage: make <target>
# ============================================================

.PHONY: up run build down clean push push-hub restart logs logs-backend logs-frontend logs-db ps \
        shell-backend shell-db seed help

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
	@echo "$(GREEN)  make push$(RESET)            Tag + push backend & frontend (TAG sama, default latest)"
	@echo "$(GREEN)  make push-hub$(RESET)         Push modul 6: simcuti-backend:$(BACKEND_TAG) & simcuti-frontend:$(FRONTEND_TAG)"
	@echo "$(GREEN)  make down$(RESET)            Stop & hapus containers"
	@echo "$(YELLOW)  make clean$(RESET)           Stop + hapus containers & volumes (⚠️ DATA HILANG!)"
	@echo "$(GREEN)  make restart$(RESET)         Restart semua services"
	@echo "$(GREEN)  make ps$(RESET)              Status semua services"
	@echo "$(GREEN)  make logs$(RESET)            Lihat logs semua services (follow)"
	@echo "$(GREEN)  make logs-backend$(RESET)    Lihat logs backend saja"
	@echo "$(GREEN)  make logs-frontend$(RESET)   Lihat logs frontend saja"
	@echo "$(GREEN)  make logs-db$(RESET)         Lihat logs database saja"
	@echo "$(GREEN)  make shell-backend$(RESET)   Masuk ke shell container backend"
	@echo "$(GREEN)  make shell-db$(RESET)        Masuk ke psql database"
	@echo "$(GREEN)  make seed$(RESET)            Jalankan database seeder"
	@echo ""

## Start semua services (background) — sama dengan modul: make run
up:
	@echo "$(GREEN)🚀 Starting SIMCUTI services...$(RESET)"
	docker compose up -d
	@echo ""
	@echo "$(GREEN)✅ Services started!$(RESET)"
	@echo "$(CYAN)   🌐 Frontend : http://localhost:3000$(RESET)"
	@echo "$(CYAN)   🔧 Backend  : http://localhost:8000$(RESET)"
	@echo "$(CYAN)   📚 Swagger  : http://localhost:8000/docs$(RESET)"
	@echo "$(CYAN)   🗄️  Database : localhost:5433$(RESET)"

## Alias modul 5: make run = make up
run: up

## Rebuild images + start
build:
	@echo "$(YELLOW)🔨 Building & starting SIMCUTI...$(RESET)"
	docker compose up --build -d
	@echo ""
	@echo "$(GREEN)✅ Build complete! Services started.$(RESET)"
	@echo "$(CYAN)   🌐 Frontend : http://localhost:3000$(RESET)"
	@echo "$(CYAN)   🔧 Backend  : http://localhost:8000/docs$(RESET)"

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

## Lihat logs backend saja
logs-backend:
	docker compose logs -f backend

## Lihat logs frontend saja  
logs-frontend:
	docker compose logs -f frontend

## Lihat logs database saja
logs-db:
	docker compose logs -f db

## Masuk ke shell container backend
shell-backend:
	docker compose exec backend bash

## Masuk ke psql database
shell-db:
	docker compose exec db psql -U postgres -d simcuti

## Jalankan seeder manual
seed:
	@echo "$(GREEN)🌱 Running database seeder...$(RESET)"
	docker compose exec backend python seed.py
