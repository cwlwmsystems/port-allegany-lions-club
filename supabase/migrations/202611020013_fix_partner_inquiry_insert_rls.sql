-- ============================================================
-- COMMUNITY PARTNER INQUIRY
-- ALLOW PUBLIC FORM SUBMISSION FROM ANON OR AUTHENTICATED SESSION
-- ============================================================

drop policy if exists "Public can submit partner inquiries"
on public.community_partner_inquiries;

create policy "Public can submit partner inquiries"
on public.community_partner_inquiries
for insert
to anon, authenticated
with check (
    status = 'new'
    and source = 'community_partner_form'
);
