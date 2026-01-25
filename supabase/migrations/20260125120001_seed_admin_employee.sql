-- Seed an admin employee
-- Using service_role context to bypass RLS

do $$
declare
  v_employee_id bigint;
  v_user_id uuid := 'e1bd5a05-6c4d-4005-a0b3-a13ff2af5564';
begin
  -- Insert employee
  insert into public.employees (user_id, first_name, last_name, email, hire_date, status, role, created_by)
  values (
    v_user_id,
    'Zach',
    'Dummerth',
    'dummerthz@stlouis-mo.gov',
    current_date,
    'active',
    'admin',
    v_user_id
  )
  returning id into v_employee_id;

  -- Grant admin role
  insert into public.employee_roles (employee_id, role, granted_by)
  values (v_employee_id, 'admin', v_user_id)
  on conflict (employee_id, role) do nothing;

  raise notice 'Admin employee created: id=%, user_id=%', v_employee_id, v_user_id;
end
$$;
