-- Convert string-encoded JSONB values in batches
-- This migration adds helper functions to safely convert double-encoded JSON strings
-- to real JSONB without long-running full-table updates.

CREATE OR REPLACE FUNCTION public.try_parse_jsonb(p_text text)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN p_text::jsonb;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.convert_cost_json_batch(p_batch_size integer DEFAULT 5000)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_rows integer := 0;
BEGIN
  WITH batch AS (
    SELECT ctid
    FROM public.parcel_search_table
    WHERE cost_json IS NOT NULL
      AND jsonb_typeof(cost_json) = 'string'
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  parsed AS (
    SELECT
      t.ctid,
      public.try_parse_jsonb(t.cost_json #>> '{}') AS parsed_json
    FROM public.parcel_search_table t
    INNER JOIN batch b ON b.ctid = t.ctid
  )
  UPDATE public.parcel_search_table t
  SET cost_json = p.parsed_json
  FROM parsed p
  WHERE t.ctid = p.ctid
    AND p.parsed_json IS NOT NULL;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.convert_res_cost_json_batch(p_batch_size integer DEFAULT 5000)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_rows integer := 0;
BEGIN
  WITH batch AS (
    SELECT ctid
    FROM public.sales_summary
    WHERE res_cost_json IS NOT NULL
      AND jsonb_typeof(res_cost_json) = 'string'
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  parsed AS (
    SELECT
      t.ctid,
      public.try_parse_jsonb(t.res_cost_json #>> '{}') AS parsed_json
    FROM public.sales_summary t
    INNER JOIN batch b ON b.ctid = t.ctid
  )
  UPDATE public.sales_summary t
  SET res_cost_json = p.parsed_json
  FROM parsed p
  WHERE t.ctid = p.ctid
    AND p.parsed_json IS NOT NULL;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

CREATE OR REPLACE FUNCTION public.convert_parcels_json_batch(p_batch_size integer DEFAULT 5000)
RETURNS integer
LANGUAGE plpgsql
AS $$
DECLARE
  v_rows integer := 0;
BEGIN
  WITH batch AS (
    SELECT ctid
    FROM public.sales_summary
    WHERE parcels_json IS NOT NULL
      AND jsonb_typeof(parcels_json) = 'string'
    LIMIT p_batch_size
    FOR UPDATE SKIP LOCKED
  ),
  parsed AS (
    SELECT
      t.ctid,
      public.try_parse_jsonb(t.parcels_json #>> '{}') AS parsed_json
    FROM public.sales_summary t
    INNER JOIN batch b ON b.ctid = t.ctid
  )
  UPDATE public.sales_summary t
  SET parcels_json = p.parsed_json
  FROM parsed p
  WHERE t.ctid = p.ctid
    AND p.parsed_json IS NOT NULL;

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

COMMENT ON FUNCTION public.try_parse_jsonb(text)
IS 'Safely parse text into JSONB, returning NULL for invalid JSON.';

COMMENT ON FUNCTION public.convert_cost_json_batch(integer)
IS 'Convert parcel_search_table.cost_json from JSON strings to JSONB in bounded batches; returns rows updated.';

COMMENT ON FUNCTION public.convert_res_cost_json_batch(integer)
IS 'Convert sales_summary.res_cost_json from JSON strings to JSONB in bounded batches; returns rows updated.';

COMMENT ON FUNCTION public.convert_parcels_json_batch(integer)
IS 'Convert sales_summary.parcels_json from JSON strings to JSONB in bounded batches; returns rows updated.';
