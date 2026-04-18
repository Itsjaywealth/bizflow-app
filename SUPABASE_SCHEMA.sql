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
  amount_paid numeric default 0,
  payment_history jsonb default '[]'::jsonb,
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

alter table staff add column if not exists first_name text;
alter table staff add column if not exists last_name text;
alter table staff add column if not exists date_of_birth date;
alter table staff add column if not exists gender text;
alter table staff add column if not exists personal_email text;
alter table staff add column if not exists home_address text;
alter table staff add column if not exists emergency_contact_name text;
alter table staff add column if not exists emergency_contact_phone text;
alter table staff add column if not exists photo_url text;
alter table staff add column if not exists job_title text;
alter table staff add column if not exists department text;
alter table staff add column if not exists employment_type text;
alter table staff add column if not exists start_date date;
alter table staff add column if not exists probation_end_date date;
alter table staff add column if not exists reporting_manager_id uuid;
alter table staff add column if not exists work_email text;
alter table staff add column if not exists employee_id text;
alter table staff add column if not exists basic_salary numeric default 0;
alter table staff add column if not exists housing_allowance numeric default 0;
alter table staff add column if not exists transport_allowance numeric default 0;
alter table staff add column if not exists other_allowances jsonb default '[]'::jsonb;
alter table staff add column if not exists gross_salary numeric default 0;
alter table staff add column if not exists bank_name text;
alter table staff add column if not exists account_number text;
alter table staff add column if not exists account_name text;

create table if not exists departments (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  head_id uuid references staff(id) on delete set null,
  created_at timestamp with time zone default now()
);

create table if not exists attendance (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  attendance_date date not null default current_date,
  status text default 'present',
  check_in_at timestamp with time zone,
  check_out_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists leave_requests (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  leave_type text not null,
  from_date date not null,
  to_date date not null,
  days_requested numeric default 0,
  reason text,
  status text default 'pending',
  manager_comment text,
  approved_by uuid,
  reviewed_at timestamp with time zone,
  attachment_url text,
  created_at timestamp with time zone default now()
);

create table if not exists leave_balances (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  leave_type text not null,
  total_days numeric default 0,
  remaining_days numeric default 0,
  created_at timestamp with time zone default now()
);

create table if not exists staff_documents (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  staff_id uuid references staff(id) on delete cascade,
  category text,
  file_name text,
  file_path text,
  created_at timestamp with time zone default now()
);

create table if not exists payroll_runs (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  payroll_month text not null,
  total_gross numeric default 0,
  total_deductions numeric default 0,
  total_net numeric default 0,
  staff_count integer default 0,
  status text default 'processed',
  processed_at timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

create table if not exists payslips (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  payroll_run_id uuid references payroll_runs(id) on delete set null,
  staff_id uuid references staff(id) on delete cascade,
  payroll_month text not null,
  employee_id text,
  gross numeric default 0,
  paye_tax numeric default 0,
  pension_employee numeric default 0,
  pension_employer numeric default 0,
  nhf numeric default 0,
  other_deductions numeric default 0,
  net_pay numeric default 0,
  status text default 'processed',
  created_at timestamp with time zone default now()
);

create table if not exists deduction_configs (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  pension_enabled boolean default true,
  pension_employee_percent numeric default 8,
  pension_employer_percent numeric default 10,
  nhf_enabled boolean default true,
  nhf_rate numeric default 2.5,
  custom_deductions jsonb default '[]'::jsonb,
  created_at timestamp with time zone default now()
);

create unique index if not exists invoices_public_token_idx on invoices(public_token);
create index if not exists businesses_user_id_idx on businesses(user_id);
create index if not exists clients_business_id_idx on clients(business_id);
create index if not exists invoices_business_id_idx on invoices(business_id);
create index if not exists invoices_client_id_idx on invoices(client_id);
create index if not exists staff_business_id_idx on staff(business_id);
create index if not exists products_business_id_idx on products(business_id);
create index if not exists expenses_business_id_idx on expenses(business_id);
create index if not exists departments_business_id_idx on departments(business_id);
create index if not exists attendance_business_id_staff_id_idx on attendance(business_id, staff_id);
create index if not exists leave_requests_business_id_staff_id_idx on leave_requests(business_id, staff_id);
create index if not exists leave_balances_business_id_staff_id_idx on leave_balances(business_id, staff_id);
create index if not exists staff_documents_business_id_staff_id_idx on staff_documents(business_id, staff_id);
create index if not exists payroll_runs_business_id_idx on payroll_runs(business_id);
create index if not exists payslips_business_id_staff_id_idx on payslips(business_id, staff_id);
create index if not exists deduction_configs_business_id_idx on deduction_configs(business_id);
create index if not exists team_invites_business_id_idx on team_invites(business_id);
create index if not exists billing_history_business_id_idx on billing_history(business_id);
create index if not exists login_activity_business_id_user_id_idx on login_activity(business_id, user_id);
create index if not exists account_deletion_requests_business_id_user_id_idx on account_deletion_requests(business_id, user_id);
create index if not exists notifications_user_id_business_id_idx on notifications(user_id, business_id);
create index if not exists announcements_business_id_idx on announcements(business_id);
create index if not exists user_preferences_user_id_business_id_idx on user_preferences(user_id, business_id);

alter table invoices add column if not exists amount_paid numeric default 0;
alter table invoices add column if not exists payment_history jsonb default '[]'::jsonb;
alter table businesses add column if not exists business_type text;
alter table businesses add column if not exists registration_number text;
alter table businesses add column if not exists tax_id text;
alter table businesses add column if not exists website text;
alter table businesses add column if not exists city text;
alter table businesses add column if not exists state text;
alter table businesses add column if not exists country text default 'Nigeria';
alter table businesses add column if not exists default_currency text default 'NGN';
alter table businesses add column if not exists description text;
alter table businesses add column if not exists subscription_plan text default 'Growth';
alter table businesses add column if not exists renewal_date timestamp with time zone;
alter table businesses add column if not exists invoice_settings jsonb default '{}'::jsonb;
alter table businesses add column if not exists notification_settings jsonb default '{}'::jsonb;
alter table businesses add column if not exists integration_settings jsonb default '{}'::jsonb;
alter table businesses add column if not exists security_settings jsonb default '{}'::jsonb;
alter table businesses add column if not exists billing_settings jsonb default '{}'::jsonb;

create table if not exists team_invites (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  email text not null,
  role text not null default 'Staff',
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists billing_history (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  amount numeric default 0,
  plan_name text,
  receipt_reference text,
  created_at timestamp with time zone default now()
);

create table if not exists login_activity (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid,
  ip_address text,
  device text,
  location text,
  status text default 'success',
  created_at timestamp with time zone default now()
);

create table if not exists account_deletion_requests (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid not null,
  type text not null,
  category text,
  title text not null,
  description text,
  link_path text,
  metadata jsonb default '{}'::jsonb,
  is_read boolean default false,
  is_dismissed boolean default false,
  created_at timestamp with time zone default now()
);

create table if not exists announcements (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  variant text default 'info',
  title text not null,
  description text,
  cta_label text,
  cta_path text,
  active boolean default true,
  starts_at timestamp with time zone default now(),
  ends_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

create table if not exists user_preferences (
  id uuid default gen_random_uuid() primary key,
  business_id uuid references businesses(id) on delete cascade,
  user_id uuid not null,
  theme_preference text default 'light',
  checklist_state jsonb default '{}'::jsonb,
  checklist_dismissed boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(user_id, business_id)
);

alter table businesses enable row level security;
alter table clients enable row level security;
alter table invoices enable row level security;
alter table staff enable row level security;
alter table products enable row level security;
alter table expenses enable row level security;
alter table departments enable row level security;
alter table attendance enable row level security;
alter table leave_requests enable row level security;
alter table leave_balances enable row level security;
alter table staff_documents enable row level security;
alter table payroll_runs enable row level security;
alter table payslips enable row level security;
alter table deduction_configs enable row level security;
alter table team_invites enable row level security;
alter table billing_history enable row level security;
alter table login_activity enable row level security;
alter table account_deletion_requests enable row level security;
alter table notifications enable row level security;
alter table announcements enable row level security;
alter table user_preferences enable row level security;

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

  if not exists (select 1 from pg_policies where tablename = 'departments' and policyname = 'Business owns departments') then
    create policy "Business owns departments" on departments for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'attendance' and policyname = 'Business owns attendance') then
    create policy "Business owns attendance" on attendance for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'leave_requests' and policyname = 'Business owns leave requests') then
    create policy "Business owns leave requests" on leave_requests for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'leave_balances' and policyname = 'Business owns leave balances') then
    create policy "Business owns leave balances" on leave_balances for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'staff_documents' and policyname = 'Business owns staff documents') then
    create policy "Business owns staff documents" on staff_documents for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'payroll_runs' and policyname = 'Business owns payroll runs') then
    create policy "Business owns payroll runs" on payroll_runs for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'payslips' and policyname = 'Business owns payslips') then
    create policy "Business owns payslips" on payslips for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'deduction_configs' and policyname = 'Business owns deduction configs') then
    create policy "Business owns deduction configs" on deduction_configs for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'team_invites' and policyname = 'Business owns team invites') then
    create policy "Business owns team invites" on team_invites for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'billing_history' and policyname = 'Business owns billing history') then
    create policy "Business owns billing history" on billing_history for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'login_activity' and policyname = 'Business owns login activity') then
    create policy "Business owns login activity" on login_activity for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'account_deletion_requests' and policyname = 'Business owns account deletion requests') then
    create policy "Business owns account deletion requests" on account_deletion_requests for all using (
      business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'notifications' and policyname = 'Users own notifications') then
    create policy "Users own notifications" on notifications for all using (
      user_id = auth.uid()
      and business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'announcements' and policyname = 'Business owns announcements') then
    create policy "Business owns announcements" on announcements for all using (
      business_id is null
      or business_id in (select id from businesses where user_id = auth.uid())
    );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'user_preferences' and policyname = 'Users own preferences') then
    create policy "Users own preferences" on user_preferences for all using (
      user_id = auth.uid()
      and business_id in (select id from businesses where user_id = auth.uid())
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
--
-- Recommended Storage policies to add in Supabase:
-- 1. business-logos / staff-photos / profile-photos: authenticated users can upload only into a folder that starts with their business id.
-- 2. client-files / staff-documents: keep private and serve through signed URLs where possible.
-- 3. Restrict storage objects by mime type and file size in bucket settings as a second layer behind the frontend validation.

-- Optional realtime setup:
-- In Supabase Dashboard, enable Realtime for invoices, expenses, clients,
-- staff, products, notifications, and announcements so global UI updates instantly.
-- Optional buckets to create for the new HR module:
-- public bucket: staff-photos
-- private or public bucket: staff-documents
-- public bucket: profile-photos
-- public bucket: client-files

-- ----------------------------------------------------------------------------
-- Trial expiration trigger (added)
-- ----------------------------------------------------------------------------
-- Adds a 14-day trial window on new business rows.
alter table businesses
  add column if not exists trial_expires_at timestamp with time zone;

create or replace function set_trial_on_new_business()
returns trigger as $$
begin
  if NEW.trial_expires_at is null then
    NEW.trial_expires_at := now() + interval '14 days';
  end if;
  return NEW;
end;
$$ language plpgsql;

drop trigger if exists trg_set_trial on businesses;

create trigger trg_set_trial
  before insert on businesses
  for each row
  execute function set_trial_on_new_business();
