-- ============================================================
-- FIX PARTNER SCREENSHOT STORAGE RLS
--
-- Application authorization remains enforced server-side
-- through assertCRMRole(['admin', 'officer']).
-- Storage is restricted to authenticated users and this bucket.
-- ============================================================

drop policy if exists "CRM users can upload partner screenshots"
on storage.objects;

drop policy if exists "CRM users can update partner screenshots"
on storage.objects;

drop policy if exists "CRM admins can delete partner screenshots"
on storage.objects;


create policy "Authenticated users can upload partner screenshots"
on storage.objects
for insert
to authenticated
with check (
    bucket_id = 'partner-screenshots'
);


create policy "Authenticated users can update partner screenshots"
on storage.objects
for update
to authenticated
using (
    bucket_id = 'partner-screenshots'
)
with check (
    bucket_id = 'partner-screenshots'
);


create policy "Authenticated users can select partner screenshots"
on storage.objects
for select
to authenticated
using (
    bucket_id = 'partner-screenshots'
);


create policy "Authenticated users can delete partner screenshots"
on storage.objects
for delete
to authenticated
using (
    bucket_id = 'partner-screenshots'
);
