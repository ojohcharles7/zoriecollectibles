-- Add created_at to discounts so order by created_at works
alter table public.discounts add column if not exists created_at timestamptz default now();