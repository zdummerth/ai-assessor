-- Seed CDA neighborhoods and wards permissions
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'cda_neighborhoods.manage',
        'Create, update, and delete CDA neighborhoods'
    ),
    (
        'wards.manage',
        'Create, update, and delete city wards'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant permissions to admin role
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'cda_neighborhoods.manage'),
    ('admin', 'wards.manage') ON CONFLICT (role, permission) DO NOTHING;