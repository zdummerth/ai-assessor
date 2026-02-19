-- Add sales_summary permissions to app_permissions and seed role_permissions
-- This migration adds sales_summary.read, sales_summary.write, and sales_summary.delete permissions
-- Insert sales_summary permissions if they don't exist
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'sales_summary.read',
        'View sales summary records'
    ),
    (
        'sales_summary.write',
        'Create and update sales summary records'
    ),
    (
        'sales_summary.delete',
        'Delete sales summary records'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant sales_summary permissions to roles
-- Admin: full access
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'sales_summary.read'),
    ('admin', 'sales_summary.write'),
    ('admin', 'sales_summary.delete') ON CONFLICT (role, permission) DO NOTHING;

-- Manager: read and write
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('manager', 'sales_summary.read'),
    ('manager', 'sales_summary.write') ON CONFLICT (role, permission) DO NOTHING;

-- Member: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('member', 'sales_summary.read') ON CONFLICT (role, permission) DO NOTHING;

-- Viewer: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('viewer', 'sales_summary.read') ON CONFLICT (role, permission) DO NOTHING;