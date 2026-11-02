-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- PUBLIC COMMUNITY PARTNER INQUIRIES
-- ============================================================

create table if not exists public.community_partner_inquiries (
    id uuid primary key default gen_random_uuid(),

    business_name text not null,

    first_name text not null,
    last_name text not null,

    email text not null,
    phone text,

    website text,

    support_interests text[]
        not null
        default '{}',

    message text,

    status text
        not null
        default 'new'
        check (
            status in (
                'new',
                'reviewing',
                'converted',
                'declined'
            )
        ),

    source text
        not null
        default 'community_partner_form',

    created_at timestamptz
        not null
        default now(),

    reviewed_at timestamptz,

    reviewed_by uuid
        references auth.users(id)
        on delete set null
);


create index if not exists idx_partner_inquiries_status
on public.community_partner_inquiries(status);

create index if not exists idx_partner_inquiries_created_at
on public.community_partner_inquiries(created_at desc);


alter table public.community_partner_inquiries
enable row level security;


-- Public visitors may submit only.
create policy "Public can submit partner inquiries"
on public.community_partner_inquiries
for insert
to anon
with check (
    status = 'new'
    and source = 'community_partner_form'
);


-- Authorized CRM users may read inquiries.
create policy "Authorized roles can view partner inquiries"
on public.community_partner_inquiries
for select
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer'
        ]
    )
);


create policy "Authorized roles can update partner inquiries"
on public.community_partner_inquiries
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


create policy "Admins can delete partner inquiries"
on public.community_partner_inquiries
for delete
to authenticated
using (
    public.crm_role_in(
        array['admin']
    )
);


drop trigger if exists audit_community_partner_inquiries
on public.community_partner_inquiries;

create trigger audit_community_partner_inquiries
after insert or update or delete
on public.community_partner_inquiries
for each row
execute function public.write_crm_audit_log();
