-- BizFlow NG Database Schema
-- Paste this into Supabase SQL Editor and click Run

-- Businesses table
create table businesses (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  logo_url text,
  created_at timestamp with time zone default now()
);

-- Clients table
create table clients (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

-- Invoices table
create table invoices (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  client_id uuid references clients(id),
  invoice_number text not null,
  status text default 'pending',
  items jsonb default '[]',
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  due_date date,
  notes text,
  created_at timestamp with time zone default now()
);

-- Staff table
create table staff (
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

-- Enable Row Level Security
alter table businesses enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table staff enable row level security;

-- Policies - users can only see their own data
create policy "Users own businesses" on businesses for all using (auth.uid() = user_id);
create policy "Business owns clients" on clients for all using (business_id in (select id from businesses where user_id = auth.uid()));
create policy "Business owns invoices" on invoices for all using (business_id in (select id from businesses where user_id = auth.uid()));
create policy "Business owns staff" on staff for all using (business_id in (select id from businesses where user_id = auth.uid()));
