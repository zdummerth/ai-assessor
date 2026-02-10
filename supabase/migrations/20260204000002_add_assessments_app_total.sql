-- Add app_total generated column to assessments table
-- app_total is the sum of app building and land values (excluding new construction and exempt)
ALTER TABLE public.assessments
ADD COLUMN app_total integer GENERATED ALWAYS AS (
    COALESCE(app_bldg_agriculture, 0) + COALESCE(app_bldg_commercial, 0) + COALESCE(app_bldg_residential, 0) + COALESCE(app_land_agriculture, 0) + COALESCE(app_land_commercial, 0) + COALESCE(app_land_residential, 0)
) STORED;

COMMENT ON COLUMN public.assessments.app_total IS 'Total appraised value: sum of appraised building and land values (agriculture, commercial, residential)';

-- Create index for app_total filtering and sorting
CREATE INDEX assessments_app_total_idx ON public.assessments (app_total)
WHERE
    app_total IS NOT NULL;