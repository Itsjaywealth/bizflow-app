-- BizFlow NG businesses RLS fix
-- Use this if inserts into `businesses` are failing with a 403 / permission denied error.
-- The BizFlow NG codebase uses `user_id` as the ownership column.

begin;

alter table if exists businesses enable row level security;

create index if not exists businesses_user_id_idx on businesses(user_id);

drop policy if exists "Users own businesses" on businesses;
drop policy if exists "Users can view own businesses" on businesses;
drop policy if exists "Users can insert own businesses" on businesses;
drop policy if exists "Users can update own businesses" on businesses;

create policy "Users can view own businesses"
  on businesses
  for select
  using (auth.uid() = user_id);

create policy "Users can insert own businesses"
  on businesses
  for insert
  with check (auth.uid() = user_id);

create policy "Users can update own businesses"
  on businesses
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

commit;
