-- ============================================================================
-- ZORIE COLLECTIBLES — Transactional email queue
-- Emails (order confirmations, order alerts, contact messages) are queued here
-- by the checkout/contact edge functions, then drained slowly by the scheduled
-- `send-emails` edge function so we stay within the email provider's free daily
-- budget (~50/day) until the store scales to a paid plan + custom domain.
-- Access: service role only (RLS enabled, no policies) — the browser never reads it.
-- ============================================================================

create table if not exists public.email_queue (
  id         uuid primary key default gen_random_uuid(),
  recipient  text not null,
  subject    text not null,
  body       text not null,
  status     text not null default 'pending' check (status in ('pending','sent','failed')),
  attempts   integer not null default 0,
  error      text not null default '',
  created_at timestamptz default now(),
  sent_at    timestamptz
);

create index if not exists email_queue_status_idx on public.email_queue (status, created_at);
create index if not exists email_queue_sent_at_idx on public.email_queue (sent_at);

alter table public.email_queue enable row level security;