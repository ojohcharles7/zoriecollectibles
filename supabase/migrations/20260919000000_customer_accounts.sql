-- ============================================================================
-- ZORIE COLLECTIBLES — Customer accounts
-- 1) orders.user_id links an order to the logged-in customer
-- 2) RLS is tightened: customers only see THEIR OWN orders, and all
--    owner-level write/read access now requires the admin claim
--    (auth.jwt() -> 'app_metadata' ->> 'role' = 'admin') on the admin user.
-- ============================================================================

-- ---- LINK ORDERS TO CUSTOMERS ----
alter table public.orders add column if not exists user_id uuid;
create index if not exists orders_user_id_idx on public.orders (user_id);

-- ---- ORDERS ----
drop policy if exists "orders public insert" on public.orders;
drop policy if exists "orders owner select" on public.orders;
drop policy if exists "orders owner update" on public.orders;
drop policy if exists "orders customer insert" on public.orders;
drop policy if exists "orders customer select" on public.orders;
drop policy if exists "orders admin update" on public.orders;

-- anyone may insert an order; guests must have user_id null, a signed-in
-- customer may only tag their own order.
create policy "orders customer insert" on public.orders for insert
  with check (auth.uid() is null or user_id is null or auth.uid() = user_id);

-- customers see only their own orders; admins see everything.
create policy "orders customer select" on public.orders for select
  using (auth.uid() = user_id or ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));

-- only admins may update order status.
create policy "orders admin update" on public.orders for update
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---- PRODUCTS (admin only writes) ----
drop policy if exists "products owner write" on public.products;
create policy "products owner write" on public.products for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---- DISCOUNTS (admin only writes) ----
drop policy if exists "discounts owner write" on public.discounts;
create policy "discounts owner write" on public.discounts for all
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin')
  with check ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---- SUBSCRIBERS (admin only reads) ----
drop policy if exists "subscribers owner select" on public.subscribers;
create policy "subscribers owner select" on public.subscribers for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---- CONTACT MESSAGES (admin only reads) ----
drop policy if exists "contact owner select" on public.contact_messages;
create policy "contact owner select" on public.contact_messages for select
  using ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin');

-- ---- STORAGE (admin only uploads/updates/deletes) ----
drop policy if exists "product images owner upload" on storage.objects;
drop policy if exists "product images owner update" on storage.objects;
drop policy if exists "product images owner delete" on storage.objects;
create policy "product images owner upload" on storage.objects
  for insert with check (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
create policy "product images owner update" on storage.objects
  for update using (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'))
  with check (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));
create policy "product images owner delete" on storage.objects
  for delete using (bucket_id = 'product-images' and ((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'));