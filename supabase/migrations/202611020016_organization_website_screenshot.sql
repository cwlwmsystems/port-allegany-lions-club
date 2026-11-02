alter table public.organizations
add column if not exists community_partner_website_screenshot_url text;

alter table public.organizations
add column if not exists community_partner_website_screenshot_updated_at timestamptz;
