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
  status      text default 'Processing',
  created_at  timestamptz default now()
);

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

-- CONTACT MESSAGES
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  email      text,
  message    text,
  created_at timestamptz default now()
);

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
  for insert with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product images owner update" on storage.objects
  for update using (bucket_id = 'product-images' and auth.role() = 'authenticated')
  with check (bucket_id = 'product-images' and auth.role() = 'authenticated');
create policy "product images owner delete" on storage.objects
  for delete using (bucket_id = 'product-images' and auth.role() = 'authenticated');

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.discounts enable row level security;
alter table public.subscribers enable row level security;
alter table public.contact_messages enable row level security;

-- products: anyone can read; only signed-in owner can write
drop policy if exists "products public read"   on public.products;
drop policy if exists "products owner write"   on public.products;
create policy "products public read" on public.products for select using (true);
create policy "products owner write" on public.products for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- orders: anyone can insert (checkout); only owner can read/update
drop policy if exists "orders public insert" on public.orders;
drop policy if exists "orders owner select" on public.orders;
drop policy if exists "orders owner update" on public.orders;
create policy "orders public insert" on public.orders for insert with check (true);
create policy "orders owner select" on public.orders for select
  using (auth.role() = 'authenticated');
create policy "orders owner update" on public.orders for update
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- discounts: anyone can read (to validate a code); only owner writes
drop policy if exists "discounts public read" on public.discounts;
drop policy if exists "discounts owner write" on public.discounts;
create policy "discounts public read" on public.discounts for select using (true);
create policy "discounts owner write" on public.discounts for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- subscribers: anyone can insert; only owner reads
drop policy if exists "subscribers public insert" on public.subscribers;
drop policy if exists "subscribers owner select" on public.subscribers;
create policy "subscribers public insert" on public.subscribers for insert with check (true);
create policy "subscribers owner select" on public.subscribers for select
  using (auth.role() = 'authenticated');

-- contact messages: anyone can insert; only owner reads
drop policy if exists "contact public insert" on public.contact_messages;
drop policy if exists "contact owner select" on public.contact_messages;
create policy "contact public insert" on public.contact_messages for insert with check (true);
create policy "contact owner select" on public.contact_messages for select
  using (auth.role() = 'authenticated');

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