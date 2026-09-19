-- ============================================================================
-- ZORIE COLLECTIBLES — signup_users
-- A manageable copy of every account created on the site (or added manually
-- in Dashboard → Authentication → Users). A trigger on `auth.users` keeps it
-- in sync automatically, and existing users are backfilled. Only the admin
-- (owner role claim) can read / manage this table.
-- ============================================================================

create table if not exists public.signup_users (
  id         uuid primary key default gen_random_uuid(),
  email      text unique not null,
  full_name  text not null default '',
  phone      text not null default '',
  created_at timestamptz default now()
);

-- Backfill existing Auth users so nothing already signed up is missed.
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

-- RLS: admin-managed table (the trigger runs as the owner, so signups bypass RLS).
alter table public.signup_users enable row level security;

drop policy if exists "signup users owner all" on public.signup_users;
create policy "signup users owner all" on public.signup_users for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');