-- Add parcel_search_table permissions to app_permissions and seed role_permissions
-- This migration adds parcel_search_table.read, parcel_search_table.write, and parcel_search_table.delete permissions
-- Insert parcel_search_table permissions if they don't exist
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'parcel_search_table.read',
        'View parcel search table records'
    ),
    (
        'parcel_search_table.write',
        'Create and update parcel search table records'
    ),
    (
        'parcel_search_table.delete',
        'Delete parcel search table records'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant parcel_search_table permissions to roles
-- Admin: full access
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'parcel_search_table.read'),
    ('admin', 'parcel_search_table.write'),
    ('admin', 'parcel_search_table.delete') ON CONFLICT (role, permission) DO NOTHING;

-- Manager: read and write
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('manager', 'parcel_search_table.read'),
    ('manager', 'parcel_search_table.write') ON CONFLICT (role, permission) DO NOTHING;

-- Member: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('member', 'parcel_search_table.read') ON CONFLICT (role, permission) DO NOTHING;

-- Viewer: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('viewer', 'parcel_search_table.read') ON CONFLICT (role, permission) DO NOTHING;