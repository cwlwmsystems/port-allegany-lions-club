-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- TASKS / FOLLOW-UPS
-- ============================================================

create table if not exists public.tasks (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    description text,

    contact_id uuid
        references public.contacts(id)
        on delete cascade,

    organization_id uuid
        references public.organizations(id)
        on delete cascade,

    assigned_user_id uuid
        references auth.users(id)
        on delete set null,

    due_date date,

    priority text not null default 'normal',

    status text not null default 'open',

    completed_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint tasks_priority_check
        check (
            priority in (
                'low',
                'normal',
                'high',
                'urgent'
            )
        ),

    constraint tasks_status_check
        check (
            status in (
                'open',
                'in_progress',
                'completed',
                'cancelled'
            )
        ),

    constraint tasks_relationship_check
        check (
            contact_id is not null
            or organization_id is not null
        )
);


create index if not exists idx_tasks_contact
    on public.tasks(contact_id);

create index if not exists idx_tasks_organization
    on public.tasks(organization_id);

create index if not exists idx_tasks_assigned_user
    on public.tasks(assigned_user_id);

create index if not exists idx_tasks_due_date
    on public.tasks(due_date);

create index if not exists idx_tasks_status
    on public.tasks(status);


drop trigger if exists set_tasks_updated_at
on public.tasks;

create trigger set_tasks_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();


alter table public.tasks enable row level security;


drop policy if exists "Authenticated users can manage tasks"
on public.tasks;

create policy "Authenticated users can manage tasks"
on public.tasks
for all
to authenticated
using (true)
with check (true);
