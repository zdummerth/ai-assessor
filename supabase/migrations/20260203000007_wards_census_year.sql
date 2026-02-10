-- Add census_year column to wards and create composite unique constraint
ALTER TABLE public.wards
ADD COLUMN IF NOT EXISTS census_year integer;

-- Add unique constraint on name and census_year combination
ALTER TABLE public.wards ADD CONSTRAINT wards_name_census_year_unique UNIQUE (name, census_year);

COMMENT ON COLUMN public.wards.census_year IS 'Census year for this ward boundary';