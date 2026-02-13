-- Add indexes to optimize joins between parcel_search_table and geometry tables
-- These indexes support the name-based joins in the aggregation functions
-- Purpose: Optimize join between parcel_search_table and wards on name
CREATE INDEX IF NOT EXISTS wards_name_idx ON public.wards (name);

-- Purpose: Optimize join between parcel_search_table and cda_neighborhoods on name
CREATE INDEX IF NOT EXISTS cda_neighborhoods_name_idx ON public.cda_neighborhoods (name);

-- Purpose: Optimize join between parcel_search_table and assessor_neighborhoods on name
CREATE INDEX IF NOT EXISTS assessor_neighborhoods_name_idx ON public.assessor_neighborhoods (name);