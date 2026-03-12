ALTER TABLE public.neighborhood_report
ADD COLUMN IF NOT EXISTS address_id text,
ADD COLUMN IF NOT EXISTS tiger_address text,
ADD COLUMN IF NOT EXISTS geom geometry (Point, 4326);

CREATE INDEX IF NOT EXISTS neighborhood_report_address_id_idx ON public.neighborhood_report (address_id);

CREATE INDEX IF NOT EXISTS neighborhood_report_geom_idx ON public.neighborhood_report USING GIST (geom)
WHERE
    geom IS NOT NULL;