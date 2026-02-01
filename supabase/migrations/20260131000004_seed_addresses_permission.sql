-- Seed addresses.manage permission
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'addresses.manage',
        'Create, update, and delete addresses'
    ) ON CONFLICT (name) DO NOTHING;