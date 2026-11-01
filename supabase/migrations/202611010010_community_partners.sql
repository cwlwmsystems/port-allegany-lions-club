-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- COMMUNITY PARTNER WORKFLOW
-- ============================================================

alter table public.organizations
add column if not exists community_partner_status text
    not null
    default 'not_prospect'
    check (
        community_partner_status in (
            'not_prospect',
            'prospect',
            'contacted',
            'interested',
            'follow_up_later',
            'active',
            'inactive',
            'not_interested'
        )
    );

alter table public.organizations
add column if not exists community_partner_support_types text[]
    not null
    default '{}';

alter table public.organizations
add column if not exists community_partner_since date;

alter table public.organizations
add column if not exists community_partner_end_date date;

alter table public.organizations
add column if not exists community_partner_public boolean
    not null
    default false;

alter table public.organizations
add column if not exists community_partner_public_description text;

alter table public.organizations
add column if not exists community_partner_logo_url text;

alter table public.organizations
add column if not exists facebook_url text;

alter table public.organizations
add column if not exists community_partner_last_contacted date;

alter table public.organizations
add column if not exists community_partner_next_follow_up date;

alter table public.organizations
add column if not exists community_partner_notes text;


-- ============================================================
-- INDEXES
-- ============================================================

create index if not exists idx_organizations_community_partner_status
on public.organizations(community_partner_status);

create index if not exists idx_organizations_community_partner_public
on public.organizations(community_partner_public);

create index if not exists idx_organizations_community_partner_followup
on public.organizations(community_partner_next_follow_up);


-- ============================================================
-- DATA QUALITY
-- ============================================================

alter table public.organizations
drop constraint if exists community_partner_active_requires_date;

alter table public.organizations
add constraint community_partner_active_requires_date
check (
    community_partner_status <> 'active'
    or community_partner_since is not null
);


alter table public.organizations
drop constraint if exists community_partner_public_requires_active;

alter table public.organizations
add constraint community_partner_public_requires_active
check (
    community_partner_public = false
    or community_partner_status = 'active'
);
