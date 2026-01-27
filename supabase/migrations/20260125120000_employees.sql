-- Employees schema following Postgres + Supabase best practices
-- - Identity PK (bigint)
-- - FK to auth.users with index
-- - Case-insensitive email with citext
-- - Guardrails for status/termination
-- - RLS with RBAC using custom claims via Auth Hook

create extension if not exists citext;

-- Lookup tables for roles and permissions (replacing enums for flexibility)
create table if not exists public.app_roles (
  name text primary key check (length(name) > 0),
  description text,
  created_at timestamptz not null default now()
);

comment on table public.app_roles is 'Lookup table for application roles.';

create table if not exists public.app_permissions (
  name text primary key check (length(name) > 0),
  description text,
  created_at timestamptz not null default now()
);

comment on table public.app_permissions is 'Lookup table for application permissions.';

-- Seed default roles
insert into public.app_roles (name, description)
values
  ('admin', 'Full system access'),
  ('manager', 'Manage employees and view data'),
  ('member', 'Read employee data'),
  ('viewer', 'View-only access')
on conflict (name) do nothing;

-- Seed default permissions
insert into public.app_permissions (name, description)
values
  ('employees.read', 'View employee records'),
  ('employees.write', 'Create and update employee records'),
  ('employees.delete', 'Delete employee records'),
  ('roles.manage', 'Manage user roles and permissions')
on conflict (name) do nothing;

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
  constraint employees_role_fk foreign key (role) references public.app_roles (name) on delete restrict,
  constraint employees_status_check check (status = any (array['active','leave','terminated'])),
  constraint employees_terminated_has_date check (status <> 'terminated' or termination_date is not null),
  constraint employees_hire_before_termination check (termination_date is null or termination_date >= hire_date)
);

create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_user_id_idx on public.employees (user_id);
create index if not exists employees_created_at_idx on public.employees (created_at);
create index if not exists employees_role_idx on public.employees (role);

comment on table public.employees is 'Employee records with role-based access control.';

-- User roles: maps user_id to their app role(s)
create table if not exists public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  role text not null references public.app_roles (name) on delete restrict,
  granted_by uuid not null default auth.uid() references auth.users (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint user_roles_unique unique (user_id, role)
);

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);
create index if not exists user_roles_role_idx on public.user_roles (role);

comment on table public.user_roles is 'Application roles for each user.';

-- Role permissions: defines what each role can do
create table if not exists public.role_permissions (
  id bigint generated always as identity primary key,
  role text not null references public.app_roles (name) on delete cascade,
  permission text not null references public.app_permissions (name) on delete cascade,
  constraint role_permissions_unique unique (role, permission)
);

create index if not exists role_permissions_role_idx on public.role_permissions (role);
create index if not exists role_permissions_permission_idx on public.role_permissions (permission);

comment on table public.role_permissions is 'Application permissions for each role.';

-- Seed default role permissions
insert into public.role_permissions (role, permission)
values
  ('admin', 'employees.read'),
  ('admin', 'employees.write'),
  ('admin', 'employees.delete'),
  ('admin', 'roles.manage'),
  ('manager', 'employees.read'),
  ('manager', 'employees.write'),
  ('member', 'employees.read'),
  ('viewer', 'employees.read')
on conflict (role, permission) do nothing;

-- Auth Hook: inject user_role into JWT custom claims
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role text;
  begin
    -- Fetch the user role in the user_roles table
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid limit 1;

    claims := event->'claims';

    if user_role is not null then
      -- Set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'null');
    end if;

    -- Update the 'claims' object in the original event
    event := jsonb_set(event, '{claims}', claims);

    -- Return the modified or original event
    return event;
  end;
$$;

-- Grant necessary permissions for the auth hook
grant usage on schema public to supabase_auth_admin;

grant execute
  on function public.custom_access_token_hook
  to supabase_auth_admin;

revoke execute
  on function public.custom_access_token_hook
  from authenticated, anon, public;

grant all
  on table public.user_roles
  to supabase_auth_admin;

revoke all
  on table public.user_roles
  from authenticated, anon, public;

-- Authorize function: check if user's role has requested permission
create or replace function public.authorize(
  requested_permission text
)
returns boolean as $$
declare
  bind_permissions int;
  user_role text;
begin
  -- Fetch user role from JWT
  select auth.jwt() ->> 'user_role' into user_role;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
    and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';

-- Ensure updated_at reflects the latest change
create or replace trigger set_employees_updated_at
before update on public.employees
for each row execute function public.trigger_set_updated_at();

-- Row Level Security for employees
alter table public.employees enable row level security;

-- Read: users can see employees if they have read permission
create policy employees_select_authorized on public.employees
for select
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('employees.read')
);

-- Write: users can insert/update if they have write permission
create policy employees_insert_authorized on public.employees
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.authorize('employees.write')
);

create policy employees_update_authorized on public.employees
for update
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('employees.write')
)
with check (
  auth.role() = 'service_role'
  or public.authorize('employees.write')
);

-- Delete: users can delete if they have delete permission
create policy employees_delete_authorized on public.employees
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('employees.delete')
);

-- RLS for user_roles: only service_role and auth admin can manage
alter table public.user_roles enable row level security;

create policy "Allow auth admin to read user roles" on public.user_roles
as permissive for select
to supabase_auth_admin
using (true);

create policy user_roles_select_authorized on public.user_roles
for select
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
  or user_id = auth.uid()
);

create policy user_roles_insert_authorized on public.user_roles
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy user_roles_delete_authorized on public.user_roles
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

-- RLS for role_permissions: admins can modify, everyone can read
alter table public.role_permissions enable row level security;

create policy role_permissions_select_all on public.role_permissions
for select
to authenticated
using (true);

create policy role_permissions_insert_authorized on public.role_permissions
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy role_permissions_update_authorized on public.role_permissions
for update
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
)
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy role_permissions_delete_authorized on public.role_permissions
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

-- RLS for app_roles lookup table: admins can modify, everyone can read
alter table public.app_roles enable row level security;

create policy app_roles_select_all on public.app_roles
for select
to authenticated
using (true);

create policy app_roles_insert_authorized on public.app_roles
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy app_roles_update_authorized on public.app_roles
for update
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
)
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy app_roles_delete_authorized on public.app_roles
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

-- RLS for app_permissions lookup table: admins can modify, everyone can read
alter table public.app_permissions enable row level security;

create policy app_permissions_select_all on public.app_permissions
for select
to authenticated
using (true);

create policy app_permissions_insert_authorized on public.app_permissions
for insert
to authenticated
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy app_permissions_update_authorized on public.app_permissions
for update
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
)
with check (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);

create policy app_permissions_delete_authorized on public.app_permissions
for delete
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('roles.manage')
);
