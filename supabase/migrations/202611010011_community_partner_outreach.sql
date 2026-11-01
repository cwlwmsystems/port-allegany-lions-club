-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- COMMUNITY PARTNER OUTREACH HISTORY
-- ============================================================

create table if not exists public.community_partner_outreach (
    id uuid primary key default gen_random_uuid(),

    organization_id uuid not null
        references public.organizations(id)
        on delete cascade,

    contact_id uuid
        references public.contacts(id)
        on delete set null,

    outreach_type text not null
        check (
            outreach_type in (
                'facebook',
                'email',
                'phone',
                'in_person',
                'meeting',
                'letter',
                'other'
            )
        ),

    outcome text
        check (
            outcome is null
            or outcome in (
                'no_response',
                'responded',
                'interested',
                'follow_up',
                'meeting_scheduled',
                'not_interested',
                'donated',
                'volunteered',
                'joined'
            )
        ),

    notes text,

    contacted_at timestamptz not null default now(),

    next_follow_up date,

    created_by uuid
        references auth.users(id)
        on delete set null,

    created_at timestamptz not null default now()
);


create index if not exists idx_partner_outreach_organization
on public.community_partner_outreach(organization_id);

create index if not exists idx_partner_outreach_contact
on public.community_partner_outreach(contact_id);

create index if not exists idx_partner_outreach_contacted_at
on public.community_partner_outreach(contacted_at desc);

create index if not exists idx_partner_outreach_follow_up
on public.community_partner_outreach(next_follow_up);


alter table public.community_partner_outreach
enable row level security;


create policy "Authorized roles can view partner outreach"
on public.community_partner_outreach
for select
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair',
            'treasurer'
        ]
    )
);


create policy "Authorized roles can create partner outreach"
on public.community_partner_outreach
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer'
        ]
    )
);


create policy "Authorized roles can update partner outreach"
on public.community_partner_outreach
for update
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer'
        ]
    )
);


create policy "Admins can delete partner outreach"
on public.community_partner_outreach
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


drop trigger if exists audit_community_partner_outreach
on public.community_partner_outreach;

create trigger audit_community_partner_outreach
after insert or update or delete
on public.community_partner_outreach
for each row
execute function public.write_crm_audit_log();
