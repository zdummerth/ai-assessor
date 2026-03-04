-- Add sale_snapshot child-table permissions to app_permissions and seed role_permissions
-- ---------------------------------------------------------------------------
-- Insert permissions
-- ---------------------------------------------------------------------------
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'sale_snapshot_parcels.read',
        'View sale snapshot parcel records'
    ),
    (
        'sale_snapshot_parcels.write',
        'Create and update sale snapshot parcel records'
    ),
    (
        'sale_snapshot_parcels.delete',
        'Delete sale snapshot parcel records'
    ),
    (
        'sale_snapshot_res_cost.read',
        'View sale snapshot residential cost records'
    ),
    (
        'sale_snapshot_res_cost.write',
        'Create and update sale snapshot residential cost records'
    ),
    (
        'sale_snapshot_res_cost.delete',
        'Delete sale snapshot residential cost records'
    ),
    (
        'sale_snapshot_res_rfc.read',
        'View sale snapshot residential RFC records'
    ),
    (
        'sale_snapshot_res_rfc.write',
        'Create and update sale snapshot residential RFC records'
    ),
    (
        'sale_snapshot_res_rfc.delete',
        'Delete sale snapshot residential RFC records'
    ),
    (
        'sale_snapshot_com_cost.read',
        'View sale snapshot commercial cost records'
    ),
    (
        'sale_snapshot_com_cost.write',
        'Create and update sale snapshot commercial cost records'
    ),
    (
        'sale_snapshot_com_cost.delete',
        'Delete sale snapshot commercial cost records'
    ) ON CONFLICT (name) DO NOTHING;

-- ---------------------------------------------------------------------------
-- Grant permissions to roles
-- Admin: full access
-- Manager: read/write
-- Member: read-only
-- Viewer: read-only
-- ---------------------------------------------------------------------------
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    -- sale_snapshot_parcels
    ('admin', 'sale_snapshot_parcels.read'),
    ('admin', 'sale_snapshot_parcels.write'),
    ('admin', 'sale_snapshot_parcels.delete'),
    ('manager', 'sale_snapshot_parcels.read'),
    ('manager', 'sale_snapshot_parcels.write'),
    ('member', 'sale_snapshot_parcels.read'),
    ('viewer', 'sale_snapshot_parcels.read'),
    -- sale_snapshot_res_cost
    ('admin', 'sale_snapshot_res_cost.read'),
    ('admin', 'sale_snapshot_res_cost.write'),
    ('admin', 'sale_snapshot_res_cost.delete'),
    ('manager', 'sale_snapshot_res_cost.read'),
    ('manager', 'sale_snapshot_res_cost.write'),
    ('member', 'sale_snapshot_res_cost.read'),
    ('viewer', 'sale_snapshot_res_cost.read'),
    -- sale_snapshot_res_rfc
    ('admin', 'sale_snapshot_res_rfc.read'),
    ('admin', 'sale_snapshot_res_rfc.write'),
    ('admin', 'sale_snapshot_res_rfc.delete'),
    ('manager', 'sale_snapshot_res_rfc.read'),
    ('manager', 'sale_snapshot_res_rfc.write'),
    ('member', 'sale_snapshot_res_rfc.read'),
    ('viewer', 'sale_snapshot_res_rfc.read'),
    -- sale_snapshot_com_cost
    ('admin', 'sale_snapshot_com_cost.read'),
    ('admin', 'sale_snapshot_com_cost.write'),
    ('admin', 'sale_snapshot_com_cost.delete'),
    ('manager', 'sale_snapshot_com_cost.read'),
    ('manager', 'sale_snapshot_com_cost.write'),
    ('member', 'sale_snapshot_com_cost.read'),
    ('viewer', 'sale_snapshot_com_cost.read') ON CONFLICT (role, permission) DO NOTHING;