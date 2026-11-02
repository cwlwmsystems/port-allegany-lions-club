alter table public.community_partner_inquiries
add column if not exists website_screenshot_url text;

alter table public.community_partner_inquiries
add column if not exists website_screenshot_updated_at timestamptz;


insert into storage.buckets (
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
)
values (
    'partner-screenshots',
    'partner-screenshots',
    true,
    5242880,
    array['image/jpeg']
)
on conflict (id) do update
set
    public = true,
    file_size_limit = 5242880,
    allowed_mime_types = array['image/jpeg'];


drop policy if exists "CRM users can upload partner screenshots"
on storage.objects;

create policy "CRM users can upload partner screenshots"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'partner-screenshots'
    and public.crm_role_in(
        array['admin', 'officer']
    )
);


drop policy if exists "CRM users can update partner screenshots"
on storage.objects;

create policy "CRM users can update partner screenshots"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'partner-screenshots'
    and public.crm_role_in(
        array['admin', 'officer']
    )
)
with check (
    bucket_id = 'partner-screenshots'
    and public.crm_role_in(
        array['admin', 'officer']
    )
);


drop policy if exists "CRM admins can delete partner screenshots"
on storage.objects;

create policy "CRM admins can delete partner screenshots"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'partner-screenshots'
    and public.crm_role_in(
        array['admin']
    )
);
