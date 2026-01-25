-- Employees schema following Postgres + Supabase best practices
-- - Identity PK (bigint)
-- - FK to auth.users with index
-- - Case-insensitive email with citext
-- - Guardrails for status/termination
-- - Updated-at trigger
-- - RLS locked to owners/service role

create extension if not exists citext;

-- Role values kept as text + check for portability; adjust list as org needs
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'employee_roles_role_check'
  ) then
    -- no-op placeholder to allow the check constraint definition below
  end if;
end
$$;

create or replace function public.trigger_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists public.employees (
  id bigint generated always as identity primary key,
  user_id uuid null,
  first_name text not null check (length(first_name) > 0),
  last_name text not null check (length(last_name) > 0),
  email citext null,
  hire_date date not null,
  termination_date date null,
  status text not null default 'active',
  role text not null default 'member',
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_email_key unique (email),
  constraint employees_user_id_key unique (user_id),
  constraint employees_user_fk foreign key (user_id) references auth.users (id) on delete set null,
  constraint employees_created_by_fk foreign key (created_by) references auth.users (id) on delete restrict,
  constraint employees_status_check check (status = any (array['active','leave','terminated'])),
  constraint employees_role_check check (role = any (array['admin','manager','member','viewer'])),
  constraint employees_terminated_has_date check (status <> 'terminated' or termination_date is not null),
  constraint employees_hire_before_termination check (termination_date is null or termination_date >= hire_date)
);

create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_user_id_idx on public.employees (user_id);
create index if not exists employees_created_at_idx on public.employees (created_at);
create index if not exists employees_role_idx on public.employees (role);

-- Employee roles (supports multi-role assignments beyond the primary role column)
create table if not exists public.employee_roles (
  employee_id bigint not null references public.employees (id) on delete cascade,
  role text not null,
  granted_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint employee_roles_role_check check (role = any (array['admin','manager','member','viewer'])),
  constraint employee_roles_pkey primary key (employee_id, role)
);

create index if not exists employee_roles_role_idx on public.employee_roles (role);

-- Helper function to check if current user is admin (bypasses RLS)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = 'public'
as $$
  select exists (
    select 1
    from employees e
    join employee_roles r on r.employee_id = e.id
    where e.user_id = auth.uid()
      and r.role = 'admin'
  );
$$;

-- Fine-grained abilities for resources: table read/write, function call
create table if not exists public.employee_abilities (
  id bigint generated always as identity primary key,
  employee_id bigint not null references public.employees (id) on delete cascade,
  subject_kind text not null check (subject_kind = any (array['table','function'])),
  subject_name text not null check (subject_name ~ '^[a-z0-9_][a-z0-9_\.]*$'),
  action text not null check (action = any (array['read','write','call','execute','delete'])),
  granted_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint employee_abilities_unique unique (employee_id, subject_kind, subject_name, action)
);

create index if not exists employee_abilities_employee_idx on public.employee_abilities (employee_id);
create index if not exists employee_abilities_subject_idx on public.employee_abilities (subject_kind, subject_name);
create index if not exists employee_abilities_action_idx on public.employee_abilities (action);

-- RLS for employee_abilities: owners can read; only admins/service_role can write
alter table public.employee_abilities enable row level security;

create policy employee_abilities_select_self on public.employee_abilities
for select
to authenticated
using (
  auth.role() = 'service_role'
  or exists (
    select 1 from public.employees e
    where e.id = employee_abilities.employee_id
      and (e.user_id = (select auth.uid()) or e.created_by = (select auth.uid()))
  )
);

create policy employee_abilities_insert_admin on public.employee_abilities
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.is_admin()
);

create policy employee_abilities_delete_admin on public.employee_abilities
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.is_admin()
);

-- Ensure updated_at reflects the latest change
create or replace trigger set_employees_updated_at
before update on public.employees
for each row execute function public.trigger_set_updated_at();

-- Row Level Security
alter table public.employees enable row level security;

-- Allow authenticated users to see or manage only their own employee record; service_role can see all
create policy employees_select_self on public.employees
for select
to authenticated
using (
  auth.role() = 'service_role'
  or user_id = (select auth.uid())
  or created_by = (select auth.uid())
);

create policy employees_insert_admin on public.employees
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.is_admin()
);

create policy employees_update_admin on public.employees
for update
to authenticated
using (
  auth.role() = 'service_role'
  or public.is_admin()
)
with check (
  auth.role() = 'service_role'
  or public.is_admin()
);

create policy employees_delete_admin on public.employees
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.is_admin()
);

-- RLS for employee_roles: owners or service_role may manage
alter table public.employee_roles enable row level security;

create policy employee_roles_select_self on public.employee_roles
for select
to authenticated
using (
  auth.role() = 'service_role'
  or exists (
    select 1 from public.employees e
    where e.id = employee_roles.employee_id
      and (e.user_id = (select auth.uid()) or e.created_by = (select auth.uid()))
  )
);

create policy employee_roles_insert_admin on public.employee_roles
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.is_admin()
);

create policy employee_roles_delete_admin on public.employee_roles
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.is_admin()
);
