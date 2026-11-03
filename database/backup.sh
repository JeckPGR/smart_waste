#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Load local .env if exists
if [ -f "$DIR/.env" ]; then
    export $(grep -v '^#' "$DIR/.env" | xargs)
fi

BACKUPS_DIR="$DIR/backups"
mkdir -p "$BACKUPS_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUPS_DIR/smartwaste_backup_$TIMESTAMP.sql"

echo "==================================================="
echo "[Smart Waste] Backup Database PostgreSQL Mandiri"
echo "==================================================="

if docker ps --format "{{.Names}}" 2>/dev/null | grep -q "smartwaste-db"; then
    echo "[INFO] Menemukan kontainer Docker 'smartwaste-db' yang aktif..."
    docker exec -t smartwaste-db pg_dump -U postgres -d smartwaste --clean --if-exists > "$BACKUP_FILE"
else
    echo "[INFO] Menjalankan pg_dump pada PostgreSQL lokal (localhost:5432)..."
    PGPASSWORD="${PGPASSWORD:-${POSTGRES_PASSWORD:-postgres}}" pg_dump -h localhost -p 5432 -U postgres -d smartwaste --clean --if-exists -f "$BACKUP_FILE"
fi

if [ -s "$BACKUP_FILE" ]; then
    echo "[BERHASIL] File backup tersimpan di:"
    echo "$BACKUP_FILE ($(wc -c < "$BACKUP_FILE") bytes)"
else
    echo "[GAGAL] File backup kosong."
    rm -f "$BACKUP_FILE"
fi
echo "==================================================="
