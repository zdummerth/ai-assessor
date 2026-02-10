-- Create parcel_search RPC function for filtering parcels by neighborhoods, wards, and blocks
-- Accepts optional arrays for: cda_neighborhood_ids, assessor_neighborhood_ids, ward_ids, block_numbers
-- Uses PostGIS spatial operations to check if parcel geometry is contained within neighborhood/ward geometry
-- Returns all parcel, geometry, neighborhood, and ward data for authorized users

CREATE OR REPLACE FUNCTION public.parcel_search (
    cda_neighborhood_ids bigint[] DEFAULT NULL,
    assessor_neighborhood_ids bigint[] DEFAULT NULL,
    ward_ids bigint[] DEFAULT NULL,
    block_numbers integer[] DEFAULT NULL
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
    ward_census_year integer
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
    w.census_year AS ward_census_year
FROM
    public.parcels p
    INNER JOIN public.geometries g ON p.id = g.parcel_id
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
$$;

COMMENT ON FUNCTION public.parcel_search IS 'Search for parcels by neighborhoods, wards, and block numbers. Uses PostGIS spatial containment to match parcel geometries against neighborhood and ward boundaries.';
