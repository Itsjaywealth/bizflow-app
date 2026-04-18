-- BizFlow NG onboarding workspace creation fix
-- Run this in Supabase SQL Editor if onboarding still fails at workspace creation.

begin;

alter table if exists businesses
  add column if not exists business_type text;

alter table if exists businesses
  add column if not exists logo_url text;

alter table if exists businesses
  add column if not exists address text;

alter table if exists businesses
  add column if not exists phone text;

alter table if exists businesses
  add column if not exists email text;

alter table if exists businesses
  add column if not exists created_at timestamp with time zone default now();

create index if not exists businesses_user_id_idx on businesses(user_id);

alter table if exists businesses enable row level security;

drop policy if exists "Users own businesses" on businesses;
create policy "Users own businesses"
  on businesses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users can view own businesses" on businesses;
create policy "Users can view own businesses"
  on businesses
  for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert own businesses" on businesses;
create policy "Users can insert own businesses"
  on businesses
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "Users can update own businesses" on businesses;
create policy "Users can update own businesses"
  on businesses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
