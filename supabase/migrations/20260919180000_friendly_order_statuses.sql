-- ============================================================================
-- ZORIE COLLECTIBLES — friendlier customer-facing order statuses
-- Replaces the internal wording with warmer, clearer labels:
--   Payment Proof Submitted -> Verifying Your Payment
--   Processing             -> Being Handcrafted
--   Shipped                -> On Its Way
-- Awaiting Payment / Delivered / Cancelled are unchanged.
-- ============================================================================

update public.orders set status = 'Verifying Your Payment' where status = 'Payment Proof Submitted';
update public.orders set status = 'Being Handcrafted'       where status = 'Processing';
update public.orders set status = 'On Its Way'              where status = 'Shipped';