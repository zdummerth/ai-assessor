-- Update parcel_search to include most recent assessment data and app_total filters
-- Adds min_app_total, max_app_total filters and sort_by parameter
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
) LANGUAGE plpgsql STABLE AS $$
BEGIN
    RETURN QUERY
    WITH latest_assessments AS (
        SELECT DISTINCT ON (a.parcel_id)
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
        ORDER BY
            a.parcel_id,
            a.date_of_assessment DESC NULLS LAST,
            a.id DESC
    )
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
        LEFT JOIN latest_assessments la ON p.id = la.parcel_id
        LEFT JOIN public.cda_neighborhoods cdn ON ST_Contains (cdn.geom, g.geom)
        LEFT JOIN public.assessor_neighborhoods an ON ST_Contains (an.geom, g.geom)
        LEFT JOIN public.wards w ON ST_Contains (w.geom, g.geom)
    WHERE
        p.retired_at IS NULL
        -- Filter by block numbers if provided
        AND (
            block_numbers IS NULL
            OR p.block = ANY (block_numbers)
        )
        -- Filter by CDA neighborhoods if provided
        AND (
            cda_neighborhood_ids IS NULL
            OR cdn.id = ANY (cda_neighborhood_ids)
        )
        -- Filter by assessor neighborhoods if provided
        AND (
            assessor_neighborhood_ids IS NULL
            OR an.id = ANY (assessor_neighborhood_ids)
        )
        -- Filter by wards if provided
        AND (
            ward_ids IS NULL
            OR w.id = ANY (ward_ids)
        )
        -- Filter by minimum app_total
        AND (
            min_app_total IS NULL
            OR la.app_total >= min_app_total
        )
        -- Filter by maximum app_total
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
END;
$$;

COMMENT ON FUNCTION public.parcel_search IS 'Search for parcels by neighborhoods, wards, blocks, and assessment values. Returns most recent assessment for each parcel. Uses PostGIS spatial containment. Supports sorting by block, app_total, or assessment date.';
