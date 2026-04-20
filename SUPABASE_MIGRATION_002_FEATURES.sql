-- BizFlow NG Feature Migration
-- Run this once in Supabase SQL Editor before using the new product, expense,
-- branded invoice, and public invoice features.

alter table businesses add column if not exists bank_name text;
alter table businesses add column if not exists account_name text;
alter table businesses add column if not exists account_number text;
alter table businesses add column if not exists payment_link text;

alter table invoices add column if not exists public_token text;
alter table invoices add column if not exists business_snapshot jsonb default '{}'::jsonb;
alter table invoices add column if not exists client_snapshot jsonb default '{}'::jsonb;

create unique index if not exists invoices_public_token_idx on invoices(public_token);

create table if not exists products (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric default 0,
  created_at timestamp with time zone default now()
);

create table if not exists expenses (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  title text not null,
  category text,
  amount numeric default 0,
  expense_date date default current_date,
  notes text,
  created_at timestamp with time zone default now()
);

alter table products enable row level security;
alter table expenses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'products' and policyname = 'Business owns products') then
    create policy "Business owns products" on products for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'expenses' and policyname = 'Business owns expenses') then
    create policy "Business owns expenses" on expenses for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

end $$;

drop policy if exists "Public invoices can be viewed by token" on invoices;

create or replace function get_public_invoice(token text)
returns jsonb
language sql
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'invoice_number', invoice.invoice_number,
    'created_at', invoice.created_at,
    'due_date', invoice.due_date,
    'status', invoice.status,
    'currency', coalesce(invoice.currency, 'NGN'),
    'items', coalesce(invoice.items, '[]'::jsonb),
    'subtotal', invoice.subtotal,
    'tax', invoice.tax,
    'total', invoice.total,
    'amount_paid', invoice.amount_paid,
    'notes', invoice.notes,
    'business_snapshot', jsonb_build_object(
      'name', invoice.business_snapshot ->> 'name',
      'email', invoice.business_snapshot ->> 'email',
      'phone', invoice.business_snapshot ->> 'phone',
      'address', invoice.business_snapshot ->> 'address',
      'logo_url', invoice.business_snapshot ->> 'logo_url',
      'bank_name', invoice.business_snapshot ->> 'bank_name',
      'account_name', invoice.business_snapshot ->> 'account_name',
      'account_number', invoice.business_snapshot ->> 'account_number',
      'payment_link', invoice.business_snapshot ->> 'payment_link'
    ),
    'client_snapshot', jsonb_build_object(
      'name', invoice.client_snapshot ->> 'name',
      'email', invoice.client_snapshot ->> 'email',
      'phone', invoice.client_snapshot ->> 'phone',
      'address', invoice.client_snapshot ->> 'address'
    )
  )
  from invoices as invoice
  where invoice.public_token = token
  limit 1;
$$;

grant execute on function get_public_invoice(text) to anon, authenticated;
