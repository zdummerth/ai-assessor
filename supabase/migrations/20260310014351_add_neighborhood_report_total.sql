ALTER TABLE public.neighborhood_report
ADD COLUMN IF NOT EXISTS total integer;

-- Align table types with nbd_report_typed dataframe casting
ALTER TABLE public.neighborhood_report
ALTER COLUMN ea TYPE integer USING NULLIF(trim(ea::text), '')::integer;

ALTER TABLE public.neighborhood_report
ALTER COLUMN occupancy TYPE integer USING NULLIF(trim(occupancy::text), '')::integer;

ALTER TABLE public.neighborhood_report
ALTER COLUMN story TYPE numeric USING NULLIF(trim(story::text), '')::numeric;

ALTER TABLE public.neighborhood_report
ALTER COLUMN funct TYPE numeric USING NULLIF(trim(funct::text), '')::numeric;

ALTER TABLE public.neighborhood_report
ALTER COLUMN econ TYPE numeric USING NULLIF(trim(econ::text), '')::numeric;