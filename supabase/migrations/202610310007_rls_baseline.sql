-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- RLS BASELINE
--
-- Explicitly establishes RLS across every CRM table so the
-- migration history itself documents the expected security state.
-- ============================================================

alter table public.contacts
enable row level security;

alter table public.organizations
enable row level security;

alter table public.tags
enable row level security;

alter table public.contact_tags
enable row level security;

alter table public.contact_organizations
enable row level security;

alter table public.contact_notes
enable row level security;

alter table public.memberships
enable row level security;

alter table public.events
enable row level security;

alter table public.event_participants
enable row level security;

alter table public.campaigns
enable row level security;

alter table public.donations
enable row level security;

alter table public.tasks
enable row level security;

alter table public.crm_user_profiles
enable row level security;
