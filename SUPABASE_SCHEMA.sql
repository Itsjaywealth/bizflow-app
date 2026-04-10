-- BizFlow NG Database Schema
-- Paste this into Supabase SQL Editor for a fresh BizFlow NG project.

create table if not exists businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  logo_url text,
  bank_name text,
  account_name text,
  account_number text,
  payment_link text,
  created_at timestamp with time zone default now()
);

create table if not exists clients (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

create table if not exists invoices (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  client_id uuid references clients(id),
  invoice_number text not null,
  status text default 'draft',
  items jsonb default '[]'::jsonb,
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  due_date date,
  notes text,
  public_token text default gen_random_uuid()::text,
  business_snapshot jsonb default '{}'::jsonb,
  client_snapshot jsonb default '{}'::jsonb,
  created_at timestamp with time zone default now()
);

create table if not exists staff (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  role text,
  email text,
  phone text,
  salary numeric default 0,
  status text default 'active',
  created_at timestamp with time zone default now()
);

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

create unique index if not exists invoices_public_token_idx on invoices(public_token);

alter table businesses enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table staff enable row level security;
alter table products enable row level security;
alter table expenses enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'businesses' and policyname = 'Users own businesses') then
    create policy "Users own businesses" on businesses for all using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'clients' and policyname = 'Business owns clients') then
    create policy "Business owns clients" on clients for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'invoices' and policyname = 'Business owns invoices') then
    create policy "Business owns invoices" on invoices for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'staff' and policyname = 'Business owns staff') then
    create policy "Business owns staff" on staff for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

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

create or replace function get_public_invoice(token text)
returns setof invoices
language sql
security definer
set search_path = public
as $$
  select *
  from invoices
  where public_token = token
  limit 1;
$$;

grant execute on function get_public_invoice(text) to anon, authenticated;

-- Optional logo upload setup:
-- In Supabase Storage, create a public bucket named: business-logos.
-- The app uses this bucket for Business Profile logo uploads.

-- Optional realtime setup:
-- In Supabase Dashboard, enable Realtime for invoices, expenses, clients,
-- staff, and products so the dashboard and invoice table refresh instantly.
