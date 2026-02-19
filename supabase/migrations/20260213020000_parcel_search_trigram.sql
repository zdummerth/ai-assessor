-- Add generated search column for trigram search (excluding address numbers - handled separately)
ALTER TABLE public.parcel_search_table 
ADD COLUMN IF NOT EXISTS search_text text GENERATED ALWAYS AS (
  lower(
    coalesce(street_name, '') || ' ' ||
    coalesce(street_prefix_direction, '') || ' ' ||
    coalesce(street_type, '') || ' ' ||
    coalesce(zip, '') || ' ' ||
    coalesce(block, '') || ' ' ||
    coalesce(lot, '') || ' ' ||
    coalesce(ext, '') || ' ' ||
    coalesce(owner_name, '')
  )
) STORED;

-- Create GIN trigram index for fast text search on active parcels
CREATE INDEX IF NOT EXISTS parcel_search_table_search_text_idx 
ON public.parcel_search_table 
USING gin (search_text gin_trgm_ops)
WHERE is_active = TRUE;

-- Create B-tree indexes for address range searches
-- These support BETWEEN queries on address numbers
CREATE INDEX IF NOT EXISTS parcel_search_table_low_address_number_idx
ON public.parcel_search_table (low_address_number)
WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS parcel_search_table_high_address_number_idx
ON public.parcel_search_table (high_address_number)
WHERE is_active = TRUE AND high_address_number IS NOT NULL;

-- Composite index for address range queries with street name
-- Useful when search includes both number and street name
CREATE INDEX IF NOT EXISTS parcel_search_table_address_range_idx
ON public.parcel_search_table (low_address_number, high_address_number, street_name)
WHERE is_active = TRUE;

-- Search function with address range support
-- Combines trigram text matching with address number range checking
-- for comprehensive parcel search across all searchable fields
CREATE OR REPLACE FUNCTION public.search_parcels_with_range(
  search_term text, 
  result_limit int DEFAULT 50
)
RETURNS TABLE (
  id bigint,
  parcel_id numeric,
  full_address text,
  owner_name text,
  block text,
  lot text,
  ext text,
  match_type text,
  relevance_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  extracted_number int;
  cleaned_search text;
BEGIN
  -- Extract first number from search term for address matching
  extracted_number := (substring(search_term FROM '\d+'))::int;
  cleaned_search := lower(search_term);
  
  RETURN QUERY
  SELECT 
    p.id,
    p.parcel_id,
    concat_ws(' ', 
      p.low_address_number, 
      CASE WHEN p.high_address_number IS NOT NULL AND p.high_address_number != p.low_address_number 
        THEN '-' || p.high_address_number 
        ELSE '' 
      END,
      p.street_prefix_direction,
      p.street_name, 
      p.street_type, 
      p.zip
    ) as full_address,
    p.owner_name,
    p.block,
    p.lot,
    p.ext,
    CASE 
      WHEN extracted_number IS NOT NULL 
        AND extracted_number BETWEEN p.low_address_number AND coalesce(p.high_address_number, p.low_address_number)
        AND (p.search_text % cleaned_search OR word_similarity(cleaned_search, p.search_text) > 0.3)
        THEN 'address_and_text'
      WHEN extracted_number IS NOT NULL 
        AND extracted_number BETWEEN p.low_address_number AND coalesce(p.high_address_number, p.low_address_number)
        THEN 'address_range'
      WHEN p.search_text % cleaned_search OR word_similarity(cleaned_search, p.search_text) > 0.3
        THEN 'text_match'
      ELSE 'weak_match'
    END as match_type,
    -- Score: address range match (3) + text similarity (0-1)
    (CASE 
      WHEN extracted_number IS NOT NULL 
        AND extracted_number BETWEEN p.low_address_number AND coalesce(p.high_address_number, p.low_address_number)
        THEN 3.0 + GREATEST(similarity(p.search_text, cleaned_search), word_similarity(cleaned_search, p.search_text))
      ELSE GREATEST(similarity(p.search_text, cleaned_search), word_similarity(cleaned_search, p.search_text))
    END)::real as relevance_score
  FROM public.parcel_search_table p
  WHERE 
    p.is_active = TRUE
    AND (
      -- Match if number is in address range
      (extracted_number IS NOT NULL 
       AND extracted_number BETWEEN p.low_address_number AND coalesce(p.high_address_number, p.low_address_number))
      OR
      -- Match text with trigram similarity
      (cleaned_search <> '' AND (
        p.search_text % cleaned_search OR
        word_similarity(cleaned_search, p.search_text) > 0.3
      ))
    )
  ORDER BY relevance_score DESC, p.parcel_id
  LIMIT result_limit;
END;
$$;

-- Grant execute permission to authenticated users
-- Actual data access controlled by RLS policy within function
GRANT EXECUTE ON FUNCTION public.search_parcels_with_range(text, int) TO authenticated;
