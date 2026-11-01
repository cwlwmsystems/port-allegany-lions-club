-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- EVENTS + VOLUNTEER PARTICIPATION
-- ============================================================

create table if not exists public.events (
    id uuid primary key default gen_random_uuid(),

    name text not null,
    event_type text not null default 'Service Project',

    event_date date not null,
    start_time time,
    end_time time,

    location text,
    description text,

    status text not null default 'planned',

    volunteer_goal integer,
    coordinator_contact_id uuid
        references public.contacts(id)
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint events_status_check
        check (
            status in (
                'planned',
                'completed',
                'cancelled'
            )
        )
);


create table if not exists public.event_participants (
    id uuid primary key default gen_random_uuid(),

    event_id uuid not null
        references public.events(id)
        on delete cascade,

    contact_id uuid not null
        references public.contacts(id)
        on delete cascade,

    participant_role text not null default 'Volunteer',

    attendance_status text not null default 'registered',

    volunteer_hours numeric(6,2) not null default 0,

    notes text,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint event_participants_unique
        unique (event_id, contact_id),

    constraint event_participants_attendance_check
        check (
            attendance_status in (
                'registered',
                'attended',
                'cancelled',
                'no_show'
            )
        ),

    constraint event_participants_hours_check
        check (volunteer_hours >= 0)
);


create index if not exists idx_events_date
    on public.events(event_date);

create index if not exists idx_events_status
    on public.events(status);

create index if not exists idx_events_type
    on public.events(event_type);

create index if not exists idx_event_participants_event
    on public.event_participants(event_id);

create index if not exists idx_event_participants_contact
    on public.event_participants(contact_id);


drop trigger if exists set_events_updated_at
on public.events;

create trigger set_events_updated_at
before update on public.events
for each row
execute function public.set_updated_at();


drop trigger if exists set_event_participants_updated_at
on public.event_participants;

create trigger set_event_participants_updated_at
before update on public.event_participants
for each row
execute function public.set_updated_at();


alter table public.events enable row level security;
alter table public.event_participants enable row level security;


drop policy if exists "Authenticated users can view events"
on public.events;

create policy "Authenticated users can view events"
on public.events
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create events"
on public.events;

create policy "Authenticated users can create events"
on public.events
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can update events"
on public.events;

create policy "Authenticated users can update events"
on public.events
for update
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can delete events"
on public.events;

create policy "Authenticated users can delete events"
on public.events
for delete
to authenticated
using (true);


drop policy if exists "Authenticated users can view event participants"
on public.event_participants;

create policy "Authenticated users can view event participants"
on public.event_participants
for select
to authenticated
using (true);


drop policy if exists "Authenticated users can create event participants"
on public.event_participants;

create policy "Authenticated users can create event participants"
on public.event_participants
for insert
to authenticated
with check (true);


drop policy if exists "Authenticated users can update event participants"
on public.event_participants;

create policy "Authenticated users can update event participants"
on public.event_participants
for update
to authenticated
using (true)
with check (true);


drop policy if exists "Authenticated users can delete event participants"
on public.event_participants;

create policy "Authenticated users can delete event participants"
on public.event_participants
for delete
to authenticated
using (true);
