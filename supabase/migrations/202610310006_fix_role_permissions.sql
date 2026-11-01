-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- STRICT ROLE PERMISSIONS
-- ============================================================

-- Remove every existing policy from CRM tables so an older
-- permissive policy cannot accidentally grant access.

do $$
declare
    t text;
    p record;
begin
    foreach t in array array[
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
        for p in
            select policyname
            from pg_policies
            where schemaname = 'public'
              and tablename = t
        loop
            execute format(
                'drop policy if exists %I on public.%I',
                p.policyname,
                t
            );
        end loop;
    end loop;
end $$;


-- ============================================================
-- CONTACTS
-- ============================================================

create policy "contacts_read"
on public.contacts
for select
to authenticated
using (true);

create policy "contacts_insert"
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

create policy "contacts_update"
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

create policy "contacts_delete"
on public.contacts
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- ORGANIZATIONS
-- ============================================================

create policy "organizations_read"
on public.organizations
for select
to authenticated
using (true);

create policy "organizations_insert"
on public.organizations
for insert
to authenticated
with check (
    public.crm_role_in(
        array['admin','officer']
    )
);

create policy "organizations_update"
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

create policy "organizations_delete"
on public.organizations
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- TAGS
-- ============================================================

create policy "tags_read"
on public.tags
for select
to authenticated
using (true);

create policy "tags_write"
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


-- ============================================================
-- CONTACT TAGS
-- ============================================================

create policy "contact_tags_read"
on public.contact_tags
for select
to authenticated
using (true);

create policy "contact_tags_write"
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


-- ============================================================
-- CONTACT ↔ ORGANIZATION
-- ============================================================

create policy "contact_org_read"
on public.contact_organizations
for select
to authenticated
using (true);

create policy "contact_org_write"
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


-- ============================================================
-- NOTES
-- ============================================================

create policy "notes_read"
on public.contact_notes
for select
to authenticated
using (true);

create policy "notes_insert"
on public.contact_notes
for insert
to authenticated
with check (true);

create policy "notes_update"
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

create policy "notes_delete"
on public.contact_notes
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- MEMBERSHIP
-- ============================================================

create policy "memberships_read"
on public.memberships
for select
to authenticated
using (true);

create policy "memberships_insert"
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

create policy "memberships_update"
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

create policy "memberships_delete"
on public.memberships
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- EVENTS
-- ============================================================

create policy "events_read"
on public.events
for select
to authenticated
using (true);

create policy "events_insert"
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

create policy "events_update"
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

create policy "events_delete"
on public.events
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- EVENT PARTICIPANTS / VOLUNTEER HOURS
-- ============================================================

create policy "participants_read"
on public.event_participants
for select
to authenticated
using (true);

create policy "participants_write"
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
-- CAMPAIGNS
-- ============================================================

create policy "campaigns_read"
on public.campaigns
for select
to authenticated
using (true);

create policy "campaigns_write"
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


-- ============================================================
-- DONATIONS
-- ============================================================

create policy "donations_read"
on public.donations
for select
to authenticated
using (true);

create policy "donations_insert"
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

create policy "donations_update"
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

create policy "donations_delete"
on public.donations
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- TASKS
-- ============================================================

create policy "tasks_read"
on public.tasks
for select
to authenticated
using (true);

create policy "tasks_insert"
on public.tasks
for insert
to authenticated
with check (true);

create policy "tasks_update"
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

create policy "tasks_delete"
on public.tasks
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);

