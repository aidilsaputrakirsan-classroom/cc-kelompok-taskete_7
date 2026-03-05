#!/bin/bash
# ============================================
# Setup Script - Cloud App Backend
# ============================================
# Script ini untuk menyiapkan environment backend
# Jalankan: chmod +x setup.sh && ./setup.sh
# ============================================

set -e

echo "=========================================="
echo "  Cloud App Backend - Setup Script"
echo "=========================================="
echo ""

# 1. Cek Python terinstall
echo "[1/5] Mengecek Python..."
if command -v python3 &> /dev/null; then
    PYTHON_CMD=python3
    PIP_CMD=pip3
elif command -v python &> /dev/null; then
    PYTHON_CMD=python
    PIP_CMD=pip
else
    echo "❌ Python tidak ditemukan! Install Python terlebih dahulu."
    exit 1
fi
echo "✅ Python ditemukan: $($PYTHON_CMD --version)"

# 2. Buat virtual environment (jika belum ada)
echo ""
echo "[2/5] Menyiapkan virtual environment..."
if [ ! -d "venv" ]; then
    $PYTHON_CMD -m venv venv
    echo "✅ Virtual environment dibuat."
else
    echo "✅ Virtual environment sudah ada."
fi

# 3. Aktivasi virtual environment
echo ""
echo "[3/5] Mengaktifkan virtual environment..."
source venv/bin/activate
echo "✅ Virtual environment aktif."

# 4. Install dependencies
echo ""
echo "[4/5] Menginstall dependencies..."
$PIP_CMD install -r requirements.txt
echo "✅ Dependencies terinstall."

# 5. Setup .env file
echo ""
echo "[5/5] Mengecek file .env..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  File .env dibuat dari .env.example."
    echo "    PENTING: Edit file .env dan ganti 'yourpassword' dengan password PostgreSQL Anda!"
else
    echo "✅ File .env sudah ada."
fi

echo ""
echo "=========================================="
echo "  ✅ Setup selesai!"
echo "=========================================="
echo ""
echo "Langkah selanjutnya:"
echo "  1. Pastikan PostgreSQL berjalan"
echo "  2. Buat database: CREATE DATABASE cloudapp;"
echo "  3. Edit file .env (sesuaikan password PostgreSQL)"
echo "  4. Jalankan server: uvicorn main:app --reload --port 8000"
echo "  5. Buka Swagger UI: http://localhost:8000/docs"
echo ""
