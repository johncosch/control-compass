-- Minimal admin flag table
-- No foreign keys, no triggers. You will set two rows manually.
-- Clients can only read their own flag; only service role / SQL editor can write.

-- 1) Table
create table if not exists public.admin_flags (
  user_id uuid primary key,
  is_admin boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.admin_flags is 'Simple per-user admin flag. user_id == auth.users.id';
comment on column public.admin_flags.user_id is 'Auth user id (uuid)';
comment on column public.admin_flags.is_admin is 'True if the user is an admin';

-- 2) RLS: allow users to read ONLY their own flag; block writes by default
alter table public.admin_flags enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'admin_flags'
      and policyname = 'select_own_flag'
  ) then
    create policy select_own_flag
      on public.admin_flags
      for select
      using (auth.uid() = user_id);
  end if;
end
$$;

-- No insert/update/delete policies on purpose.
-- You (or server using service role) will manage rows manually.
