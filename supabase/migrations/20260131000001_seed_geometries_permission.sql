-- Seed geometries.manage permission
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'geometries.manage',
        'Create, update, and delete parcel geometries'
    ) ON CONFLICT (name) DO NOTHING;