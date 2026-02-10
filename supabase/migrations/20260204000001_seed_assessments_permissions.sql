-- Seed assessments permissions
INSERT INTO
    public.app_permissions (name, description)
VALUES
    ('assessments.read', 'Read parcel assessments'),
    (
        'assessments.write',
        'Create and update parcel assessments'
    ),
    ('assessments.delete', 'Delete parcel assessments') ON CONFLICT (name) DO NOTHING;

-- Grant permissions to admin role
INSERT INTO
    public.role_permissions (role, permission)
VALUES
    ('admin', 'assessments.read'),
    ('admin', 'assessments.write'),
    ('admin', 'assessments.delete') ON CONFLICT (role, permission) DO NOTHING;