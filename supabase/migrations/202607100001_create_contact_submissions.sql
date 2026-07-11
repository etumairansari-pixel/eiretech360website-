create table if not exists public.contact_submissions (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 2 and 100),
  email text not null check (char_length(email) <= 254),
  phone text check (phone is null or char_length(phone) <= 40),
  company text check (company is null or char_length(company) <= 120),
  service text not null check (char_length(service) <= 100),
  message text not null check (char_length(message) between 10 and 5000),
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamptz not null default now()
);

alter table public.contact_submissions enable row level security;

-- Browser users cannot read or write submissions directly. The Edge Function
-- validates input and inserts with its server-only secret key.
revoke all on table public.contact_submissions from anon, authenticated;
grant all on table public.contact_submissions to service_role;

create index if not exists contact_submissions_created_at_idx
  on public.contact_submissions (created_at desc);
