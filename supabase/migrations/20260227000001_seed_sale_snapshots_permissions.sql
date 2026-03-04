-- Add sale_snapshots permissions to app_permissions and seed role_permissions
-- Insert sale_snapshots permissions if they don't exist
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'sale_snapshots.read',
        'View sale snapshot records'
    ),
    (
        'sale_snapshots.write',
        'Create and update sale snapshot records'
    ),
    (
        'sale_snapshots.delete',
        'Delete sale snapshot records'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant sale_snapshots permissions to roles
-- Admin: full access
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'sale_snapshots.read'),
    ('admin', 'sale_snapshots.write'),
    ('admin', 'sale_snapshots.delete') ON CONFLICT (role, permission) DO NOTHING;

-- Manager: read and write
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('manager', 'sale_snapshots.read'),
    ('manager', 'sale_snapshots.write') ON CONFLICT (role, permission) DO NOTHING;

-- Member: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('member', 'sale_snapshots.read') ON CONFLICT (role, permission) DO NOTHING;

-- Viewer: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('viewer', 'sale_snapshots.read') ON CONFLICT (role, permission) DO NOTHING;