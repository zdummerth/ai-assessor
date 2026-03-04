-- Seed neighborhood_summaries permissions
INSERT INTO
    public.app_permissions (name, description)
VALUES
    (
        'neighborhood_summaries.read',
        'Can read neighborhood sales summaries'
    ),
    (
        'neighborhood_summaries.write',
        'Can create and update neighborhood sales summaries'
    ),
    (
        'neighborhood_summaries.delete',
        'Can delete neighborhood sales summaries'
    ) ON CONFLICT (name) DO NOTHING;