# RBAC Setup Guide

This project now follows Supabase's recommended RBAC pattern using custom claims via Auth Hooks.

## Key Changes

### 1. Custom Types (ENUMs)

- `app_role`: `admin`, `manager`, `member`, `viewer`
- `app_permission`: `employees.read`, `employees.write`, `employees.delete`, `roles.manage`, `abilities.manage`

### 2. New Tables

#### `user_roles`

Maps users to their application roles. Used by the Auth Hook to inject role into JWT.

```sql
select user_id, role from user_roles;
```

#### `role_permissions`

Defines what each role can do. Seeded with default permissions:

- **admin**: all permissions
- **manager**: read + write employees
- **member**: read employees
- **viewer**: read employees

### 3. Auth Hook Function

`custom_access_token_hook(event jsonb)` - Injects `user_role` from `user_roles` table into the JWT as a custom claim.

### 4. Authorize Function

`authorize(requested_permission app_permission)` - Checks if the user's role (from JWT) has the requested permission.

### 5. Updated RLS Policies

All policies now use `authorize()` instead of direct database checks:

```sql
-- Example: employees select policy
create policy employees_select_authorized on public.employees
for select
to authenticated
using (
  auth.role() = 'service_role'
  or public.authorize('employees.read')
);
```

## Enabling the Auth Hook

### In Supabase Dashboard

1. Go to **Authentication > Hooks (Beta)**
2. Select "Custom Access Token" hook type
3. Choose `custom_access_token_hook` from the dropdown
4. Save

### For Local Development

In your `supabase/config.toml`:

```toml
[auth.hook.custom_access_token]
enabled = true
uri = "pg-functions://postgres/public/custom_access_token_hook"
```

Then restart Supabase:

```bash
supabase stop
supabase start
```

## Usage

### Assigning Roles

```sql
-- Grant admin role to a user
insert into public.user_roles (user_id, role)
values ('user-uuid-here', 'admin');

-- Grant manager role
insert into public.user_roles (user_id, role)
values ('user-uuid-here', 'manager');
```

### Accessing Custom Claims in Application

In your Next.js app:

```typescript
import { jwtDecode } from "jwt-decode";

const {
  data: { session },
} = await supabase.auth.getSession();
if (session) {
  const jwt = jwtDecode(session.access_token);
  const userRole = jwt.user_role; // 'admin', 'manager', 'member', or 'viewer'
}
```

### Testing Permissions

```sql
-- Test if current user has a permission
select public.authorize('employees.write');

-- Check current user's role (from JWT)
select (auth.jwt() ->> 'user_role')::public.app_role;
```

## Adding New Permissions

1. Add to enum:

```sql
alter type public.app_permission add value 'new.permission';
```

2. Grant to roles:

```sql
insert into public.role_permissions (role, permission)
values ('admin', 'new.permission');
```

3. Use in RLS policies:

```sql
create policy some_policy on some_table
for some_operation
to authenticated
using (public.authorize('new.permission'));
```

## Migration Notes

- `employee_roles` table replaced by `user_roles` (user-centric, not employee-centric)
- `role` column in `employees` changed from `text` to `app_role` enum
- All RLS policies updated to use `authorize()` function
- Seed data updated to use `user_roles` table
