-- Add frontage and land area snapshot columns to sale_snapshots
ALTER TABLE public.sale_snapshots
ADD COLUMN IF NOT EXISTS snapshot_frontage INTEGER,
ADD COLUMN IF NOT EXISTS snapshot_land_area_sqft INTEGER;

-- Indexes for filtering and sorting on new snapshot fields
CREATE INDEX IF NOT EXISTS sale_snapshots_snapshot_frontage_idx ON public.sale_snapshots (snapshot_frontage);

CREATE INDEX IF NOT EXISTS sale_snapshots_snapshot_land_area_sqft_idx ON public.sale_snapshots (snapshot_land_area_sqft);