-- Create parcel_snapshot table to cache parcel + assessment + spatial relationships for fast parcel search
-- One row per parcel with latest assessment values and associated neighborhood/ward IDs

CREATE TABLE
    IF NOT EXISTS public.parcel_snapshot (
        parcel_id bigint PRIMARY KEY REFERENCES public.parcels (id) ON DELETE CASCADE,
        cda_neighborhood_id bigint REFERENCES public.cda_neighborhoods (id) ON DELETE SET NULL,
        assessor_neighborhood_id bigint REFERENCES public.assessor_neighborhoods (id) ON DELETE SET NULL,
        ward_id bigint REFERENCES public.wards (id) ON DELETE SET NULL,
        assessment_id bigint REFERENCES public.assessments (id) ON DELETE SET NULL,
        assessment_category text,
        assessment_date timestamptz,
        app_total integer,
        app_bldg_agriculture integer,
        app_bldg_commercial integer,
        app_bldg_residential integer,
        app_bldg_exempt integer,
        app_land_agriculture integer,
        app_land_commercial integer,
        app_land_residential integer,
        app_land_exempt integer,
        bldg_agriculture integer,
        bldg_commercial integer,
        bldg_residential integer,
        bldg_exempt integer,
        land_agriculture integer,
        land_commercial integer,
        land_residential integer,
        land_exempt integer,
        created_at timestamptz NOT NULL DEFAULT now (),
        updated_at timestamptz NOT NULL DEFAULT now ()
    );

COMMENT ON TABLE public.parcel_snapshot IS 'Cached parcel snapshot with latest assessment values and neighborhood/ward mapping to avoid runtime spatial joins.';

-- Indexes for fast filtering
CREATE INDEX IF NOT EXISTS parcel_snapshot_cda_neighborhood_id_idx ON public.parcel_snapshot (cda_neighborhood_id)
WHERE
    cda_neighborhood_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parcel_snapshot_assessor_neighborhood_id_idx ON public.parcel_snapshot (assessor_neighborhood_id)
WHERE
    assessor_neighborhood_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parcel_snapshot_ward_id_idx ON public.parcel_snapshot (ward_id)
WHERE
    ward_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS parcel_snapshot_app_total_idx ON public.parcel_snapshot (app_total)
WHERE
    app_total IS NOT NULL;

CREATE INDEX IF NOT EXISTS parcel_snapshot_assessment_date_idx ON public.parcel_snapshot (assessment_date)
WHERE
    assessment_date IS NOT NULL;

-- Seed snapshot table from spatial joins and latest assessments
INSERT INTO public.parcel_snapshot (
    parcel_id,
    cda_neighborhood_id,
    assessor_neighborhood_id,
    ward_id,
    assessment_id,
    assessment_category,
    assessment_date,
    app_total,
    app_bldg_agriculture,
    app_bldg_commercial,
    app_bldg_residential,
    app_bldg_exempt,
    app_land_agriculture,
    app_land_commercial,
    app_land_residential,
    app_land_exempt,
    bldg_agriculture,
    bldg_commercial,
    bldg_residential,
    bldg_exempt,
    land_agriculture,
    land_commercial,
    land_residential,
    land_exempt
)
SELECT
    p.id AS parcel_id,
    cdn.id AS cda_neighborhood_id,
    an.id AS assessor_neighborhood_id,
    w.id AS ward_id,
    la.id AS assessment_id,
    la.category AS assessment_category,
    la.date_of_assessment AS assessment_date,
    la.app_total,
    la.app_bldg_agriculture,
    la.app_bldg_commercial,
    la.app_bldg_residential,
    la.app_bldg_exempt,
    la.app_land_agriculture,
    la.app_land_commercial,
    la.app_land_residential,
    la.app_land_exempt,
    la.bldg_agriculture,
    la.bldg_commercial,
    la.bldg_residential,
    la.bldg_exempt,
    la.land_agriculture,
    la.land_commercial,
    la.land_residential,
    la.land_exempt
FROM
    public.parcels p
    LEFT JOIN LATERAL (
        SELECT g.geom
        FROM public.geometries g
        WHERE g.parcel_id = p.id
        ORDER BY g.id DESC
        LIMIT 1
    ) g ON true
    LEFT JOIN LATERAL (
        SELECT
            a.id,
            a.category,
            a.date_of_assessment,
            a.app_total,
            a.app_bldg_agriculture,
            a.app_bldg_commercial,
            a.app_bldg_residential,
            a.app_bldg_exempt,
            a.app_land_agriculture,
            a.app_land_commercial,
            a.app_land_residential,
            a.app_land_exempt,
            a.bldg_agriculture,
            a.bldg_commercial,
            a.bldg_residential,
            a.bldg_exempt,
            a.land_agriculture,
            a.land_commercial,
            a.land_residential,
            a.land_exempt
        FROM
            public.assessments a
        WHERE
            a.parcel_id = p.id
        ORDER BY
            a.date_of_assessment DESC NULLS LAST,
            a.id DESC
        LIMIT 1
    ) la ON true
    LEFT JOIN LATERAL (
        SELECT cdn.id, cdn.name, cdn."group", cdn.geom
        FROM public.cda_neighborhoods cdn
        WHERE cdn.geom && g.geom
            AND ST_Contains (cdn.geom, g.geom)
        ORDER BY cdn.id
        LIMIT 1
    ) cdn ON true
    LEFT JOIN LATERAL (
        SELECT an.id, an.name, an."group", an.geom
        FROM public.assessor_neighborhoods an
        WHERE an.geom && g.geom
            AND ST_Contains (an.geom, g.geom)
        ORDER BY an.id
        LIMIT 1
    ) an ON true
    LEFT JOIN LATERAL (
        SELECT w.id, w.name, w."group", w.census_year, w.geom
        FROM public.wards w
        WHERE w.geom && g.geom
            AND ST_Contains (w.geom, g.geom)
        ORDER BY w.id
        LIMIT 1
    ) w ON true
WHERE
    p.retired_at IS NULL
    AND g.geom IS NOT NULL
ON CONFLICT (parcel_id) DO UPDATE
SET
    cda_neighborhood_id = EXCLUDED.cda_neighborhood_id,
    assessor_neighborhood_id = EXCLUDED.assessor_neighborhood_id,
    ward_id = EXCLUDED.ward_id,
    assessment_id = EXCLUDED.assessment_id,
    assessment_category = EXCLUDED.assessment_category,
    assessment_date = EXCLUDED.assessment_date,
    app_total = EXCLUDED.app_total,
    app_bldg_agriculture = EXCLUDED.app_bldg_agriculture,
    app_bldg_commercial = EXCLUDED.app_bldg_commercial,
    app_bldg_residential = EXCLUDED.app_bldg_residential,
    app_bldg_exempt = EXCLUDED.app_bldg_exempt,
    app_land_agriculture = EXCLUDED.app_land_agriculture,
    app_land_commercial = EXCLUDED.app_land_commercial,
    app_land_residential = EXCLUDED.app_land_residential,
    app_land_exempt = EXCLUDED.app_land_exempt,
    bldg_agriculture = EXCLUDED.bldg_agriculture,
    bldg_commercial = EXCLUDED.bldg_commercial,
    bldg_residential = EXCLUDED.bldg_residential,
    bldg_exempt = EXCLUDED.bldg_exempt,
    land_agriculture = EXCLUDED.land_agriculture,
    land_commercial = EXCLUDED.land_commercial,
    land_residential = EXCLUDED.land_residential,
    land_exempt = EXCLUDED.land_exempt,
    updated_at = now ();

-- Enable RLS
ALTER TABLE public.parcel_snapshot ENABLE ROW LEVEL SECURITY;

-- Read: users can see parcel snapshot rows if they have parcels.read permission
CREATE POLICY parcel_snapshot_select_authorized ON public.parcel_snapshot FOR
SELECT
    TO authenticated USING (
        auth.role () = 'service_role'
        OR public.authorize ('parcels.read')
    );

-- Write: users can insert/update parcel snapshot rows if they have parcels.write permission
CREATE POLICY parcel_snapshot_insert_authorized ON public.parcel_snapshot FOR INSERT TO authenticated
WITH
    CHECK (
        auth.role () = 'service_role'
        OR public.authorize ('parcels.write')
    );

CREATE POLICY parcel_snapshot_update_authorized ON public.parcel_snapshot FOR
UPDATE TO authenticated USING (
    auth.role () = 'service_role'
    OR public.authorize ('parcels.write')
)
WITH
    CHECK (
        auth.role () = 'service_role'
        OR public.authorize ('parcels.write')
    );

-- Delete: users can delete parcel snapshot rows if they have parcels.delete permission
CREATE POLICY parcel_snapshot_delete_authorized ON public.parcel_snapshot FOR DELETE TO authenticated USING (
    auth.role () = 'service_role'
    OR public.authorize ('parcels.delete')
);

GRANT USAGE ON SCHEMA public TO authenticated;

GRANT
SELECT
    ON public.parcel_snapshot TO authenticated;
