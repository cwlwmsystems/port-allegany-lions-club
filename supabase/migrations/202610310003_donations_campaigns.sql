-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- CAMPAIGNS + DONATIONS
-- ============================================================

create table if not exists public.campaigns (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    campaign_type text not null default 'General Fund',

    description text,

    start_date date,
    end_date date,

    goal_amount numeric(12,2),

    status text not null default 'active',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint campaigns_status_check
        check (status in ('active', 'completed', 'inactive')),

    constraint campaigns_goal_check
        check (goal_amount is null or goal_amount >= 0)
);


create table if not exists public.donations (
    id uuid primary key default gen_random_uuid(),

    contact_id uuid
        references public.contacts(id)
        on delete set null,

    organization_id uuid
        references public.organizations(id)
        on delete set null,

    campaign_id uuid
        references public.campaigns(id)
        on delete set null,

    donation_date date not null,

    amount numeric(12,2) not null default 0,

    donation_type text not null default 'Monetary',

    payment_method text,

    receipt_number text,
    receipt_sent boolean not null default false,

    anonymous boolean not null default false,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint donations_amount_check
        check (amount >= 0)
);


create index if not exists idx_campaigns_status
    on public.campaigns(status);

create index if not exists idx_donations_contact
    on public.donations(contact_id);

create index if not exists idx_donations_organization
    on public.donations(organization_id);

create index if not exists idx_donations_campaign
    on public.donations(campaign_id);

create index if not exists idx_donations_date
    on public.donations(donation_date);


drop trigger if exists set_campaigns_updated_at
on public.campaigns;

create trigger set_campaigns_updated_at
before update on public.campaigns
for each row
execute function public.set_updated_at();


drop trigger if exists set_donations_updated_at
on public.donations;

create trigger set_donations_updated_at
before update on public.donations
for each row
execute function public.set_updated_at();


alter table public.campaigns enable row level security;
alter table public.donations enable row level security;


drop policy if exists "Authenticated users can manage campaigns"
on public.campaigns;

create policy "Authenticated users can manage campaigns"
on public.campaigns
for all
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can manage donations"
on public.donations;

create policy "Authenticated users can manage donations"
on public.donations
for all
to authenticated
using (true)
with check (true);


insert into public.campaigns (
    name,
    campaign_type,
    description,
    status
)
values
    (
        'General Fund',
        'General Fund',
        'General unrestricted Lions Club funds.',
        'active'
    ),
    (
        'Community Projects',
        'Community Projects',
        'Funds supporting local community service projects.',
        'active'
    )
on conflict do nothing;
