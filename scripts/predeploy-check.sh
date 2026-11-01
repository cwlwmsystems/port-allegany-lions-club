#!/bin/bash
set -e

echo
echo "=============================================="
echo " LIONS CRM PRE-DEPLOYMENT CHECK"
echo "=============================================="

echo
echo "Step 1: Security audit"
./scripts/security-audit.sh

echo
echo "Step 2: Production build"
npm run build

echo
echo "Step 3: Migration status"
npx supabase migration list

echo
echo "=============================================="
echo " PRE-DEPLOYMENT CHECK PASSED"
echo "=============================================="
