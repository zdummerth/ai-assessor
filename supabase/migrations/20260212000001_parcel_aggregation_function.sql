-- Create specific aggregation functions for parcel data
-- Each function groups by different dimensions and supports filtering by multiple tax statuses and property classes

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_ward(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    ward text,
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
SELECT
    ward,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY ward
ORDER BY ward;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_ward_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    ward text,
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
SELECT
    ward,
    occupancy,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY ward, occupancy
ORDER BY ward, occupancy;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_cda_neighborhood(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    cda_neighborhood text,
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
SELECT
    cda_neighborhood,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY cda_neighborhood
ORDER BY cda_neighborhood;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_assessor_neighborhood(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    assessor_neighborhood text,
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
SELECT
    assessor_neighborhood,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY assessor_neighborhood
ORDER BY assessor_neighborhood;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_cda_neighborhood_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    cda_neighborhood text,
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
SELECT
    cda_neighborhood,
    occupancy,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY cda_neighborhood, occupancy
ORDER BY cda_neighborhood, occupancy;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.parcel_aggregation_by_assessor_neighborhood_occupancy(
    p_tax_statuses text[] DEFAULT NULL,
    p_exclude_property_classes text[] DEFAULT NULL
)
RETURNS TABLE (
    assessor_neighborhood text,
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
SELECT
    assessor_neighborhood,
    occupancy,
    count(*) as parcel_count,
    sum(appraised_total) as appraised_sum,
    percentile_cont(0.5) within group (order by appraised_total) as appraised_median,
    avg(appraised_total)::numeric as appraised_mean,
    max(appraised_total) as appraised_max,
    sum(appraised_res_improvements + appraised_res_land) as res_total,
    avg(appraised_res_improvements + appraised_res_land)::numeric as res_avg,
    sum(appraised_com_improvements + appraised_com_land) as com_total,
    avg(appraised_com_improvements + appraised_com_land)::numeric as com_avg
FROM public.parcel_search_table
WHERE is_active = TRUE
    AND appraised_total IS NOT NULL
    AND (p_tax_statuses IS NULL OR tax_status = ANY(p_tax_statuses))
    AND (p_exclude_property_classes IS NULL OR property_class != ALL(p_exclude_property_classes))
GROUP BY assessor_neighborhood, occupancy
ORDER BY assessor_neighborhood, occupancy;
$$ LANGUAGE sql STABLE;
