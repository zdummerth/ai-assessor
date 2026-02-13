-- Update parcel aggregation functions to include geometry and names from respective tables

-- Drop old function signatures
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_ward(text[], text[]);
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_ward_occupancy(text[], text[]);
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_cda_neighborhood(text[], text[]);
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_assessor_neighborhood(text[], text[]);
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_cda_neighborhood_occupancy(text[], text[]);
DROP FUNCTION IF EXISTS public.parcel_aggregation_by_assessor_neighborhood_occupancy(text[], text[]);

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_ward(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    ward_id bigint,
    ward_name text,
    ward_geom geometry,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.ward,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.ward
)
SELECT
    w.id as ward_id,
    w.name as ward_name,
    w.geom as ward_geom,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.wards w ON a.ward = w.name
ORDER BY w.name;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_ward_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    ward_id bigint,
    ward_name text,
    ward_geom geometry,
    occupancy text,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.ward,
        p.occupancy,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.ward, p.occupancy
)
SELECT
    w.id as ward_id,
    w.name as ward_name,
    w.geom as ward_geom,
    a.occupancy,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.wards w ON a.ward = w.name
ORDER BY w.name, a.occupancy;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_cda_neighborhood(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    cda_neighborhood_id bigint,
    cda_neighborhood_name text,
    cda_neighborhood_geom geometry,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.cda_neighborhood,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.cda_neighborhood
)
SELECT
    cn.id as cda_neighborhood_id,
    cn.name as cda_neighborhood_name,
    cn.geom as cda_neighborhood_geom,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.cda_neighborhoods cn ON a.cda_neighborhood = cn.source_id
ORDER BY cn.name;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_assessor_neighborhood(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    assessor_neighborhood_id bigint,
    assessor_neighborhood_name text,
    assessor_neighborhood_geom geometry,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.assessor_neighborhood,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.assessor_neighborhood
)
SELECT
    an.id as assessor_neighborhood_id,
    an.name as assessor_neighborhood_name,
    an.geom as assessor_neighborhood_geom,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.assessor_neighborhoods an ON a.assessor_neighborhood = an.name
ORDER BY an.name;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_cda_neighborhood_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    cda_neighborhood_id bigint,
    cda_neighborhood_name text,
    cda_neighborhood_geom geometry,
    occupancy text,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.cda_neighborhood,
        p.occupancy,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.cda_neighborhood, p.occupancy
)
SELECT
    cn.id as cda_neighborhood_id,
    cn.name as cda_neighborhood_name,
    cn.geom as cda_neighborhood_geom,
    a.occupancy,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.cda_neighborhoods cn ON a.cda_neighborhood = cn.source_id
ORDER BY cn.name, a.occupancy;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_assessor_neighborhood_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    assessor_neighborhood_id bigint,
    assessor_neighborhood_name text,
    assessor_neighborhood_geom geometry,
    occupancy text,
    parcel_count bigint,
    appraised_sum bigint,
    appraised_median numeric,
    appraised_mean numeric,
    appraised_max integer,
    res_total bigint,
    res_avg numeric,
    com_total bigint,
    com_avg numeric
) AS $$
WITH aggregated AS (
    SELECT
        p.assessor_neighborhood,
        p.occupancy,
        count(*) as parcel_count,
        sum(p.appraised_total) as appraised_sum,
        percentile_cont(0.5) within group (order by p.appraised_total) as appraised_median,
        avg(p.appraised_total)::numeric as appraised_mean,
        max(p.appraised_total) as appraised_max,
        sum(p.appraised_res_improvements + p.appraised_res_land) as res_total,
        avg(p.appraised_res_improvements + p.appraised_res_land)::numeric as res_avg,
        sum(p.appraised_com_improvements + p.appraised_com_land) as com_total,
        avg(p.appraised_com_improvements + p.appraised_com_land)::numeric as com_avg
    FROM public.parcel_search_table p
    WHERE p.is_active = TRUE
        AND p.appraised_total IS NOT NULL
        AND (p_tax_statuses IS NULL OR p.tax_status = ANY(p_tax_statuses))
        AND (p_exclude_property_classes IS NULL OR p.property_class != ALL(p_exclude_property_classes))
    GROUP BY p.assessor_neighborhood, p.occupancy
)
SELECT
    an.id as assessor_neighborhood_id,
    an.name as assessor_neighborhood_name,
    an.geom as assessor_neighborhood_geom,
    a.occupancy,
    a.parcel_count,
    a.appraised_sum,
    a.appraised_median,
    a.appraised_mean,
    a.appraised_max,
    a.res_total,
    a.res_avg,
    a.com_total,
    a.com_avg
FROM aggregated a
RIGHT JOIN public.assessor_neighborhoods an ON a.assessor_neighborhood = an.name
ORDER BY an.name, a.occupancy;
$$ LANGUAGE sql STABLE;
