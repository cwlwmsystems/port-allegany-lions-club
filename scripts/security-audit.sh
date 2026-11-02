#!/bin/bash
set -e

echo
echo "=============================================="
echo " PORT ALLEGANY LIONS CRM - SECURITY AUDIT"
echo "=============================================="
echo

FAIL=0
WARN=0
TMP_SCHEMA="$(mktemp)"

cleanup() {
  rm -f "$TMP_SCHEMA"
}
trap cleanup EXIT


echo "[1] Checking whether environment files are tracked by Git..."

TRACKED_ENV="$(
  git ls-files |
    grep -E '(^|/)\.env($|\.)' ||
    true
)"

if [ -n "$TRACKED_ENV" ]; then
  echo "FAIL: Environment file(s) are tracked:"
  echo "$TRACKED_ENV"
  FAIL=$((FAIL + 1))
else
  echo "PASS: No environment files are tracked."
fi


echo
echo "[2] Checking .gitignore..."

if grep -Eq \
  '^\.env(\.\*)?$|^\.env\.\*\.local$|^\.env\.local$' \
  .gitignore 2>/dev/null
then
  echo "PASS: Environment files appear to be ignored."
else
  echo "WARN: Could not confirm .env.local protection in .gitignore."
  WARN=$((WARN + 1))
fi


echo
echo "[3] Checking for Supabase service-role references..."

SERVICE_ROLE_FILES="$(
  grep -RIl \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=.git \
    --exclude-dir=backups \
    --exclude='security-audit.sh' \
    -E 'SUPABASE_SERVICE_ROLE|service_role' \
    . 2>/dev/null ||
    true
)"

if [ -n "$SERVICE_ROLE_FILES" ]; then
  echo "WARN: Found service-role references in:"
  echo "$SERVICE_ROLE_FILES"
  echo "Review these files manually. Secret values are not displayed."
  WARN=$((WARN + 1))
else
  echo "PASS: No service-role references found in application files."
fi


echo
echo "[4] Checking client-side Supabase environment variable names..."

if [ -f ".env.local" ]; then

  echo "Environment variable names present:"

  sed -E \
    's/=.*$/=<hidden>/' \
    .env.local |
    grep -E \
      '^[A-Za-z_][A-Za-z0-9_]*=' ||
    true

  if grep -q \
    '^NEXT_PUBLIC_SUPABASE_URL=' \
    .env.local
  then
    echo "PASS: NEXT_PUBLIC_SUPABASE_URL exists."
  else
    echo "FAIL: NEXT_PUBLIC_SUPABASE_URL missing."
    FAIL=$((FAIL + 1))
  fi

  if grep -q \
    '^NEXT_PUBLIC_SUPABASE_ANON_KEY=' \
    .env.local
  then
    echo "PASS: NEXT_PUBLIC_SUPABASE_ANON_KEY exists."
  else
    echo "FAIL: NEXT_PUBLIC_SUPABASE_ANON_KEY missing."
    FAIL=$((FAIL + 1))
  fi

else

  echo "FAIL: .env.local not found."
  FAIL=$((FAIL + 1))

fi


echo
echo "[5] Checking for obvious hard-coded secrets..."

SECRET_FILES="$(
  grep -RIl \
    --exclude-dir=node_modules \
    --exclude-dir=.next \
    --exclude-dir=.git \
    --exclude-dir=backups \
    --exclude='.env.local' \
    --exclude='security-audit.sh' \
    -E \
    '(SUPABASE_SERVICE_ROLE_KEY|SUPABASE_DB_PASSWORD|JWT_SECRET)[[:space:]]*=' \
    . 2>/dev/null ||
    true
)"

if [ -n "$SECRET_FILES" ]; then
  echo "FAIL: Possible hard-coded secret references found:"
  echo "$SECRET_FILES"
  FAIL=$((FAIL + 1))
else
  echo "PASS: No obvious hard-coded database/service secrets found."
fi


echo
echo "[6] Inspecting deployed Supabase schema..."

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1
then
  if npx supabase db dump \
    --linked \
    -f "$TMP_SCHEMA" \
    >/dev/null 2>&1
  then
    echo "PASS: Remote schema retrieved."
  else
    echo "INFO: Remote schema dump unavailable."
    echo "Using migration history for RLS verification."
  fi
else
  echo "INFO: Docker is not available in this environment."
  echo "Using migration history for RLS verification."
fi


TABLES=(
  contacts
  organizations
  tags
  contact_tags
  contact_organizations
  contact_notes
  memberships
  events
  event_participants
  campaigns
  donations
  tasks
  crm_user_profiles
  crm_audit_log
  communication_templates
  communications
  community_partner_outreach
  community_partner_inquiries
)


echo
echo "[7] Checking RLS coverage..."

NORMALIZED_MIGRATIONS="$(
  cat supabase/migrations/*.sql 2>/dev/null \
  | tr '\n\t' '  ' \
  | sed -E 's/[[:space:]]+/ /g' \
  | tr '[:upper:]' '[:lower:]'
)"

for TABLE in "${TABLES[@]}"; do

  REMOTE_MATCH=0
  MIGRATION_MATCH=0

  if [ -s "$TMP_SCHEMA" ]; then

    NORMALIZED_REMOTE="$(
      cat "$TMP_SCHEMA" \
      | tr '\n\t' '  ' \
      | sed -E 's/[[:space:]]+/ /g' \
      | tr '[:upper:]' '[:lower:]'
    )"

    if printf '%s\n' "$NORMALIZED_REMOTE" \
      | grep -Fq \
        "alter table public.${TABLE} enable row level security"
    then
      REMOTE_MATCH=1
    fi

  fi


  if printf '%s\n' "$NORMALIZED_MIGRATIONS" \
    | grep -Fq \
      "alter table public.${TABLE} enable row level security"
  then
    MIGRATION_MATCH=1
  fi


  if [ "$REMOTE_MATCH" -eq 1 ]; then

    echo "PASS: RLS enabled remotely for ${TABLE}"

  elif [ "$MIGRATION_MATCH" -eq 1 ]; then

    echo "PASS: RLS declaration found for ${TABLE}"

  else

    echo "WARN: Could not verify RLS for ${TABLE}"
    WARN=$((WARN + 1))

  fi

done


echo "[8] Checking migration synchronization..."

MIGRATION_OUTPUT="$(
  npx supabase migration list --linked 2>&1
)"

LATEST_LOCAL="$(
  find supabase/migrations \
    -maxdepth 1 \
    -type f \
    -name '*.sql' \
    -printf '%f\n' \
  | sed -E 's/_.*$//' \
  | sort \
  | tail -n 1
)"

MATCH_COUNT="$(
  printf '%s\n' "$MIGRATION_OUTPUT" \
  | tr -d '`' \
  | grep -o "$LATEST_LOCAL" \
  | wc -l
)"

if [ "$MATCH_COUNT" -ge 2 ]; then
  echo "PASS: Latest migration ${LATEST_LOCAL} exists locally and remotely."
else
  echo "WARN: Could not verify latest migration synchronization."
  WARN=$((WARN + 1))
fi


echo "[9] Checking production build artifacts..."

if [ -d ".next" ]; then
  echo "PASS: .next production build exists."
else
  echo "WARN: No .next build found. Run npm run build."
  WARN=$((WARN + 1))
fi


echo
echo "=============================================="
echo " RESULTS"
echo "=============================================="
echo "Failures: $FAIL"
echo "Warnings: $WARN"
echo

if [ "$FAIL" -gt 0 ]; then
  echo "STATUS: ACTION REQUIRED"
  exit 1
fi

if [ "$WARN" -gt 0 ]; then
  echo "STATUS: PASSED WITH WARNINGS"
else
  echo "STATUS: PASSED"
fi
