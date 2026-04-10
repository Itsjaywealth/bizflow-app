-- BizFlow NG payment tracking update
-- Paste this into Supabase SQL Editor if your project was created before
-- invoice payment tracking was added.

alter table invoices add column if not exists amount_paid numeric default 0;
alter table invoices add column if not exists payment_history jsonb default '[]'::jsonb;

update invoices
set amount_paid = total
where status = 'paid'
  and (amount_paid is null or amount_paid = 0);

update invoices
set payment_history = '[]'::jsonb
where payment_history is null;
