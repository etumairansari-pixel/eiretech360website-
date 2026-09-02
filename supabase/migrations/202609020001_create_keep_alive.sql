create table if not exists public.keep_alive (
  id smallint primary key default 1 check (id = 1),
  touched_at timestamptz not null default now()
);

insert into public.keep_alive (id)
values (1)
on conflict (id) do nothing;

alter table public.keep_alive enable row level security;

revoke all on table public.keep_alive from anon, authenticated;
grant select on table public.keep_alive to anon;

drop policy if exists "Allow public keepalive read" on public.keep_alive;
create policy "Allow public keepalive read"
  on public.keep_alive
  for select
  to anon
  using (id = 1);
