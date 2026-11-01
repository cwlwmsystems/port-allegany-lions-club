-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- USER ROLES + DATABASE-LEVEL PERMISSIONS
-- ============================================================

create table if not exists public.crm_user_profiles (
    user_id uuid primary key
        references auth.users(id)
        on delete cascade,

    email text,

    full_name text,

    role text not null default 'viewer',

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint crm_user_profiles_role_check
        check (
            role in (
                'admin',
                'officer',
                'treasurer',
                'membership_chair',
                'volunteer_coordinator',
                'viewer'
            )
        )
);


drop trigger if exists set_crm_user_profiles_updated_at
on public.crm_user_profiles;

create trigger set_crm_user_profiles_updated_at
before update on public.crm_user_profiles
for each row
execute function public.set_updated_at();


-- Existing CRM users become admins so current access is preserved.
insert into public.crm_user_profiles (
    user_id,
    email,
    role
)
select
    id,
    email,
    'admin'
from auth.users
on conflict (user_id) do nothing;


-- Future users default to viewer.
create or replace function public.create_crm_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.crm_user_profiles (
        user_id,
        email,
        role
    )
    values (
        new.id,
        new.email,
        'viewer'
    )
    on conflict (user_id) do nothing;

    return new;
end;
$$;


drop trigger if exists create_crm_user_profile_trigger
on auth.users;

create trigger create_crm_user_profile_trigger
after insert on auth.users
for each row
execute function public.create_crm_user_profile();


create or replace function public.current_crm_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
    select coalesce(
        (
            select role
            from public.crm_user_profiles
            where user_id = auth.uid()
        ),
        'viewer'
    );
$$;


create or replace function public.crm_role_in(
    allowed_roles text[]
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select public.current_crm_role()
        = any(allowed_roles);
$$;


alter table public.crm_user_profiles
enable row level security;


-- ============================================================
-- REMOVE EXISTING POLICIES ON CRM TABLES
-- We replace them with role-aware policies.
-- ============================================================

do $$
declare
    table_name text;
    policy_record record;
begin
    foreach table_name in array array[
        'crm_user_profiles',
        'contacts',
        'organizations',
        'tags',
        'contact_tags',
        'contact_organizations',
        'contact_notes',
        'memberships',
        'events',
        'event_participants',
        'campaigns',
        'donations',
        'tasks'
    ]
    loop

        for policy_record in
            select policyname
            from pg_policies
            where schemaname = 'public'
              and tablename = table_name
        loop

            execute format(
                'drop policy if exists %I on public.%I',
                policy_record.policyname,
                table_name
            );

        end loop;

    end loop;
end $$;


-- ============================================================
-- USER PROFILES
-- ============================================================

create policy "Users can view their own CRM profile"
on public.crm_user_profiles
for select
to authenticated
using (
    user_id = auth.uid()
    or public.crm_role_in(array['admin'])
);


create policy "Admins can update CRM profiles"
on public.crm_user_profiles
for update
to authenticated
using (
    public.crm_role_in(array['admin'])
)
with check (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- CONTACTS / ORGANIZATIONS
-- All authenticated CRM users can view.
-- Admin + Officer can manage.
-- ============================================================

create policy "CRM users can view contacts"
on public.contacts
for select
to authenticated
using (true);

create policy "Contact managers can insert contacts"
on public.contacts
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
);

create policy "Contact managers can update contacts"
on public.contacts
for update
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
);

create policy "Admins can delete contacts"
on public.contacts
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


create policy "CRM users can view organizations"
on public.organizations
for select
to authenticated
using (true);

create policy "Organization managers can insert"
on public.organizations
for insert
to authenticated
with check (
    public.crm_role_in(
        array['admin','officer']
    )
);

create policy "Organization managers can update"
on public.organizations
for update
to authenticated
using (
    public.crm_role_in(
        array['admin','officer']
    )
)
with check (
    public.crm_role_in(
        array['admin','officer']
    )
);

create policy "Admins can delete organizations"
on public.organizations
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- TAGS + RELATIONSHIPS + NOTES
-- ============================================================

create policy "CRM users can view tags"
on public.tags
for select
to authenticated
using (true);

create policy "Admins and officers manage tags"
on public.tags
for all
to authenticated
using (
    public.crm_role_in(
        array['admin','officer']
    )
)
with check (
    public.crm_role_in(
        array['admin','officer']
    )
);


create policy "CRM users view contact tags"
on public.contact_tags
for select
to authenticated
using (true);

create policy "Contact managers manage contact tags"
on public.contact_tags
for all
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
);


create policy "CRM users view organization links"
on public.contact_organizations
for select
to authenticated
using (true);

create policy "Organization managers manage links"
on public.contact_organizations
for all
to authenticated
using (
    public.crm_role_in(
        array['admin','officer']
    )
)
with check (
    public.crm_role_in(
        array['admin','officer']
    )
);


create policy "CRM users view notes"
on public.contact_notes
for select
to authenticated
using (true);

create policy "CRM users can create notes"
on public.contact_notes
for insert
to authenticated
with check (true);

create policy "Note managers can update notes"
on public.contact_notes
for update
to authenticated
using (
    created_by = auth.uid()
    or public.crm_role_in(
        array['admin','officer']
    )
)
with check (
    created_by = auth.uid()
    or public.crm_role_in(
        array['admin','officer']
    )
);

create policy "Admins can delete notes"
on public.contact_notes
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- MEMBERSHIPS
-- ============================================================

create policy "CRM users view memberships"
on public.memberships
for select
to authenticated
using (true);

create policy "Membership managers insert"
on public.memberships
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
);

create policy "Membership managers update"
on public.memberships
for update
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair'
        ]
    )
);

create policy "Admins delete memberships"
on public.memberships
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- EVENTS / VOLUNTEERS
-- ============================================================

create policy "CRM users view events"
on public.events
for select
to authenticated
using (true);

create policy "Event managers insert"
on public.events
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'volunteer_coordinator'
        ]
    )
);

create policy "Event managers update"
on public.events
for update
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'volunteer_coordinator'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'volunteer_coordinator'
        ]
    )
);

create policy "Admins delete events"
on public.events
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


create policy "CRM users view participants"
on public.event_participants
for select
to authenticated
using (true);

create policy "Event managers manage participants"
on public.event_participants
for all
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'volunteer_coordinator'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'volunteer_coordinator'
        ]
    )
);


-- ============================================================
-- FINANCE
-- ============================================================

create policy "CRM users view campaigns"
on public.campaigns
for select
to authenticated
using (true);

create policy "Finance managers manage campaigns"
on public.campaigns
for all
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'treasurer'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'treasurer'
        ]
    )
);


create policy "CRM users view donations"
on public.donations
for select
to authenticated
using (true);

create policy "Finance managers insert donations"
on public.donations
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'treasurer'
        ]
    )
);

create policy "Finance managers update donations"
on public.donations
for update
to authenticated
using (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'treasurer'
        ]
    )
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'treasurer'
        ]
    )
);

create policy "Admins delete donations"
on public.donations
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- TASKS
-- ============================================================

create policy "CRM users view tasks"
on public.tasks
for select
to authenticated
using (true);

create policy "CRM users create tasks"
on public.tasks
for insert
to authenticated
with check (true);

create policy "CRM users update tasks"
on public.tasks
for update
to authenticated
using (
    assigned_user_id = auth.uid()
    or public.crm_role_in(
        array['admin','officer']
    )
)
with check (
    assigned_user_id = auth.uid()
    or public.crm_role_in(
        array['admin','officer']
    )
);

create policy "Admins delete tasks"
on public.tasks
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);

