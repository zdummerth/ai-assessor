-- Seed neighborhoods permissions
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'assessor_neighborhoods.manage',
        'Create, update, and delete assessor neighborhoods'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant neighborhoods.manage permission to admin role
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'assessor_neighborhoods.manage') ON CONFLICT (role, permission) DO NOTHING;