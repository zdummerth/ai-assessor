-- Add parcel permissions to app_permissions and seed role_permissions
-- This migration adds parcels.read, parcels.write, and parcels.delete permissions
-- Insert parcel permissions if they don't exist
INSERT INTO
    public.app_permissions (name, description)
VALUES
    ('parcels.read', 'View parcel records'),
    (
        'parcels.write',
        'Create and update parcel records'
    ),
    ('parcels.delete', 'Delete parcel records') ON CONFLICT (name) DO NOTHING;

-- Grant parcel permissions to roles
-- Admin: full access
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'parcels.read'),
    ('admin', 'parcels.write'),
    ('admin', 'parcels.delete') ON CONFLICT (role, permission) DO NOTHING;

-- Manager: read and write
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('manager', 'parcels.read'),
    ('manager', 'parcels.write') ON CONFLICT (role, permission) DO NOTHING;

-- Member: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('member', 'parcels.read') ON CONFLICT (role, permission) DO NOTHING;

-- Viewer: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('viewer', 'parcels.read') ON CONFLICT (role, permission) DO NOTHING;