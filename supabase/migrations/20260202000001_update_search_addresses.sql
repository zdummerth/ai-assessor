-- Update search_addresses to use combined address string similarity
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
        similarity(
          concat_ws(
            ' ',
            COALESCE(a.number_norm, ''),
            COALESCE(a.street_norm, ''),
            COALESCE(a.unit, ''),
            COALESCE(a.city_norm, ''),
            COALESCE(a.postcode, '')
          ),
          norm_search_text
        )::double precision
      ELSE 0.0::double precision
    END AS similarity_score
  FROM public.addresses a
  WHERE
    (exact_number IS NULL OR a.number_norm = norm_exact_number)
    AND (exact_postcode IS NULL OR a.postcode = exact_postcode)
    AND (exact_street IS NULL OR a.street_norm = norm_exact_street)
    AND (
      norm_search_text IS NULL
      OR similarity(
        concat_ws(
          ' ',
          COALESCE(a.number_norm, ''),
          COALESCE(a.street_norm, ''),
          COALESCE(a.unit, ''),
          COALESCE(a.city_norm, ''),
          COALESCE(a.postcode, '')
        ),
        norm_search_text
      ) >= similarity_threshold
    )
  ORDER BY
    similarity_score DESC,
    a.id ASC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION public.search_addresses IS 'Search addresses with trigram similarity on combined number, street, unit, city, and postcode. Optional exact filters for number, postcode, or street. Returns ranked results.';
