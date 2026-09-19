-- ============================================================================
-- ZORIE COLLECTIBLES — user_profiles
-- Per-user extras for signed-in customers: saved default delivery info and a
-- server-synced cart (so the cart follows the user across devices). One row
-- per auth user, managed only by that user (RLS: auth.uid() = id).
-- ============================================================================

create table if not exists public.user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  address         text not null default '',
  city            text not null default '',
  delivery_method text not null default '',
  cart            jsonb not null default '[]'::jsonb,
  updated_at      timestamptz default now()
);

-- Ensure every auth user has a profile row (parallel to the signup_users trigger).
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

-- Backfill existing users (including the admin account) so reads always succeed.
insert into public.user_profiles (id)
select id from auth.users
on conflict (id) do nothing;

-- RLS: each user manages only their own row.
alter table public.user_profiles enable row level security;

drop policy if exists "profiles own select" on public.user_profiles;
create policy "profiles own select" on public.user_profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles own insert" on public.user_profiles;
create policy "profiles own insert" on public.user_profiles for insert
  with check (auth.uid() = id);

drop policy if exists "profiles own update" on public.user_profiles;
create policy "profiles own update" on public.user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);