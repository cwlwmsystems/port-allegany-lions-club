-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- MEMBERSHIP MODULE
-- ============================================================

create table if not exists public.memberships (
    id uuid primary key default gen_random_uuid(),

    contact_id uuid not null
        references public.contacts(id)
        on delete cascade,

    member_number text unique,

    membership_status text not null default 'active',

    membership_type text,

    join_date date,
    end_date date,
    end_reason text,

    officer_role text,
    committee text,

    dues_status text not null default 'current',
    last_dues_payment_date date,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint memberships_status_check
        check (
            membership_status in (
                'active',
                'inactive',
                'former',
                'deceased'
            )
        ),

    constraint memberships_dues_status_check
        check (
            dues_status in (
                'current',
                'due',
                'overdue',
                'waived',
                'not_applicable'
            )
        )
);


create index if not exists idx_memberships_contact
    on public.memberships(contact_id);

create index if not exists idx_memberships_status
    on public.memberships(membership_status);

create index if not exists idx_memberships_dues_status
    on public.memberships(dues_status);

create index if not exists idx_memberships_join_date
    on public.memberships(join_date);


drop trigger if exists set_memberships_updated_at
on public.memberships;

create trigger set_memberships_updated_at
before update on public.memberships
for each row
execute function public.set_updated_at();


alter table public.memberships enable row level security;


drop policy if exists "Authenticated users can view memberships"
on public.memberships;

create policy "Authenticated users can view memberships"
on public.memberships
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create memberships"
on public.memberships;

create policy "Authenticated users can create memberships"
on public.memberships
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can update memberships"
on public.memberships;

create policy "Authenticated users can update memberships"
on public.memberships
for update
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can delete memberships"
on public.memberships;

create policy "Authenticated users can delete memberships"
on public.memberships
for delete
to authenticated
using (true);
