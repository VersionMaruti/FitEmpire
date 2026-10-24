#!/bin/bash
# ============================================================
# FitEmpire — Automated Daily PostgreSQL Database Backup
# ============================================================

set -euo pipefail

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-fitempire}"
DB_USER="${DB_USER:-postgres}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/fitempire}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/${DB_NAME}_backup_${TIMESTAMP}.dump"
S3_BUCKET="${S3_BACKUP_BUCKET:-s3://fitempire-backups-prod/database}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

echo "[INFO] Starting PostgreSQL database backup for ${DB_NAME} at $(date)..."

# 1. Perform custom-format compressed pg_dump
PGPASSWORD="${DB_PASSWORD:-postgres}" pg_dump \
  -h "${DB_HOST}" \
  -p "${DB_PORT}" \
  -U "${DB_USER}" \
  -F c \
  -b \
  -v \
  -f "${BACKUP_FILE}" \
  "${DB_NAME}"

echo "[INFO] Database dump created successfully: ${BACKUP_FILE} ($(du -h "${BACKUP_FILE}" | cut -f1))"

# 2. Upload to S3 if aws CLI is installed and bucket configured
if command -v aws &> /dev/null && [ -n "${S3_BUCKET}" ]; then
  echo "[INFO] Uploading backup archive to ${S3_BUCKET}..."
  aws s3 cp "${BACKUP_FILE}" "${S3_BUCKET}/${DB_NAME}_backup_${TIMESTAMP}.dump" --sse AES256
  echo "[INFO] S3 upload completed successfully."
fi

# 3. Clean up local backups older than retention window
echo "[INFO] Pruning local backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -name "${DB_NAME}_backup_*.dump" -type f -mtime +"${RETENTION_DAYS}" -delete

echo "[INFO] PostgreSQL backup process finished successfully at $(date)."
