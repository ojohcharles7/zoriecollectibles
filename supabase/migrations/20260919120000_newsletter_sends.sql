-- ============================================================================
-- ZORIE COLLECTIBLES — Newsletter waitlist send log
-- The newsletter only starts sending once the waitlist reaches 50 subscribers.
-- Each broadcast is recorded here so the admin can see past sends.
-- ============================================================================

create table if not exists public.newsletter_sends (
  id               uuid primary key default gen_random_uuid(),
  recipient_count  integer not null,
  subject          text not null,
  created_at       timestamptz default now()
);

alter table public.newsletter_sends enable row level security;

drop policy if exists "newsletter sends owner insert" on public.newsletter_sends;
drop policy if exists "newsletter sends owner select" on public.newsletter_sends;
create policy "newsletter sends owner insert" on public.newsletter_sends for insert
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "newsletter sends owner select" on public.newsletter_sends for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');