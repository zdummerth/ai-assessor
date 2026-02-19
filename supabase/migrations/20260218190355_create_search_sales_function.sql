-- Create sales search function
-- This function handles complex filtering for sales_summary including JSONB array queries
DROP FUNCTION IF EXISTS public.search_sales;
CREATE OR REPLACE FUNCTION public.search_sales(
  p_sort_column TEXT DEFAULT 'sale_date',
  p_sort_ascending BOOLEAN DEFAULT FALSE,
  p_min_sale_price INT DEFAULT NULL,
  p_max_sale_price INT DEFAULT NULL,
  p_min_sale_date DATE DEFAULT NULL,
  p_max_sale_date DATE DEFAULT NULL,
  p_condition TEXT DEFAULT NULL,
  p_occupancy INT DEFAULT NULL,
  p_cda_neighborhood INT DEFAULT NULL,
  p_assessor_neighborhood INT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  sale_id INTEGER,
  sale_price INTEGER,
  sale_date DATE,
  sale_type TEXT,
  field_review_date DATE,
  number_of_apartments INTEGER,
  number_of_apartments_one_bed INTEGER,
  number_of_apartments_two_bed INTEGER,
  number_of_apartments_three_bed INTEGER,
  number_of_units INTEGER,
  number_of_stories INTEGER,
  number_of_garages INTEGER,
  number_of_carports INTEGER,
  number_of_full_baths INTEGER,
  number_of_half_baths INTEGER,
  ground_floor_area INTEGER,
  total_area INTEGER,
  total_living_area INTEGER,
  finished_basement_area INTEGER,
  avg_year_built INTEGER,
  number_of_buildings INTEGER,
  building_json JSONB,
  struct_rcnld_with_oby INTEGER,
  struct_rcnld_with_oby_and_land INTEGER,
  res_cost_json JSONB,
  land_area INTEGER,
  number_of_parcels INTEGER,
  centroid_x NUMERIC,
  centroid_y NUMERIC,
  parcels_json JSONB,
  current_appraised_ratio NUMERIC,
  cost_with_land_ratio NUMERIC,
  appraised_land INTEGER,
  appraised_improvements INTEGER,
  appraised_total INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    s.id,
    s.sale_id,
    s.sale_price,
    s.sale_date,
    s.sale_type,
    s.field_review_date,
    s.number_of_apartments,
    s.number_of_apartments_one_bed,
    s.number_of_apartments_two_bed,
    s.number_of_apartments_three_bed,
    s.number_of_units,
    s.number_of_stories,
    s.number_of_garages,
    s.number_of_carports,
    s.number_of_full_baths,
    s.number_of_half_baths,
    s.ground_floor_area,
    s.total_area,
    s.total_living_area,
    s.finished_basement_area,
    s.avg_year_built,
    s.number_of_buildings,
    s.building_json,
    s.struct_rcnld_with_oby,
    s.struct_rcnld_with_oby_and_land,
    s.res_cost_json,
    s.land_area,
    s.number_of_parcels,
    s.centroid_x,
    s.centroid_y,
    s.parcels_json,
    s.current_appraised_ratio,
    s.cost_with_land_ratio,
    s.appraised_land,
    s.appraised_improvements,
    s.appraised_total
  FROM public.sales_summary s
  WHERE
    (p_min_sale_price IS NULL OR s.sale_price >= p_min_sale_price)
    AND (p_max_sale_price IS NULL OR s.sale_price <= p_max_sale_price)
    AND (p_min_sale_date IS NULL OR s.sale_date >= p_min_sale_date)
    AND (p_max_sale_date IS NULL OR s.sale_date <= p_max_sale_date)
    AND (
      p_condition IS NULL 
      OR jsonb_path_exists(
        (s.res_cost_json #>> '{}')::jsonb, 
        ('$[*] ? (@.condition == "' || p_condition || '")')::jsonpath
      )
    )
    AND (
      p_occupancy IS NULL 
      OR jsonb_path_exists(
        (s.parcels_json #>> '{}')::jsonb, 
        ('$[*] ? (@.occupancy == ' || p_occupancy || ')')::jsonpath
      )
    )
    AND (
      p_cda_neighborhood IS NULL 
      OR jsonb_path_exists(
        (s.parcels_json #>> '{}')::jsonb, 
        ('$[*] ? (@.cda_neighborhood == ' || p_cda_neighborhood || ')')::jsonpath
      )
    )
    AND (
      p_assessor_neighborhood IS NULL 
      OR jsonb_path_exists(
        (s.parcels_json #>> '{}')::jsonb, 
        ('$[*] ? (@.assessor_neighborhood == ' || p_assessor_neighborhood || ')')::jsonpath
      )
    )
  ORDER BY
    CASE WHEN p_sort_column = 'sale_id' AND p_sort_ascending THEN s.sale_id END ASC,
    CASE WHEN p_sort_column = 'sale_id' AND NOT p_sort_ascending THEN s.sale_id END DESC,
    CASE WHEN p_sort_column = 'sale_price' AND p_sort_ascending THEN s.sale_price END ASC,
    CASE WHEN p_sort_column = 'sale_price' AND NOT p_sort_ascending THEN s.sale_price END DESC,
    CASE WHEN p_sort_column = 'sale_date' AND p_sort_ascending THEN s.sale_date END ASC,
    CASE WHEN p_sort_column = 'sale_date' AND NOT p_sort_ascending THEN s.sale_date END DESC,
    CASE WHEN p_sort_column = 'appraised_total' AND p_sort_ascending THEN s.appraised_total END ASC,
    CASE WHEN p_sort_column = 'appraised_total' AND NOT p_sort_ascending THEN s.appraised_total END DESC,
    CASE WHEN p_sort_column = 'total_living_area' AND p_sort_ascending THEN s.total_living_area END ASC,
    CASE WHEN p_sort_column = 'total_living_area' AND NOT p_sort_ascending THEN s.total_living_area END DESC,
    CASE WHEN p_sort_column = 'total_area' AND p_sort_ascending THEN s.total_area END ASC,
    CASE WHEN p_sort_column = 'total_area' AND NOT p_sort_ascending THEN s.total_area END DESC,
    CASE WHEN (p_sort_column != 'sale_id' AND p_sort_column != 'sale_price' AND p_sort_column != 'sale_date' AND p_sort_column != 'appraised_total' AND p_sort_column != 'total_living_area' AND p_sort_column != 'total_area') AND p_sort_ascending THEN s.id END ASC,
    CASE WHEN (p_sort_column != 'sale_id' AND p_sort_column != 'sale_price' AND p_sort_column != 'sale_date' AND p_sort_column != 'appraised_total' AND p_sort_column != 'total_living_area' AND p_sort_column != 'total_area') AND NOT p_sort_ascending THEN s.id END DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create indexes to support search operations
CREATE INDEX IF NOT EXISTS sales_summary_res_cost_json_idx ON public.sales_summary USING GIN (res_cost_json jsonb_path_ops);
CREATE INDEX IF NOT EXISTS sales_summary_parcels_json_idx ON public.sales_summary USING GIN (parcels_json jsonb_path_ops);

