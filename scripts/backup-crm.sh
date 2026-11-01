#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/$STAMP"

mkdir -p "$OUT"

echo
echo "=============================================="
echo " PORT ALLEGANY LIONS CRM BACKUP"
echo "=============================================="
echo
echo "Backup directory:"
echo "$OUT"
echo

if ! command -v pg_dump >/dev/null 2>&1; then
  echo "ERROR: pg_dump is not installed."
  echo
  echo "Install it with:"
  echo "sudo apt install postgresql-client"
  exit 1
fi

if [ -z "${SUPABASE_DB_URL:-}" ]; then
  echo "SUPABASE_DB_URL is not currently set."
  echo
  echo "Paste the Supabase Postgres connection string."
  echo "It will only be held in this shell process."
  echo
  read -rsp "Database URL: " SUPABASE_DB_URL
  export SUPABASE_DB_URL
  echo
fi

echo "[1/4] Dumping database..."

pg_dump \
  "$SUPABASE_DB_URL" \
  --no-owner \
  --no-privileges \
  --format=custom \
  --file="$OUT/database.dump"

echo "PASS: Database dump created."


echo
echo "[2/4] Copying migrations..."

cp -R supabase/migrations "$OUT/migrations"

echo "PASS: Migration history copied."


echo
echo "[3/4] Recording application version..."

{
  echo "Backup created: $(date)"
  echo
  echo "Git commit:"
  git rev-parse HEAD 2>/dev/null || true
  echo
  echo "Git branch:"
  git branch --show-current 2>/dev/null || true
  echo
  echo "Node:"
  node --version
  echo
  echo "NPM:"
  npm --version
  echo
  echo "PostgreSQL client:"
  pg_dump --version
  echo
  echo "Supabase CLI:"
  npx supabase --version
} > "$OUT/backup-info.txt"

echo "PASS: Version information recorded."


echo
echo "[4/4] Verifying dump..."

if pg_restore --list "$OUT/database.dump" >/dev/null 2>&1; then
  echo "PASS: Backup archive is readable."
else
  echo "ERROR: Backup archive verification failed."
  exit 1
fi


echo
echo "=============================================="
echo " BACKUP COMPLETE"
echo "=============================================="
echo
echo "$OUT/database.dump"
echo "$OUT/backup-info.txt"
echo "$OUT/migrations"
echo
echo "IMPORTANT:"
echo "The backup may contain private member and donor information."
echo "Keep the backups directory private."
