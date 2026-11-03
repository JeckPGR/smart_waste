#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load local .env if exists
if [ -f "$DIR/.env" ]; then
    export $(grep -v '^#' "$DIR/.env" | xargs)
fi

TARGET_FILE="$1"

echo "==================================================="
echo "[Smart Waste] Restore Database PostgreSQL Mandiri"
echo "==================================================="

if [ -z "$TARGET_FILE" ]; then
    echo "Daftar file backup yang tersedia:"
    ls -lt "$DIR/backups"/*.sql 2>/dev/null || true
    echo "---------------------------------------------------"
    read -p "Masukkan path atau nama file backup: " INPUT_NAME
    if [[ "$INPUT_NAME" = /* ]]; then
        TARGET_FILE="$INPUT_NAME"
    else
        TARGET_FILE="$DIR/backups/$INPUT_NAME"
    fi
fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "[ERROR] File backup tidak ditemukan: $TARGET_FILE"
    exit 1
fi

read -p "Lanjutkan proses restore ke database 'smartwaste'? (y/n): " CONFIRM
if [[ "$CONFIRM" =~ ^[Yy]$ ]]; then
    if docker ps --format "{{.Names}}" 2>/dev/null | grep -q "smartwaste-db"; then
        echo "[INFO] Menjalankan restore ke kontainer Docker 'smartwaste-db'..."
        cat "$TARGET_FILE" | docker exec -i smartwaste-db psql -U postgres -d smartwaste
    else
        echo "[INFO] Menjalankan restore ke PostgreSQL lokal..."
        PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD:-postgres}}" psql -h localhost -p 5432 -U postgres -d smartwaste -f "$TARGET_FILE"
    fi
    echo "[SELESAI] Database berhasil di-restore."
else
    echo "[DIBATALKAN] Proses restore dibatalkan."
fi
