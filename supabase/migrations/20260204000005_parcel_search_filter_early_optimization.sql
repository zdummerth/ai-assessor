-- Optimized parcel_search with FILTER EARLY approach
-- Only do spatial containment against filtered neighborhoods/wards
-- Expected performance: 500ms-800ms (vs current 5.2s)

DROP FUNCTION IF EXISTS public.parcel_search;

CREATE OR REPLACE FUNCTION public.parcel_search (
    cda_neighborhood_ids bigint[] DEFAULT NULL,
    assessor_neighborhood_ids bigint[] DEFAULT NULL,
    ward_ids bigint[] DEFAULT NULL,
    block_numbers integer[] DEFAULT NULL,
    min_app_total integer DEFAULT NULL,
    max_app_total integer DEFAULT NULL,
    sort_by text DEFAULT 'block_asc'
) RETURNS TABLE (
    parcel_id bigint,
    block integer,
    lot integer,
    ext integer,
    parcel_number text,
    parcel_created_at timestamptz,
    parcel_retired_at timestamptz,
    geom geometry,
    cda_neighborhood_id bigint,
    cda_neighborhood_name text,
    cda_neighborhood_group text,
    assessor_neighborhood_id bigint,
    assessor_neighborhood_name text,
    assessor_neighborhood_group text,
    ward_id bigint,
    ward_name text,
    ward_group text,
    ward_census_year integer,
    assessment_id bigint,
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
    land_exempt integer
) LANGUAGE sql STABLE AS $$
    SELECT
        p.id AS parcel_id,
        p.block,
        p.lot,
        p.ext,
        p.parcel_number,
        p.created_at AS parcel_created_at,
        p.retired_at AS parcel_retired_at,
        g.geom,
        cdn.id AS cda_neighborhood_id,
        cdn.name AS cda_neighborhood_name,
        cdn."group" AS cda_neighborhood_group,
        an.id AS assessor_neighborhood_id,
        an.name AS assessor_neighborhood_name,
        an."group" AS assessor_neighborhood_group,
        w.id AS ward_id,
        w.name AS ward_name,
        w."group" AS ward_group,
        w.census_year AS ward_census_year,
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
        INNER JOIN public.geometries g ON p.id = g.parcel_id
        LEFT JOIN LATERAL (
            SELECT
                a.id,
                a.parcel_id,
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
        -- Only do ST_Contains against FILTERED candidate sets (key optimization)
        LEFT JOIN (
            SELECT cda.id, cda.name, cda."group", cda.geom
            FROM public.cda_neighborhoods cda
            WHERE cda_neighborhood_ids IS NULL OR cda.id = ANY(cda_neighborhood_ids)
        ) cdn ON cdn.geom && g.geom AND ST_Contains (cdn.geom, g.geom)
        LEFT JOIN (
            SELECT an.id, an.name, an."group", an.geom
            FROM public.assessor_neighborhoods an
            WHERE assessor_neighborhood_ids IS NULL OR an.id = ANY(assessor_neighborhood_ids)
        ) an ON an.geom && g.geom AND ST_Contains (an.geom, g.geom)
        LEFT JOIN (
            SELECT w.id, w.name, w."group", w.census_year, w.geom
            FROM public.wards w
            WHERE ward_ids IS NULL OR w.id = ANY(ward_ids)
        ) w ON w.geom && g.geom AND ST_Contains (w.geom, g.geom)
    WHERE
        p.retired_at IS NULL
        -- Filter by block numbers if provided (cheap integer comparison)
        AND (
            block_numbers IS NULL
            OR p.block = ANY (block_numbers)
        )
        -- Filter by assessment value (now only checked on candidates, not all data)
        AND (
            min_app_total IS NULL
            OR la.app_total >= min_app_total
        )
        AND (
            max_app_total IS NULL
            OR la.app_total <= max_app_total
        )
    ORDER BY
        CASE sort_by
            WHEN 'block_asc' THEN p.block
            WHEN 'block_desc' THEN -p.block
            WHEN 'app_total_asc' THEN la.app_total
            WHEN 'app_total_desc' THEN -la.app_total
            WHEN 'date_asc' THEN EXTRACT(EPOCH FROM la.date_of_assessment)::bigint
            WHEN 'date_desc' THEN -EXTRACT(EPOCH FROM la.date_of_assessment)::bigint
        END ASC NULLS LAST,
        p.lot ASC NULLS LAST,
        p.ext ASC NULLS LAST;
$$;

COMMENT ON FUNCTION public.parcel_search IS 'Search for parcels by neighborhoods, wards, blocks, and assessment values (optimized). Filters neighborhood IDs FIRST before spatial containment to minimize expensive ST_Contains operations.';
