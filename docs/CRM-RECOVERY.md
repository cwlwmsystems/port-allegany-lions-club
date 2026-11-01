# Port Allegany Lions CRM Recovery Guide

## Purpose

This document describes how to recover the CRM if a migration, deployment, database change, or application update causes a serious problem.

---

## Before Major Changes

Before any major schema or application change:

1. Run:

   ./scripts/security-audit.sh

2. Create a database backup:

   ./scripts/backup-crm.sh

3. Run:

   npm run build

4. Confirm the current CRM works.

5. Commit the working application state to Git.

---

## What Is Backed Up

A local backup contains:

- Supabase database dump
- Supabase migration files
- Git commit reference
- Node version
- NPM version
- Supabase CLI version

The backup may contain private club/member information.

Never commit the backups directory to Git.

---

## Application Recovery

If a code change breaks the CRM but the database is healthy:

1. Identify the last known-good Git commit.
2. Restore or revert the application code.
3. Run:

   npm install

4. Run:

   npm run build

5. Start the application and verify CRM functionality.

Do not restore the database unless data or schema was damaged.

---

## Database Recovery

Only restore a database backup when:

- records were accidentally deleted
- a migration corrupted data
- schema changes cannot safely be reversed
- the database must be reconstructed

Do not restore a database simply because the website UI is broken.

Application problems and database problems should be treated separately.

---

## Recovery Validation

After any recovery, verify:

### Authentication
- Admin login
- Treasurer login
- Logout
- Access denied routing

### Contacts
- Contact list
- Contact record
- Notes
- Search/filtering

### Membership
- Member list
- Member record
- Dues status

### Events
- Event list
- Participant records
- Volunteer hours

### Finance
- Donations
- Campaigns
- Campaign totals

### Tasks
- Open tasks
- Overdue tasks
- Task completion

### Data Tools
- Contact export
- Member export
- Donation export

### Security
- Treasurer cannot create events
- Treasurer cannot modify contacts
- Viewer remains read-only
- Admin retains full access

---

## Important Rule

Never perform destructive database recovery without first making another copy of the current database state.
