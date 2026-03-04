-- Add derived pricing and ratio metrics to sale_snapshots
ALTER TABLE public.sale_snapshots
ADD COLUMN IF NOT EXISTS snapshot_price_per_res_living_sqft NUMERIC(12, 2)
	GENERATED ALWAYS AS (
		CASE
			WHEN sale_price IS NOT NULL
				 AND snapshot_gross_living_area IS NOT NULL
				 AND snapshot_gross_living_area > 0
			THEN ROUND(sale_price::NUMERIC / snapshot_gross_living_area::NUMERIC, 2)
			ELSE NULL
		END
	) STORED,
ADD COLUMN IF NOT EXISTS snapshot_price_per_com_sqft NUMERIC(12, 2)
	GENERATED ALWAYS AS (
		CASE
			WHEN sale_price IS NOT NULL
				 AND snapshot_com_sqft IS NOT NULL
				 AND snapshot_com_sqft > 0
			THEN ROUND(sale_price::NUMERIC / snapshot_com_sqft::NUMERIC, 2)
			ELSE NULL
		END
	) STORED,
ADD COLUMN IF NOT EXISTS snapshot_land_to_building_ratio NUMERIC(12, 4)
	GENERATED ALWAYS AS (
		CASE
			WHEN snapshot_land_area_sqft IS NOT NULL
				 AND (COALESCE(snapshot_gross_living_area, 0) + COALESCE(snapshot_com_sqft, 0)) > 0
			THEN ROUND(
				snapshot_land_area_sqft::NUMERIC /
				(COALESCE(snapshot_gross_living_area, 0) + COALESCE(snapshot_com_sqft, 0))::NUMERIC,
				4
			)
			ELSE NULL
		END
	) STORED;

-- Indexes for filtering/sorting on derived metrics
CREATE INDEX IF NOT EXISTS sale_snapshots_price_per_res_living_sqft_idx ON public.sale_snapshots (snapshot_price_per_res_living_sqft);

CREATE INDEX IF NOT EXISTS sale_snapshots_price_per_com_sqft_idx ON public.sale_snapshots (snapshot_price_per_com_sqft);

CREATE INDEX IF NOT EXISTS sale_snapshots_land_to_building_ratio_idx ON public.sale_snapshots (snapshot_land_to_building_ratio);