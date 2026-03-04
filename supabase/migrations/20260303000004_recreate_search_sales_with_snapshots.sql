-- Recreate search_sales to use sale_snapshots + snapshot child tables

DROP FUNCTION IF EXISTS public.search_sales;

CREATE OR REPLACE FUNCTION public.search_sales(
  p_sort_column TEXT DEFAULT 'sale_date',
  p_sort_ascending BOOLEAN DEFAULT FALSE,
  p_min_sale_price INT DEFAULT NULL,
  p_max_sale_price INT DEFAULT NULL,
  p_min_sale_date DATE DEFAULT NULL,
  p_max_sale_date DATE DEFAULT NULL,
  p_conditions TEXT[] DEFAULT NULL,
  p_occupancies INT[] DEFAULT NULL,
  p_cda_neighborhoods INT[] DEFAULT NULL,
  p_assessor_neighborhoods INT[] DEFAULT NULL,
  p_wards INT[] DEFAULT NULL,
  p_sale_types TEXT[] DEFAULT NULL,
  p_min_price_per_res_living_sqft NUMERIC DEFAULT NULL,
  p_max_price_per_res_living_sqft NUMERIC DEFAULT NULL,
  p_min_price_per_com_sqft NUMERIC DEFAULT NULL,
  p_max_price_per_com_sqft NUMERIC DEFAULT NULL,
  p_min_total_land_area INT DEFAULT NULL,
  p_max_total_land_area INT DEFAULT NULL
)
RETURNS TABLE(
  id BIGINT,
  sale_id BIGINT,
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
  appraised_total INTEGER,
  price_per_res_living_sqft NUMERIC,
  price_per_com_sqft NUMERIC,
  total_land_area INTEGER
) AS $$
  WITH parcel_agg AS (
    SELECT
      p.sale_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'parcel_id', p.parcel_id,
            'property_class', p.property_class,
            'occupancy', p.occupancy,
            'tax_status', p.tax_status,
            'taxcode', p.taxcode,
            'class_code', p.class_code,
            'ward', p.ward,
            'cda', p.cda,
            'assessor_neighborhood', p.assessor_neighborhood,
            'site_address', p.site_address,
            'frontage_sqft', p.frontage_sqft,
            'land_area_sqft', p.land_area_sqft,
            'appraised_total', p.appraised_total,
            'centroid_x', p.centroid_x,
            'centroid_y', p.centroid_y
          )
          ORDER BY p.parcel_id
        ),
        '[]'::JSONB
      ) AS parcels_json,
      COUNT(*)::INTEGER AS number_of_parcels,
      SUM(COALESCE(p.land_area_sqft, 0))::INTEGER AS land_area,
      SUM(COALESCE(p.appraised_total, 0))::INTEGER AS appraised_total,
      ROUND(AVG(p.centroid_x), 4)::NUMERIC AS centroid_x,
      ROUND(AVG(p.centroid_y), 4)::NUMERIC AS centroid_y
    FROM public.sale_snapshot_parcels p
    GROUP BY p.sale_id
  ),
  res_cost_agg AS (
    SELECT
      r.sale_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'parcel_id', r.parcel_id,
            'structure_name', r.structure_name,
            'condition', r.condition,
            'condition_score', r.condition_score,
            'year_built', r.year_built,
            'eff_year_build', r.eff_year_build,
            'base_material', r.base_material
          )
          ORDER BY r.parcel_id, r.structure_name
        ),
        '[]'::JSONB
      ) AS res_cost_json,
      COUNT(*)::INTEGER AS number_of_res_structures
    FROM public.sale_snapshot_res_cost r
    GROUP BY r.sale_id
  ),
  res_rfc_agg AS (
    SELECT
      r.sale_id,
      SUM(COALESCE(r.gross_living_area, 0))::INTEGER AS total_living_area,
      SUM(COALESCE(r.first_floor_living_area, 0))::INTEGER AS ground_floor_area,
      SUM(COALESCE(r.basement_livable_sqft, 0))::INTEGER AS finished_basement_area,
      SUM(COALESCE(r.number_of_stories, 0))::NUMERIC AS number_of_stories,
      SUM(COALESCE(r.number_of_bathrooms, 0))::NUMERIC AS number_of_full_baths
    FROM public.sale_snapshot_res_rfc r
    GROUP BY r.sale_id
  ),
  com_cost_agg AS (
    SELECT
      c.sale_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'parcel_id', c.parcel_id,
            'structure_id', c.structure_id,
            'structure', c.structure,
            'structure_category', c.structure_category,
            'structure_type', c.structure_type,
            'year_built', c.year_built,
            'effective_age', c.effective_age,
            'number_of_sections', c.number_of_sections,
            'sqft', c.sqft,
            'rcn', c.rcn,
            'rcnld', c.rcnld,
            'depreciation', c.depreciation
          )
          ORDER BY c.parcel_id, c.structure_id
        ),
        '[]'::JSONB
      ) AS building_json,
      COUNT(DISTINCT c.structure_id)::INTEGER AS number_of_buildings,
      SUM(COALESCE(c.sqft, 0))::INTEGER AS com_sqft,
      SUM(COALESCE(c.rcnld, 0))::INTEGER AS com_rcnld
    FROM public.sale_snapshot_com_cost c
    GROUP BY c.sale_id
  ),
  base AS (
    SELECT
      CASE
        WHEN s.sale_id ~ '^[0-9]+$' THEN s.sale_id::BIGINT
        ELSE ABS(hashtextextended(s.sale_id, 0))
      END AS id,
      CASE
        WHEN s.sale_id ~ '^[0-9]+$' THEN s.sale_id::BIGINT
        ELSE NULL
      END AS sale_id,
      s.sale_price,
      s.sale_date::DATE AS sale_date,
      s.sale_type,
      s.field_review_date::DATE AS field_review_date,
      NULL::INTEGER AS number_of_apartments,
      NULL::INTEGER AS number_of_apartments_one_bed,
      NULL::INTEGER AS number_of_apartments_two_bed,
      NULL::INTEGER AS number_of_apartments_three_bed,
      (COALESCE(rc.number_of_res_structures, 0) + COALESCE(cc.number_of_buildings, 0))::INTEGER AS number_of_units,
      rr.number_of_stories::INTEGER AS number_of_stories,
      NULL::INTEGER AS number_of_garages,
      NULL::INTEGER AS number_of_carports,
      rr.number_of_full_baths::INTEGER AS number_of_full_baths,
      NULL::INTEGER AS number_of_half_baths,
      rr.ground_floor_area::INTEGER AS ground_floor_area,
      (COALESCE(cc.com_sqft, 0) + COALESCE(rr.total_living_area, 0))::INTEGER AS total_area,
      rr.total_living_area::INTEGER AS total_living_area,
      rr.finished_basement_area::INTEGER AS finished_basement_area,
      NULL::INTEGER AS avg_year_built,
      cc.number_of_buildings::INTEGER AS number_of_buildings,
      cc.building_json,
      (COALESCE(s.snapshot_struct_rcnld, 0) + COALESCE(cc.com_rcnld, 0))::INTEGER AS struct_rcnld_with_oby,
      (COALESCE(s.snapshot_struct_rcnld, 0) + COALESCE(cc.com_rcnld, 0) + COALESCE(pa.land_area, 0))::INTEGER AS struct_rcnld_with_oby_and_land,
      rc.res_cost_json,
      pa.land_area::INTEGER AS land_area,
      pa.number_of_parcels::INTEGER AS number_of_parcels,
      pa.centroid_x::NUMERIC AS centroid_x,
      pa.centroid_y::NUMERIC AS centroid_y,
      pa.parcels_json,
      CASE
        WHEN pa.appraised_total IS NOT NULL AND pa.appraised_total > 0 AND s.sale_price IS NOT NULL
        THEN ROUND(s.sale_price::NUMERIC / pa.appraised_total::NUMERIC, 4)
        ELSE NULL
      END AS current_appraised_ratio,
      CASE
        WHEN (COALESCE(s.snapshot_struct_rcnld, 0) + COALESCE(cc.com_rcnld, 0) + COALESCE(pa.land_area, 0)) > 0
             AND s.sale_price IS NOT NULL
        THEN ROUND(
          s.sale_price::NUMERIC /
          (COALESCE(s.snapshot_struct_rcnld, 0) + COALESCE(cc.com_rcnld, 0) + COALESCE(pa.land_area, 0))::NUMERIC,
          4
        )
        ELSE NULL
      END AS cost_with_land_ratio,
      NULL::INTEGER AS appraised_land,
      NULL::INTEGER AS appraised_improvements,
      pa.appraised_total::INTEGER AS appraised_total,
      CASE
        WHEN rr.total_living_area IS NOT NULL
             AND rr.total_living_area > 0
             AND s.sale_price IS NOT NULL
        THEN ROUND(s.sale_price::NUMERIC / rr.total_living_area::NUMERIC, 2)
        ELSE NULL
      END AS price_per_res_living_sqft,
      CASE
        WHEN cc.com_sqft IS NOT NULL
             AND cc.com_sqft > 0
             AND s.sale_price IS NOT NULL
        THEN ROUND(s.sale_price::NUMERIC / cc.com_sqft::NUMERIC, 2)
        ELSE NULL
      END AS price_per_com_sqft,
      pa.land_area::INTEGER AS total_land_area,
      s.sale_id AS source_sale_id
    FROM public.sale_snapshots s
    LEFT JOIN parcel_agg pa
      ON pa.sale_id = s.sale_id
    LEFT JOIN res_cost_agg rc
      ON rc.sale_id = s.sale_id
    LEFT JOIN res_rfc_agg rr
      ON rr.sale_id = s.sale_id
    LEFT JOIN com_cost_agg cc
      ON cc.sale_id = s.sale_id
  )
  SELECT
    b.id,
    b.sale_id,
    b.sale_price,
    b.sale_date,
    b.sale_type,
    b.field_review_date,
    b.number_of_apartments,
    b.number_of_apartments_one_bed,
    b.number_of_apartments_two_bed,
    b.number_of_apartments_three_bed,
    b.number_of_units,
    b.number_of_stories,
    b.number_of_garages,
    b.number_of_carports,
    b.number_of_full_baths,
    b.number_of_half_baths,
    b.ground_floor_area,
    b.total_area,
    b.total_living_area,
    b.finished_basement_area,
    b.avg_year_built,
    b.number_of_buildings,
    b.building_json,
    b.struct_rcnld_with_oby,
    b.struct_rcnld_with_oby_and_land,
    b.res_cost_json,
    b.land_area,
    b.number_of_parcels,
    b.centroid_x,
    b.centroid_y,
    b.parcels_json,
    b.current_appraised_ratio,
    b.cost_with_land_ratio,
    b.appraised_land,
    b.appraised_improvements,
    b.appraised_total,
    b.price_per_res_living_sqft,
    b.price_per_com_sqft,
    b.total_land_area
  FROM base b
  WHERE
    (p_min_sale_price IS NULL OR b.sale_price >= p_min_sale_price)
    AND (p_max_sale_price IS NULL OR b.sale_price <= p_max_sale_price)
    AND (p_min_sale_date IS NULL OR b.sale_date >= p_min_sale_date)
    AND (p_max_sale_date IS NULL OR b.sale_date <= p_max_sale_date)
    AND (p_sale_types IS NULL OR array_length(p_sale_types, 1) IS NULL OR b.sale_type = ANY(p_sale_types))
    AND (p_min_price_per_res_living_sqft IS NULL OR b.price_per_res_living_sqft >= p_min_price_per_res_living_sqft)
    AND (p_max_price_per_res_living_sqft IS NULL OR b.price_per_res_living_sqft <= p_max_price_per_res_living_sqft)
    AND (p_min_price_per_com_sqft IS NULL OR b.price_per_com_sqft >= p_min_price_per_com_sqft)
    AND (p_max_price_per_com_sqft IS NULL OR b.price_per_com_sqft <= p_max_price_per_com_sqft)
    AND (p_min_total_land_area IS NULL OR b.total_land_area >= p_min_total_land_area)
    AND (p_max_total_land_area IS NULL OR b.total_land_area <= p_max_total_land_area)
    AND (
      p_conditions IS NULL
      OR array_length(p_conditions, 1) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.sale_snapshot_res_cost rsc
        WHERE rsc.sale_id = b.source_sale_id
          AND LOWER(TRIM(rsc.condition)) = ANY(SELECT LOWER(TRIM(c)) FROM UNNEST(p_conditions) AS c)
      )
    )
    AND (
      p_occupancies IS NULL
      OR array_length(p_occupancies, 1) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.sale_snapshot_parcels p
        WHERE p.sale_id = b.source_sale_id
          AND p.occupancy ~ '^-?[0-9]+$'
          AND p.occupancy::INTEGER = ANY(p_occupancies)
      )
    )
    AND (
      p_cda_neighborhoods IS NULL
      OR array_length(p_cda_neighborhoods, 1) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.sale_snapshot_parcels p
        WHERE p.sale_id = b.source_sale_id
          AND p.cda = ANY(p_cda_neighborhoods)
      )
    )
    AND (
      p_assessor_neighborhoods IS NULL
      OR array_length(p_assessor_neighborhoods, 1) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.sale_snapshot_parcels p
        WHERE p.sale_id = b.source_sale_id
          AND p.assessor_neighborhood = ANY(p_assessor_neighborhoods)
      )
    )
    AND (
      p_wards IS NULL
      OR array_length(p_wards, 1) IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.sale_snapshot_parcels p
        WHERE p.sale_id = b.source_sale_id
          AND p.ward = ANY(p_wards)
      )
    )
  ORDER BY
    CASE WHEN p_sort_column = 'sale_id' AND p_sort_ascending THEN b.sale_id END ASC,
    CASE WHEN p_sort_column = 'sale_id' AND NOT p_sort_ascending THEN b.sale_id END DESC,
    CASE WHEN p_sort_column = 'sale_price' AND p_sort_ascending THEN b.sale_price END ASC,
    CASE WHEN p_sort_column = 'sale_price' AND NOT p_sort_ascending THEN b.sale_price END DESC,
    CASE WHEN p_sort_column = 'sale_date' AND p_sort_ascending THEN b.sale_date END ASC,
    CASE WHEN p_sort_column = 'sale_date' AND NOT p_sort_ascending THEN b.sale_date END DESC,
    CASE WHEN p_sort_column = 'appraised_total' AND p_sort_ascending THEN b.appraised_total END ASC,
    CASE WHEN p_sort_column = 'appraised_total' AND NOT p_sort_ascending THEN b.appraised_total END DESC,
    CASE WHEN p_sort_column = 'total_living_area' AND p_sort_ascending THEN b.total_living_area END ASC,
    CASE WHEN p_sort_column = 'total_living_area' AND NOT p_sort_ascending THEN b.total_living_area END DESC,
    CASE WHEN p_sort_column = 'total_area' AND p_sort_ascending THEN b.total_area END ASC,
    CASE WHEN p_sort_column = 'total_area' AND NOT p_sort_ascending THEN b.total_area END DESC,
    CASE WHEN p_sort_column = 'price_per_res_living_sqft' AND p_sort_ascending THEN b.price_per_res_living_sqft END ASC,
    CASE WHEN p_sort_column = 'price_per_res_living_sqft' AND NOT p_sort_ascending THEN b.price_per_res_living_sqft END DESC,
    CASE WHEN p_sort_column = 'price_per_com_sqft' AND p_sort_ascending THEN b.price_per_com_sqft END ASC,
    CASE WHEN p_sort_column = 'price_per_com_sqft' AND NOT p_sort_ascending THEN b.price_per_com_sqft END DESC,
    CASE WHEN p_sort_column = 'total_land_area' AND p_sort_ascending THEN b.total_land_area END ASC,
    CASE WHEN p_sort_column = 'total_land_area' AND NOT p_sort_ascending THEN b.total_land_area END DESC,
    CASE WHEN p_sort_ascending THEN b.id END ASC,
    CASE WHEN NOT p_sort_ascending THEN b.id END DESC;
$$ LANGUAGE sql STABLE;
