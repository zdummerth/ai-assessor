-- Enable pg_trgm extension for similarity searches
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Add normalized columns for better matching
ALTER TABLE public.addresses
ADD COLUMN IF NOT EXISTS street_norm text,
ADD COLUMN IF NOT EXISTS number_norm text,
ADD COLUMN IF NOT EXISTS city_norm text;

-- Create function to normalize street names (uppercase, trim)
CREATE OR REPLACE FUNCTION normalize_street(street_text text)
RETURNS text AS $$
BEGIN
  RETURN UPPER(TRIM(street_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to normalize numbers (remove leading zeros, trim)
CREATE OR REPLACE FUNCTION normalize_number(number_text text)
RETURNS text AS $$
BEGIN
  RETURN TRIM(LEADING '0' FROM TRIM(number_text));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Populate normalized columns
UPDATE public.addresses
SET street_norm = normalize_street(street),
    number_norm = normalize_number(number),
    city_norm = normalize_street(city)
WHERE street_norm IS NULL OR number_norm IS NULL OR city_norm IS NULL;

-- Create trigger to auto-normalize on insert/update
CREATE OR REPLACE FUNCTION trigger_normalize_address()
RETURNS TRIGGER AS $$
BEGIN
  NEW.street_norm := normalize_street(NEW.street);
  NEW.number_norm := normalize_number(NEW.number);
  NEW.city_norm := normalize_street(NEW.city);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER normalize_address_trigger
BEFORE INSERT OR UPDATE ON public.addresses
FOR EACH ROW
EXECUTE FUNCTION trigger_normalize_address();

-- Create trigram indexes for fuzzy matching across fields
CREATE INDEX IF NOT EXISTS addresses_street_norm_trgm_idx 
ON public.addresses USING gin (street_norm gin_trgm_ops);

CREATE INDEX IF NOT EXISTS addresses_number_norm_trgm_idx 
ON public.addresses USING gin (number_norm gin_trgm_ops);

CREATE INDEX IF NOT EXISTS addresses_city_norm_trgm_idx 
ON public.addresses USING gin (city_norm gin_trgm_ops);

CREATE INDEX IF NOT EXISTS addresses_postcode_trgm_idx 
ON public.addresses USING gin (postcode gin_trgm_ops);

CREATE INDEX IF NOT EXISTS addresses_unit_trgm_idx 
ON public.addresses USING gin (unit gin_trgm_ops);

-- Create composite index for number + postcode combinations
CREATE INDEX IF NOT EXISTS addresses_number_postcode_idx 
ON public.addresses (number_norm, postcode) 
WHERE number_norm IS NOT NULL AND postcode IS NOT NULL;

COMMENT ON INDEX public.addresses_street_norm_trgm_idx IS 'Trigram index for fuzzy street name matching';
COMMENT ON INDEX public.addresses_number_norm_trgm_idx IS 'Trigram index for fuzzy number matching';
COMMENT ON INDEX public.addresses_city_norm_trgm_idx IS 'Trigram index for fuzzy city matching';
COMMENT ON INDEX public.addresses_postcode_trgm_idx IS 'Trigram index for fuzzy postcode matching';
COMMENT ON INDEX public.addresses_unit_trgm_idx IS 'Trigram index for fuzzy unit matching';
COMMENT ON INDEX public.addresses_number_postcode_idx IS 'Composite index for number + postcode lookups';

-- Create address search function with similarity across all fields and optional exact filters
CREATE OR REPLACE FUNCTION public.search_addresses(
  search_text text DEFAULT NULL,
  exact_number text DEFAULT NULL,
  exact_postcode text DEFAULT NULL,
  exact_street text DEFAULT NULL,
  similarity_threshold float DEFAULT 0.3,
  max_results int DEFAULT 20
)
RETURNS TABLE (
  id bigint,
  hash text,
  number text,
  street text,
  unit text,
  city text,
  district text,
  region text,
  postcode text,
  openaddresses_id text,
  accuracy text,
  geom geometry,
  similarity_score double precision
) AS $$
DECLARE
  norm_search_text text;
  norm_exact_number text;
  norm_exact_street text;
BEGIN
  -- Normalize inputs
  norm_search_text := UPPER(TRIM(search_text));
  norm_exact_number := normalize_number(exact_number);
  norm_exact_street := normalize_street(exact_street);

  RETURN QUERY
  SELECT 
    a.id,
    a.hash,
    a.number,
    a.street,
    a.unit,
    a.city,
    a.district,
    a.region,
    a.postcode,
    a.openaddresses_id,
    a.accuracy,
    a.geom,
    CASE 
      WHEN norm_search_text IS NOT NULL THEN 
        GREATEST(
          similarity(COALESCE(a.number_norm, ''), norm_search_text),
          similarity(COALESCE(a.street_norm, ''), norm_search_text),
          similarity(COALESCE(a.unit, ''), norm_search_text),
          similarity(COALESCE(a.city_norm, ''), norm_search_text),
          similarity(COALESCE(a.postcode, ''), norm_search_text)
        )::double precision
      ELSE 0.0::double precision
    END AS similarity_score
  FROM public.addresses a
  WHERE 
    -- Apply exact filters if provided
    (exact_number IS NULL OR a.number_norm = norm_exact_number)
    AND (exact_postcode IS NULL OR a.postcode = exact_postcode)
    AND (exact_street IS NULL OR a.street_norm = norm_exact_street)
    -- Apply fuzzy match across fields if provided
    AND (
      norm_search_text IS NULL 
      OR a.number_norm % norm_search_text
      OR a.street_norm % norm_search_text
      OR a.unit % norm_search_text
      OR a.city_norm % norm_search_text
      OR a.postcode % norm_search_text
    )
    -- Filter by similarity threshold
    AND (
      norm_search_text IS NULL
      OR GREATEST(
        similarity(COALESCE(a.number_norm, ''), norm_search_text),
        similarity(COALESCE(a.street_norm, ''), norm_search_text),
        similarity(COALESCE(a.unit, ''), norm_search_text),
        similarity(COALESCE(a.city_norm, ''), norm_search_text),
        similarity(COALESCE(a.postcode, ''), norm_search_text)
      ) >= similarity_threshold
    )
  ORDER BY 
    similarity_score DESC,
    a.id ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.search_addresses IS 'Search addresses with trigram similarity across number, street, unit, city, and postcode. Optional exact filters for number, postcode, or street. Returns ranked results.';

-- Example usage:
-- Search across all fields: SELECT * FROM search_addresses(search_text := 'WINNEBAGO');
-- Search for postcode: SELECT * FROM search_addresses(search_text := '63116');
-- Search for number: SELECT * FROM search_addresses(search_text := '3653');
-- Exact number + fuzzy search: SELECT * FROM search_addresses(search_text := 'WINNEBAGO', exact_number := '3653');
-- Exact postcode + fuzzy search: SELECT * FROM search_addresses(search_text := 'WINNEBAGO', exact_postcode := '63116');
-- Exact street (no fuzzy): SELECT * FROM search_addresses(exact_street := 'WINNEBAGO ST', exact_postcode := '63116');
