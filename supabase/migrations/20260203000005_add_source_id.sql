-- Add source_id column to neighborhood and wards tables to track original IDs
ALTER TABLE public.assessor_neighborhoods
ADD COLUMN IF NOT EXISTS source_id text UNIQUE;

ALTER TABLE public.cda_neighborhoods
ADD COLUMN IF NOT EXISTS source_id text UNIQUE;

ALTER TABLE public.wards
ADD COLUMN IF NOT EXISTS source_id text UNIQUE;

COMMENT ON COLUMN public.assessor_neighborhoods.source_id IS 'Original ID from source data';

COMMENT ON COLUMN public.cda_neighborhoods.source_id IS 'Original ID from source data';

COMMENT ON COLUMN public.wards.source_id IS 'Original ID from source data';

-- Create indexes on source_id for lookups
CREATE INDEX IF NOT EXISTS assessor_neighborhoods_source_id_idx ON public.assessor_neighborhoods (source_id);

CREATE INDEX IF NOT EXISTS cda_neighborhoods_source_id_idx ON public.cda_neighborhoods (source_id);

CREATE INDEX IF NOT EXISTS wards_source_id_idx ON public.wards (source_id);