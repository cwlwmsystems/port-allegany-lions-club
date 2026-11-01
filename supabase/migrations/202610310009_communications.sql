-- ============================================================
-- PORT ALLEGANY LIONS CRM
-- COMMUNICATIONS MODULE
-- ============================================================

create table if not exists public.communication_templates (
    id uuid primary key default gen_random_uuid(),

    name text not null,

    template_type text not null
        check (template_type in ('letter', 'email')),

    subject text,

    body text not null,

    description text,

    is_active boolean not null default true,

    created_by uuid references auth.users(id)
        on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create table if not exists public.communications (
    id uuid primary key default gen_random_uuid(),

    communication_type text not null
        check (communication_type in ('letter', 'email')),

    contact_id uuid references public.contacts(id)
        on delete set null,

    organization_id uuid references public.organizations(id)
        on delete set null,

    template_id uuid references public.communication_templates(id)
        on delete set null,

    recipient_name text,
    recipient_email text,

    subject text,

    body text not null,

    status text not null default 'draft'
        check (
            status in (
                'draft',
                'generated',
                'sent',
                'failed'
            )
        ),

    resend_message_id text,

    error_message text,

    created_by uuid references auth.users(id)
        on delete set null,

    sent_at timestamptz,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);


create index if not exists idx_communication_templates_type
    on public.communication_templates(template_type);

create index if not exists idx_communication_templates_active
    on public.communication_templates(is_active);

create index if not exists idx_communications_contact
    on public.communications(contact_id);

create index if not exists idx_communications_organization
    on public.communications(organization_id);

create index if not exists idx_communications_template
    on public.communications(template_id);

create index if not exists idx_communications_status
    on public.communications(status);

create index if not exists idx_communications_created_at
    on public.communications(created_at desc);


-- ============================================================
-- UPDATED AT TRIGGERS
-- ============================================================

drop trigger if exists set_communication_templates_updated_at
on public.communication_templates;

create trigger set_communication_templates_updated_at
before update on public.communication_templates
for each row
execute function public.set_updated_at();


drop trigger if exists set_communications_updated_at
on public.communications;

create trigger set_communications_updated_at
before update on public.communications
for each row
execute function public.set_updated_at();


-- ============================================================
-- RLS
-- ============================================================

alter table public.communication_templates
enable row level security;

alter table public.communications
enable row level security;


-- Admin, Officer, Membership Chair, and Treasurer may view
-- communications and templates.

create policy "Authorized roles can view communication templates"
on public.communication_templates
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


create policy "Authorized roles can create communication templates"
on public.communication_templates
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair',
            'treasurer'
        ]
    )
);


create policy "Authorized roles can update communication templates"
on public.communication_templates
for update
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
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair',
            'treasurer'
        ]
    )
);


create policy "Admins can delete communication templates"
on public.communication_templates
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


create policy "Authorized roles can view communications"
on public.communications
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


create policy "Authorized roles can create communications"
on public.communications
for insert
to authenticated
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair',
            'treasurer'
        ]
    )
);


create policy "Authorized roles can update communications"
on public.communications
for update
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
)
with check (
    public.crm_role_in(
        array[
            'admin',
            'officer',
            'membership_chair',
            'treasurer'
        ]
    )
);


create policy "Admins can delete communications"
on public.communications
for delete
to authenticated
using (
    public.crm_role_in(array['admin'])
);


-- ============================================================
-- AUDIT LOG
-- ============================================================

drop trigger if exists audit_communication_templates
on public.communication_templates;

create trigger audit_communication_templates
after insert or update or delete
on public.communication_templates
for each row
execute function public.write_crm_audit_log();


drop trigger if exists audit_communications
on public.communications;

create trigger audit_communications
after insert or update or delete
on public.communications
for each row
execute function public.write_crm_audit_log();


-- ============================================================
-- STARTER TEMPLATES
-- ============================================================

insert into public.communication_templates (
    name,
    template_type,
    subject,
    body,
    description
)
values
(
    'General Club Letter',
    'letter',
    null,
    'Dear {{contact.first_name}},

Thank you for your connection with the Port Allegany Lions Club.

{{custom.message}}

Sincerely,

Port Allegany Lions Club',
    'General-purpose Lions Club letter template.'
),
(
    'General Club Email',
    'email',
    'A message from the Port Allegany Lions Club',
    'Hello {{contact.first_name}},

{{custom.message}}

Thank you,

Port Allegany Lions Club',
    'General-purpose Lions Club email template.'
);
