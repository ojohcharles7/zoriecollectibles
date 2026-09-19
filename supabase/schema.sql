-- ============================================================================
-- ZORIE COLLECTIBLES — Supabase schema
-- Run this in Supabase Dashboard → SQL Editor (one click "Run").
-- ============================================================================

-- PRODUCTS (public catalog; owner can edit)
create table if not exists public.products (
  id            text primary key,
  name          text not null,
  cat           text not null default 'Bracelets',
  price         integer not null default 0,
  stock         integer not null default 10,
  img           text default '',
  description   text default '',
  sizes         jsonb default '["One size"]',
  tags          jsonb default '[]',
  customizable  boolean default false,
  created_at    timestamptz default now()
);

-- ORDERS (customers may insert; owner reads/updates)
create table if not exists public.orders (
  id          text primary key,
  date        timestamptz default now(),
  customer    jsonb default '{}',
  items       jsonb default '[]',
  subtotal    integer default 0,
  discount    integer default 0,
  delivery    integer default 0,
  total       integer default 0,
  paymethod   text default '',
  payref      text default '',
  status      text default 'Being Handcrafted',
  user_id     uuid,
  created_at  timestamptz default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

-- DISCOUNT CODES (owner managed)
create table if not exists public.discounts (
  code     text primary key,
  pct      integer default 0,
  active   boolean default true
);

-- NEWSLETTER SUBSCRIBERS
create table if not exists public.subscribers (
  email      text primary key,
  created_at timestamptz default now()
);

-- SIGNUP USERS — manageable copy of every account created on the site.
-- A trigger on auth.users keeps it in sync; only the admin manages it.
create table if not exists public.signup_users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  full_name  text not null default '',
  phone      text not null default '',
  created_at timestamptz default now()
);

-- Backfill existing Auth users.
insert into public.signup_users (email, full_name, phone, created_at)
select
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', ''),
  coalesce(u.raw_user_meta_data ->> 'phone', ''),
  u.created_at
from auth.users u
where u.email is not null
on conflict (email) do nothing;

-- Auto-add every new Auth user to the table.
create or replace function public.sync_signup_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.email is not null then
    insert into public.signup_users (email, full_name, phone, created_at)
    values (
      new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', ''),
      coalesce(new.raw_user_meta_data ->> 'phone', ''),
      coalesce(new.created_at, now())
    )
    on conflict (email) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.sync_signup_user();

-- USER PROFILES — per-user default delivery info + server-synced cart.
-- One row per auth user; each user manages only their own row.
create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  address         text not null default '',
  city            text not null default '',
  delivery_method text not null default '',
  cart            jsonb not null default '[]'::jsonb,
  updated_at      timestamptz default now()
);

-- Ensure every auth user has a profile row.
create or replace function public.ensure_user_profile()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, cart)
  values (new.id, '[]'::jsonb)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.ensure_user_profile();

-- Backfill existing users.
insert into public.user_profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  created_at timestamptz default now()
);

-- NEWSLETTER SEND LOG (each broadcast to the waitlist is recorded here)
create table if not exists public.newsletter_sends (
  id               uuid primary key default gen_random_uuid(),
  recipient_count  integer not null,
  subject          text not null,
  created_at       timestamptz default now()
);

-- EMAIL QUEUE (transactional emails wait here; drained by send-emails function)
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

-- PRODUCT IMAGE STORAGE (bucket for uploaded product photos)
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "product images public read"   on storage.objects;
drop policy if exists "product images owner upload"  on storage.objects;
drop policy if exists "product images owner update"  on storage.objects;
drop policy if exists "product images owner delete"  on storage.objects;
create policy "product images public read" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "product images owner upload" on storage.objects
  for insert with check (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
create policy "product images owner update" on storage.objects
  for update using (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  with check (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
create policy "product images owner delete" on storage.objects
  for delete using (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.discounts enable row level security;
alter table public.subscribers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.email_queue enable row level security;
alter table public.newsletter_sends enable row level security;
alter table public.signup_users enable row level security;
alter table public.user_profiles enable row level security;

-- products: anyone can read; only the owner (admin claim) can write
drop policy if exists "products public read"   on public.products;
drop policy if exists "products owner write"   on public.products;
create policy "products public read" on public.products for select using (true);
create policy "products owner write" on public.products for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- orders: anyone may insert (guest or own); customers see only their own
-- orders; only the owner (admin claim) can read all / update status.
drop policy if exists "orders public insert" on public.orders;
drop policy if exists "orders owner select" on public.orders;
drop policy if exists "orders owner update" on public.orders;
drop policy if exists "orders customer insert" on public.orders;
drop policy if exists "orders customer select" on public.orders;
drop policy if exists "orders admin update" on public.orders;
create policy "orders customer insert" on public.orders for insert
  with check (auth.uid() is null or user_id is null or auth.uid() = user_id);
create policy "orders customer select" on public.orders for select
  using (auth.uid() = user_id or ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
create policy "orders admin update" on public.orders for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- discounts: anyone can read (to validate a code); only the owner writes
drop policy if exists "discounts public read" on public.discounts;
drop policy if exists "discounts owner write" on public.discounts;
create policy "discounts public read" on public.discounts for select using (true);
create policy "discounts owner write" on public.discounts for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- subscribers: anyone can insert; only the owner reads
drop policy if exists "subscribers public insert" on public.subscribers;
drop policy if exists "subscribers owner select" on public.subscribers;
create policy "subscribers public insert" on public.subscribers for insert with check (true);
create policy "subscribers owner select" on public.subscribers for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- signup users: admin-managed (the auth trigger bypasses RLS on insert)
drop policy if exists "signup users owner all" on public.signup_users;
create policy "signup users owner all" on public.signup_users for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- user profiles: each user manages only their own row
drop policy if exists "profiles own select" on public.user_profiles;
drop policy if exists "profiles own insert" on public.user_profiles;
drop policy if exists "profiles own update" on public.user_profiles;
create policy "profiles own select" on public.user_profiles for select
  using (auth.uid() = id);
create policy "profiles own insert" on public.user_profiles for insert
  with check (auth.uid() = id);
create policy "profiles own update" on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- contact messages: anyone can insert; only the owner reads
drop policy if exists "contact public insert" on public.contact_messages;
drop policy if exists "contact owner select" on public.contact_messages;
create policy "contact public insert" on public.contact_messages for insert with check (true);
create policy "contact owner select" on public.contact_messages for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- newsletter sends: only the owner reads / writes (via the checkout function)
drop policy if exists "newsletter sends owner insert" on public.newsletter_sends;
drop policy if exists "newsletter sends owner select" on public.newsletter_sends;
create policy "newsletter sends owner insert" on public.newsletter_sends for insert
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');
create policy "newsletter sends owner select" on public.newsletter_sends for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---------------------------------------------------------------------------
-- OPTIONAL: create your owner login (email/password) for the admin dashboard.
-- Uncomment, change the email/password, run once, then REMOVE the password
-- value (leave the user in place) — or create the user in Dashboard → Auth.
-- ---------------------------------------------------------------------------
-- insert into auth.users (id, instance_id, aud, role, email, encrypted_password,
--   email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at,
--   updated_at, confirmation_token, recovery_token, email_change_token_new)
-- select gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
--   'you@example.com', crypt('ChangeMe123!', gen_salt('bf')),
--   now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', ''
-- on conflict (email) do nothing;