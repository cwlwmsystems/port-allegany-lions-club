#!/bin/bash
set -e

STAMP="$(date +%Y%m%d-%H%M%S)"
OUT="backups/$STAMP"

mkdir -p "$OUT"

echo
echo "Creating Lions CRM backup:"
echo "$OUT"
echo

echo "[1/3] Dumping Supabase database..."

npx supabase db dump \
  --linked \
  -f "$OUT/database.sql"

echo "[2/3] Saving migration history..."

cp -R supabase/migrations "$OUT/migrations"

echo "[3/3] Saving application version information..."

{
  echo "Backup created: $(date)"
  echo
  echo "Git commit:"
  git rev-parse HEAD 2>/dev/null || echo "No Git commit available"
  echo
  echo "Node:"
  node --version
  echo
  echo "NPM:"
  npm --version
  echo
  echo "Supabase CLI:"
  npx supabase --version
} > "$OUT/backup-info.txt"

gzip "$OUT/database.sql"

echo
echo "Backup complete:"
echo "$OUT/database.sql.gz"
echo
echo "IMPORTANT:"
echo "This backup may contain private CRM information."
echo "Do not commit the backups directory to Git."
