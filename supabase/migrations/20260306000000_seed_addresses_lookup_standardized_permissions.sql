-- Add addresses_lookup_standardized permissions and RLS policies
-- Insert permissions if they do not exist
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'addresses_lookup_standardized.read',
        'View standardized address lookup records'
    ),
    (
        'addresses_lookup_standardized.write',
        'Create and update standardized address lookup records'
    ),
    (
        'addresses_lookup_standardized.delete',
        'Delete standardized address lookup records'
    ) ON CONFLICT (name) DO NOTHING;

-- Grant permissions to roles
-- Admin: full access
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'addresses_lookup_standardized.read'),
    ('admin', 'addresses_lookup_standardized.write'),
    ('admin', 'addresses_lookup_standardized.delete') ON CONFLICT (role, permission) DO NOTHING;

-- Manager: read and write
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('manager', 'addresses_lookup_standardized.read'),
    ('manager', 'addresses_lookup_standardized.write') ON CONFLICT (role, permission) DO NOTHING;

-- Member: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('member', 'addresses_lookup_standardized.read') ON CONFLICT (role, permission) DO NOTHING;

-- Viewer: read-only
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('viewer', 'addresses_lookup_standardized.read') ON CONFLICT (role, permission) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE public.addresses_lookup_standardized ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for addresses_lookup_standardized
CREATE POLICY addresses_lookup_standardized_select_policy ON public.addresses_lookup_standardized FOR
SELECT
    TO authenticated USING (
        public.authorize ('addresses_lookup_standardized.read')
    );

CREATE POLICY addresses_lookup_standardized_insert_policy ON public.addresses_lookup_standardized FOR INSERT TO authenticated
WITH
    CHECK (
        public.authorize ('addresses_lookup_standardized.write')
    );

CREATE POLICY addresses_lookup_standardized_update_policy ON public.addresses_lookup_standardized FOR
UPDATE TO authenticated USING (
    public.authorize ('addresses_lookup_standardized.write')
)
WITH
    CHECK (
        public.authorize ('addresses_lookup_standardized.write')
    );

CREATE POLICY addresses_lookup_standardized_delete_policy ON public.addresses_lookup_standardized FOR DELETE TO authenticated USING (
    public.authorize ('addresses_lookup_standardized.delete')
);