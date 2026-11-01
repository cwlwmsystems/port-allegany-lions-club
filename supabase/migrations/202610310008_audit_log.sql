-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- APPEND-ONLY AUDIT LOG
-- ============================================================

create table if not exists public.crm_audit_log (
    id uuid primary key default gen_random_uuid(),

    table_name text not null,
    record_id uuid,

    action text not null
        check (action in ('INSERT', 'UPDATE', 'DELETE')),

    actor_user_id uuid,
    actor_email text,
    actor_role text,

    old_values jsonb,
    new_values jsonb,

    created_at timestamptz not null default now()
);


create index if not exists idx_crm_audit_log_created_at
    on public.crm_audit_log(created_at desc);

create index if not exists idx_crm_audit_log_table_name
    on public.crm_audit_log(table_name);

create index if not exists idx_crm_audit_log_record_id
    on public.crm_audit_log(record_id);

create index if not exists idx_crm_audit_log_actor
    on public.crm_audit_log(actor_user_id);


alter table public.crm_audit_log
enable row level security;


-- Only admins may view audit history.
create policy "Admins can view audit log"
on public.crm_audit_log
for select
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- There are intentionally NO insert/update/delete policies.
-- Application users cannot manipulate audit history directly.


create or replace function public.write_crm_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public, auth
as $$
declare
    v_user_id uuid;
    v_email text;
    v_role text;
    v_record_id uuid;
    v_old jsonb;
    v_new jsonb;
begin

    v_user_id := auth.uid();

    if v_user_id is not null then

        select email
        into v_email
        from auth.users
        where id = v_user_id;

        v_role := public.current_crm_role();

    end if;


    if tg_op = 'INSERT' then

        v_record_id := new.id;
        v_old := null;
        v_new := to_jsonb(new);

    elsif tg_op = 'UPDATE' then

        v_record_id := new.id;
        v_old := to_jsonb(old);
        v_new := to_jsonb(new);

    elsif tg_op = 'DELETE' then

        v_record_id := old.id;
        v_old := to_jsonb(old);
        v_new := null;

    end if;


    insert into public.crm_audit_log (
        table_name,
        record_id,
        action,
        actor_user_id,
        actor_email,
        actor_role,
        old_values,
        new_values
    )
    values (
        tg_table_name,
        v_record_id,
        tg_op,
        v_user_id,
        v_email,
        v_role,
        v_old,
        v_new
    );


    if tg_op = 'DELETE' then
        return old;
    end if;

    return new;
end;
$$;


-- ============================================================
-- AUDITED TABLES
-- ============================================================

drop trigger if exists audit_contacts
on public.contacts;

create trigger audit_contacts
after insert or update or delete
on public.contacts
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_organizations
on public.organizations;

create trigger audit_organizations
after insert or update or delete
on public.organizations
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_memberships
on public.memberships;

create trigger audit_memberships
after insert or update or delete
on public.memberships
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_events
on public.events;

create trigger audit_events
after insert or update or delete
on public.events
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_event_participants
on public.event_participants;

create trigger audit_event_participants
after insert or update or delete
on public.event_participants
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_donations
on public.donations;

create trigger audit_donations
after insert or update or delete
on public.donations
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_campaigns
on public.campaigns;

create trigger audit_campaigns
after insert or update or delete
on public.campaigns
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_tasks
on public.tasks;

create trigger audit_tasks
after insert or update or delete
on public.tasks
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_crm_user_profiles
on public.crm_user_profiles;

create trigger audit_crm_user_profiles
after update
on public.crm_user_profiles
for each row
execute function public.write_crm_audit_log();

