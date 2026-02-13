-- Add indexes to optimize parcel aggregation queries
-- These indexes support grouping by ward, cda_neighborhoods, and assessor_neighborhoods
-- with filtering on is_active, tax_status, property_class, and appraised_total
-- Purpose: Optimize queries grouping by ward with filters on is_active, tax_status, property_class
-- Column order: is_active (=), tax_status (=), property_class (!=), ward (GROUP BY)
-- Includes residential and commercial columns for SELECT clause calculations
CREATE INDEX parcel_search_table_ward_aggregation_idx ON public.parcel_search_table (
    is_active,
    tax_status,
    property_class,
    ward,
    appraised_total,
    appraised_res_improvements,
    appraised_res_land,
    appraised_com_improvements,
    appraised_com_land
)
WHERE
    is_active = TRUE
    AND appraised_total IS NOT NULL;

-- Purpose: Optimize queries grouping by cda_neighborhoods with same filters
-- Column order: is_active (=), tax_status (=), property_class (!=), cda_neighborhoods (GROUP BY)
-- Includes residential and commercial columns for SELECT clause calculations
CREATE INDEX parcel_search_table_cda_neighborhood_aggregation_idx ON public.parcel_search_table (
    is_active,
    tax_status,
    property_class,
    cda_neighborhood,
    appraised_total,
    appraised_res_improvements,
    appraised_res_land,
    appraised_com_improvements,
    appraised_com_land
)
WHERE
    is_active = TRUE
    AND appraised_total IS NOT NULL;

-- Purpose: Optimize queries grouping by assessor_neighborhoods with same filters
-- Column order: is_active (=), tax_status (=), property_class (!=), assessor_neighborhoods (GROUP BY)
-- Includes residential and commercial columns for SELECT clause calculations
CREATE INDEX parcel_search_table_assessor_neighborhood_aggregation_idx ON public.parcel_search_table (
    is_active,
    tax_status,
    property_class,
    assessor_neighborhood,
    appraised_total,
    appraised_res_improvements,
    appraised_res_land,
    appraised_com_improvements,
    appraised_com_land
)
WHERE
    is_active = TRUE
    AND appraised_total IS NOT NULL;

-- Purpose: Support occupancy breakdown queries (ward + occupancy aggregation)
-- Column order: is_active (=), tax_status (=), property_class (!=), ward, occupancy (GROUP BY)
-- Includes residential and commercial columns for SELECT clause calculations
CREATE INDEX parcel_search_table_ward_occupancy_aggregation_idx ON public.parcel_search_table (
    is_active,
    tax_status,
    property_class,
    ward,
    occupancy,
    appraised_total,
    appraised_res_improvements,
    appraised_res_land,
    appraised_com_improvements,
    appraised_com_land
)
WHERE
    is_active = TRUE
    AND appraised_total IS NOT NULL;