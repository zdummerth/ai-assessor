-- Create sale_snapshots table
-- Stores immutable sale-time snapshots and pipeline review metadata

CREATE TABLE
    IF NOT EXISTS public.sale_snapshots (
        -- Sale identity
        sale_id TEXT PRIMARY KEY,
        sale_date TIMESTAMPTZ,
        sale_year INTEGER,
        sale_price INTEGER,
        sale_type TEXT,
        field_review_date TIMESTAMPTZ,

        -- Validity flags (from devnet stable data)
        valid_comp BOOLEAN NOT NULL DEFAULT FALSE,
        valid_ratio BOOLEAN NOT NULL DEFAULT FALSE,
        valid_model BOOLEAN NOT NULL DEFAULT FALSE,

        -- Parcel snapshot
        snapshot_parcels_json JSONB,
        snapshot_number_of_parcels INTEGER,
        snapshot_appraised_total INTEGER,
        snapshot_centroid_x NUMERIC(10, 4),
        snapshot_centroid_y NUMERIC(10, 4),

        -- Residential cost snapshot
        snapshot_res_cost_json JSONB,
        snapshot_number_of_res_structures INTEGER,
        snapshot_struct_rcnld INTEGER,

        -- Residential RFC snapshot
        snapshot_res_rfc_json JSONB,
        snapshot_gross_living_area INTEGER,
        snapshot_first_floor_living_area INTEGER,
        snapshot_second_floor_living_area INTEGER,
        snapshot_third_floor_living_area INTEGER,
        snapshot_half_story_living_area INTEGER,
        snapshot_basement_livable_sqft INTEGER,
        snapshot_basement_unfinished_sqft INTEGER,
        snapshot_attic_livable_sqft INTEGER,
        snapshot_attic_unfinished_sqft INTEGER,
        snapshot_addition_sqft INTEGER,
        snapshot_attached_garage_sqft INTEGER,
        snapshot_detached_garage_sqft INTEGER,
        snapshot_number_of_bedrooms INTEGER,
        snapshot_number_of_bathrooms NUMERIC(4, 1),

        -- Commercial cost snapshot
        snapshot_com_structures_json JSONB,
        snapshot_number_of_com_structures INTEGER,
        snapshot_com_sqft INTEGER,
        snapshot_com_rcn INTEGER,
        snapshot_com_rcnld INTEGER,
        snapshot_com_depreciation INTEGER,

        -- Pipeline metadata
        snapshot_source TEXT CHECK (snapshot_source IN ('auto', 'manual_required')),
        snapshot_reviewed BOOLEAN NOT NULL DEFAULT FALSE,

        -- Audit
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );

-- Indexes for common filtering and ordering
CREATE INDEX IF NOT EXISTS sale_snapshots_sale_date_idx
    ON public.sale_snapshots (sale_date DESC);

CREATE INDEX IF NOT EXISTS sale_snapshots_sale_year_idx
    ON public.sale_snapshots (sale_year);

CREATE INDEX IF NOT EXISTS sale_snapshots_sale_price_idx
    ON public.sale_snapshots (sale_price);

CREATE INDEX IF NOT EXISTS sale_snapshots_sale_type_idx
    ON public.sale_snapshots (sale_type);

CREATE INDEX IF NOT EXISTS sale_snapshots_field_review_date_idx
    ON public.sale_snapshots (field_review_date DESC);

CREATE INDEX IF NOT EXISTS sale_snapshots_source_reviewed_idx
    ON public.sale_snapshots (snapshot_source, snapshot_reviewed);

CREATE INDEX IF NOT EXISTS sale_snapshots_year_date_idx
    ON public.sale_snapshots (sale_year, sale_date DESC);

-- Partial indexes for frequent validity filters
CREATE INDEX IF NOT EXISTS sale_snapshots_valid_comp_true_idx
    ON public.sale_snapshots (sale_date DESC)
    WHERE valid_comp = TRUE;

CREATE INDEX IF NOT EXISTS sale_snapshots_valid_ratio_true_idx
    ON public.sale_snapshots (sale_date DESC)
    WHERE valid_ratio = TRUE;

CREATE INDEX IF NOT EXISTS sale_snapshots_valid_model_true_idx
    ON public.sale_snapshots (sale_date DESC)
    WHERE valid_model = TRUE;

-- GIN indexes for JSON snapshot querying
CREATE INDEX IF NOT EXISTS sale_snapshots_parcels_json_gin_idx
    ON public.sale_snapshots USING GIN (snapshot_parcels_json);

CREATE INDEX IF NOT EXISTS sale_snapshots_res_cost_json_gin_idx
    ON public.sale_snapshots USING GIN (snapshot_res_cost_json);

CREATE INDEX IF NOT EXISTS sale_snapshots_res_rfc_json_gin_idx
    ON public.sale_snapshots USING GIN (snapshot_res_rfc_json);

CREATE INDEX IF NOT EXISTS sale_snapshots_com_structures_json_gin_idx
    ON public.sale_snapshots USING GIN (snapshot_com_structures_json);

-- Enable Row Level Security
ALTER TABLE public.sale_snapshots ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY sale_snapshots_select_policy
    ON public.sale_snapshots
    FOR SELECT
    TO authenticated
    USING (public.authorize('sale_snapshots.read'));

CREATE POLICY sale_snapshots_insert_policy
    ON public.sale_snapshots
    FOR INSERT
    TO authenticated
    WITH CHECK (public.authorize('sale_snapshots.write'));

CREATE POLICY sale_snapshots_update_policy
    ON public.sale_snapshots
    FOR UPDATE
    TO authenticated
    USING (public.authorize('sale_snapshots.write'))
    WITH CHECK (public.authorize('sale_snapshots.write'));

CREATE POLICY sale_snapshots_delete_policy
    ON public.sale_snapshots
    FOR DELETE
    TO authenticated
    USING (public.authorize('sale_snapshots.delete'));

-- Trigger to auto-update updated_at on row updates
CREATE OR REPLACE FUNCTION public.update_sale_snapshots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sale_snapshots_updated_at
    BEFORE UPDATE ON public.sale_snapshots
    FOR EACH ROW
    EXECUTE FUNCTION public.update_sale_snapshots_updated_at();
