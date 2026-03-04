-- Create normalized snapshot child tables for sale_snapshots
-- ---------------------------------------------------------------------------
-- Parcel-level snapshot rows
-- ---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS public.sale_snapshot_parcels (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sale_id TEXT NOT NULL REFERENCES public.sale_snapshots (sale_id) ON DELETE CASCADE,
        parcel_id TEXT NOT NULL,
        property_class TEXT,
        occupancy TEXT,
        tax_status TEXT,
        taxcode TEXT,
        class_code TEXT,
        ward INTEGER,
        cda INTEGER,
        assessor_neighborhood INTEGER,
        site_address TEXT,
        frontage_sqft INTEGER,
        land_area_sqft INTEGER,
        appraised_total INTEGER,
        centroid_x NUMERIC(10, 4),
        centroid_y NUMERIC(10, 4),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        UNIQUE (sale_id, parcel_id)
    );

-- ---------------------------------------------------------------------------
-- Residential cost snapshot rows
-- ---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS public.sale_snapshot_res_cost (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sale_id TEXT NOT NULL REFERENCES public.sale_snapshots (sale_id) ON DELETE CASCADE,
        parcel_id TEXT NOT NULL,
        structure_name TEXT NOT NULL,
        condition TEXT,
        condition_score INTEGER,
        year_built INTEGER,
        eff_year_build INTEGER,
        base_material TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

-- ---------------------------------------------------------------------------
-- Residential RFC snapshot rows
-- ---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS public.sale_snapshot_res_rfc (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sale_id TEXT NOT NULL REFERENCES public.sale_snapshots (sale_id) ON DELETE CASCADE,
        parcel_id TEXT NOT NULL,
        structure_type TEXT NOT NULL,
        number_of_stories NUMERIC(3, 1),
        gross_living_area INTEGER,
        first_floor_living_area INTEGER,
        second_floor_living_area INTEGER,
        third_floor_living_area INTEGER,
        half_story_living_area INTEGER,
        basement_livable_sqft INTEGER,
        basement_unfinished_sqft INTEGER,
        attic_livable_sqft INTEGER,
        attic_unfinished_sqft INTEGER,
        addition_sqft INTEGER,
        addition_material TEXT,
        attached_garage_sqft INTEGER,
        detached_garage_sqft INTEGER,
        number_of_bedrooms INTEGER,
        number_of_bathrooms NUMERIC(4, 1),
        created_at TIMESTAMPTZ NOT NULL DEFAULT now ()
    );

-- ---------------------------------------------------------------------------
-- Commercial cost snapshot rows
-- ---------------------------------------------------------------------------
CREATE TABLE
    IF NOT EXISTS public.sale_snapshot_com_cost (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
        sale_id TEXT NOT NULL REFERENCES public.sale_snapshots (sale_id) ON DELETE CASCADE,
        parcel_id TEXT NOT NULL,
        structure_id TEXT NOT NULL,
        structure TEXT,
        structure_category TEXT,
        structure_type TEXT,
        year_built INTEGER,
        effective_age INTEGER,
        number_of_sections INTEGER,
        sqft INTEGER,
        rcn INTEGER,
        rcnld INTEGER,
        depreciation INTEGER,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now (),
        UNIQUE (sale_id, parcel_id, structure_id)
    );

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
-- Core FK/join indexes
CREATE INDEX IF NOT EXISTS sale_snapshot_parcels_sale_id_idx ON public.sale_snapshot_parcels (sale_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_cost_sale_id_idx ON public.sale_snapshot_res_cost (sale_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_rfc_sale_id_idx ON public.sale_snapshot_res_rfc (sale_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_com_cost_sale_id_idx ON public.sale_snapshot_com_cost (sale_id);

-- Common parcel+sale join path
CREATE INDEX IF NOT EXISTS sale_snapshot_parcels_sale_parcel_idx ON public.sale_snapshot_parcels (sale_id, parcel_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_cost_sale_parcel_idx ON public.sale_snapshot_res_cost (sale_id, parcel_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_rfc_sale_parcel_idx ON public.sale_snapshot_res_rfc (sale_id, parcel_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_com_cost_sale_parcel_idx ON public.sale_snapshot_com_cost (sale_id, parcel_id);

-- Filter-oriented indexes for common analytics queries
CREATE INDEX IF NOT EXISTS sale_snapshot_parcels_neighborhood_idx ON public.sale_snapshot_parcels (assessor_neighborhood);

CREATE INDEX IF NOT EXISTS sale_snapshot_parcels_neighborhood_sale_idx ON public.sale_snapshot_parcels (assessor_neighborhood, sale_id);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_cost_condition_score_idx ON public.sale_snapshot_res_cost (condition_score);

CREATE INDEX IF NOT EXISTS sale_snapshot_res_rfc_gross_living_area_idx ON public.sale_snapshot_res_rfc (gross_living_area);

CREATE INDEX IF NOT EXISTS sale_snapshot_com_cost_sqft_idx ON public.sale_snapshot_com_cost (sqft);

-- ---------------------------------------------------------------------------
-- RLS + policies (reuse sale_snapshots permissions)
-- ---------------------------------------------------------------------------
ALTER TABLE public.sale_snapshot_parcels ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sale_snapshot_res_cost ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sale_snapshot_res_rfc ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.sale_snapshot_com_cost ENABLE ROW LEVEL SECURITY;

CREATE POLICY sale_snapshot_parcels_select_policy ON public.sale_snapshot_parcels FOR
SELECT
    TO authenticated USING (public.authorize ('sale_snapshots.read'));

CREATE POLICY sale_snapshot_parcels_insert_policy ON public.sale_snapshot_parcels FOR INSERT TO authenticated
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_parcels_update_policy ON public.sale_snapshot_parcels FOR
UPDATE TO authenticated USING (public.authorize ('sale_snapshots.write'))
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_parcels_delete_policy ON public.sale_snapshot_parcels FOR DELETE TO authenticated USING (public.authorize ('sale_snapshots.delete'));

CREATE POLICY sale_snapshot_res_cost_select_policy ON public.sale_snapshot_res_cost FOR
SELECT
    TO authenticated USING (public.authorize ('sale_snapshots.read'));

CREATE POLICY sale_snapshot_res_cost_insert_policy ON public.sale_snapshot_res_cost FOR INSERT TO authenticated
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_res_cost_update_policy ON public.sale_snapshot_res_cost FOR
UPDATE TO authenticated USING (public.authorize ('sale_snapshots.write'))
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_res_cost_delete_policy ON public.sale_snapshot_res_cost FOR DELETE TO authenticated USING (public.authorize ('sale_snapshots.delete'));

CREATE POLICY sale_snapshot_res_rfc_select_policy ON public.sale_snapshot_res_rfc FOR
SELECT
    TO authenticated USING (public.authorize ('sale_snapshots.read'));

CREATE POLICY sale_snapshot_res_rfc_insert_policy ON public.sale_snapshot_res_rfc FOR INSERT TO authenticated
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_res_rfc_update_policy ON public.sale_snapshot_res_rfc FOR
UPDATE TO authenticated USING (public.authorize ('sale_snapshots.write'))
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_res_rfc_delete_policy ON public.sale_snapshot_res_rfc FOR DELETE TO authenticated USING (public.authorize ('sale_snapshots.delete'));

CREATE POLICY sale_snapshot_com_cost_select_policy ON public.sale_snapshot_com_cost FOR
SELECT
    TO authenticated USING (public.authorize ('sale_snapshots.read'));

CREATE POLICY sale_snapshot_com_cost_insert_policy ON public.sale_snapshot_com_cost FOR INSERT TO authenticated
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_com_cost_update_policy ON public.sale_snapshot_com_cost FOR
UPDATE TO authenticated USING (public.authorize ('sale_snapshots.write'))
WITH
    CHECK (public.authorize ('sale_snapshots.write'));

CREATE POLICY sale_snapshot_com_cost_delete_policy ON public.sale_snapshot_com_cost FOR DELETE TO authenticated USING (public.authorize ('sale_snapshots.delete'));