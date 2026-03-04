-- Create comparison sale finder function
-- Finds top-N comparable sales for each requested subject parcel

DROP FUNCTION IF EXISTS public.find_comparison_sales cascade;

CREATE OR REPLACE FUNCTION public.find_comparison_sales(
    p_parcel_ids numeric[],
    p_number_of_comps integer DEFAULT 25,
    p_total_area_band integer DEFAULT 5000,
    p_total_living_area_band integer DEFAULT 500,
    p_max_distance_miles numeric DEFAULT 1,
    p_occupancies integer[] DEFAULT NULL,
    p_cda_neighborhoods text[] DEFAULT NULL,
    p_sale_types text[] DEFAULT NULL,
    p_conditions text[] DEFAULT NULL,
    p_qualities text[] DEFAULT NULL,
    p_min_sale_date date DEFAULT NULL,
    p_max_sale_date date DEFAULT NULL
)
RETURNS TABLE (
    subject_parcel_id numeric,
    subject_geometry geometry,
    subject_total_area integer,
    subject_total_living_area integer,
    sale_id integer,
    sale_price integer,
    sale_date date,
    sale_centroid_x numeric,
    sale_centroid_y numeric,
    sale_parcel_geometries jsonb,
    sale_total_area integer,
    sale_total_living_area integer,
    total_area_difference integer,
    total_living_area_difference integer,
    subject_condition text,
    sale_condition text,
    subject_quality text,
    sale_quality text,
    subject_occupancy text,
    sale_occupancy text,
    subject_cda_neighborhood text,
    sale_cda_neighborhood text,
    condition_gower_distance numeric,
    quality_gower_distance numeric,
    occupancy_gower_distance numeric,
    cda_neighborhood_gower_distance numeric,
    number_of_apartments_gower_distance numeric,
    number_of_apartments_one_bed_gower_distance numeric,
    number_of_apartments_two_bed_gower_distance numeric,
    number_of_apartments_three_bed_gower_distance numeric,
    number_of_units_gower_distance numeric,
    number_of_stories_gower_distance numeric,
    number_of_garages_gower_distance numeric,
    number_of_carports_gower_distance numeric,
    number_of_full_baths_gower_distance numeric,
    number_of_half_baths_gower_distance numeric,
    ground_floor_area_gower_distance numeric,
    total_area_gower_distance numeric,
    total_living_area_gower_distance numeric,
    finished_basement_area_gower_distance numeric,
    avg_year_built_gower_distance numeric,
    number_of_buildings_gower_distance numeric,
    overall_gower_distance numeric,
    distance_miles numeric,
    comp_rank integer
) AS $$
BEGIN
    IF p_parcel_ids IS NULL OR cardinality(p_parcel_ids) = 0 THEN
        RETURN;
    END IF;

    IF p_number_of_comps IS NULL OR p_number_of_comps < 1 THEN
        RAISE EXCEPTION 'p_number_of_comps must be >= 1';
    END IF;

    IF p_total_area_band IS NULL OR p_total_area_band < 0 THEN
        RAISE EXCEPTION 'p_total_area_band must be >= 0';
    END IF;

    IF p_total_living_area_band IS NULL OR p_total_living_area_band < 0 THEN
        RAISE EXCEPTION 'p_total_living_area_band must be >= 0';
    END IF;

    IF p_max_distance_miles IS NULL OR p_max_distance_miles <= 0 THEN
        RAISE EXCEPTION 'p_max_distance_miles must be > 0';
    END IF;

    IF p_min_sale_date IS NOT NULL AND p_max_sale_date IS NOT NULL AND p_min_sale_date > p_max_sale_date THEN
        RAISE EXCEPTION 'p_min_sale_date must be <= p_max_sale_date';
    END IF;

    RETURN QUERY
    WITH subject_parcels AS (
        SELECT
            p.parcel_id,
            p."geometry" AS subject_geometry,
            p.total_area,
            p.total_living_area,
            p.number_of_apartments,
            p.number_of_apartments_one_bedroom,
            p.number_of_apartments_two_bedroom,
            p.number_of_apartments_three_bedroom,
            p.number_of_units,
            p.number_of_stories,
            p.number_of_garages,
            p.number_of_carports,
            p.number_of_full_baths,
            p.number_of_half_baths,
            p.ground_floor_area,
            p.finished_basement_area,
            p.avg_year_built,
            p.number_of_buildings,
            p.occupancy::text AS subject_occupancy,
            p.cda_neighborhood::text AS subject_cda_neighborhood,
            cost_values.condition_value AS subject_condition,
            cost_values.quality_value AS subject_quality,
            CASE
                WHEN ST_SRID(p.centroid) = 0 THEN ST_SetSRID(p.centroid, 4326)::geography
                ELSE ST_Transform(p.centroid, 4326)::geography
            END AS centroid_geog
        FROM public.parcel_search_table p
        LEFT JOIN LATERAL (
            SELECT
                MIN(LOWER(TRIM(elem->>'condition'))) FILTER (
                    WHERE NULLIF(TRIM(elem->>'condition'), '') IS NOT NULL
                ) AS condition_value,
                MIN(LOWER(TRIM(elem->>'quality'))) FILTER (
                    WHERE NULLIF(TRIM(elem->>'quality'), '') IS NOT NULL
                ) AS quality_value
            FROM jsonb_array_elements(
                CASE
                    WHEN p.cost_json IS NULL THEN '[]'::jsonb
                    WHEN jsonb_typeof(p.cost_json) = 'array' THEN p.cost_json
                    ELSE jsonb_build_array(p.cost_json)
                END
            ) AS elem
        ) AS cost_values ON TRUE
        WHERE
            p.is_active = TRUE
            AND p.parcel_id = ANY (p_parcel_ids)
            AND p.centroid IS NOT NULL
    ),
    feature_ranges AS (
        SELECT
            COALESCE(NULLIF((MAX(s.number_of_apartments) - MIN(s.number_of_apartments))::numeric, 0), 1) AS number_of_apartments_range,
            COALESCE(NULLIF((MAX(s.number_of_apartments_one_bed) - MIN(s.number_of_apartments_one_bed))::numeric, 0), 1) AS number_of_apartments_one_bed_range,
            COALESCE(NULLIF((MAX(s.number_of_apartments_two_bed) - MIN(s.number_of_apartments_two_bed))::numeric, 0), 1) AS number_of_apartments_two_bed_range,
            COALESCE(NULLIF((MAX(s.number_of_apartments_three_bed) - MIN(s.number_of_apartments_three_bed))::numeric, 0), 1) AS number_of_apartments_three_bed_range,
            COALESCE(NULLIF((MAX(s.number_of_units) - MIN(s.number_of_units))::numeric, 0), 1) AS number_of_units_range,
            COALESCE(NULLIF((MAX(s.number_of_stories) - MIN(s.number_of_stories))::numeric, 0), 1) AS number_of_stories_range,
            COALESCE(NULLIF((MAX(s.number_of_garages) - MIN(s.number_of_garages))::numeric, 0), 1) AS number_of_garages_range,
            COALESCE(NULLIF((MAX(s.number_of_carports) - MIN(s.number_of_carports))::numeric, 0), 1) AS number_of_carports_range,
            COALESCE(NULLIF((MAX(s.number_of_full_baths) - MIN(s.number_of_full_baths))::numeric, 0), 1) AS number_of_full_baths_range,
            COALESCE(NULLIF((MAX(s.number_of_half_baths) - MIN(s.number_of_half_baths))::numeric, 0), 1) AS number_of_half_baths_range,
            COALESCE(NULLIF((MAX(s.ground_floor_area) - MIN(s.ground_floor_area))::numeric, 0), 1) AS ground_floor_area_range,
            COALESCE(NULLIF((MAX(s.total_area) - MIN(s.total_area))::numeric, 0), 1) AS total_area_range,
            COALESCE(NULLIF((MAX(s.total_living_area) - MIN(s.total_living_area))::numeric, 0), 1) AS total_living_area_range,
            COALESCE(NULLIF((MAX(s.finished_basement_area) - MIN(s.finished_basement_area))::numeric, 0), 1) AS finished_basement_area_range,
            COALESCE(NULLIF((MAX(s.avg_year_built) - MIN(s.avg_year_built))::numeric, 0), 1) AS avg_year_built_range,
            COALESCE(NULLIF((MAX(s.number_of_buildings) - MIN(s.number_of_buildings))::numeric, 0), 1) AS number_of_buildings_range
        FROM public.sales_summary s
    ),
    sales_with_cost_values AS (
        SELECT
            s.*,
            parcel_values.occupancy_value AS sale_occupancy,
            parcel_values.cda_neighborhood_value AS sale_cda_neighborhood,
            parcel_values.parcel_geometries AS sale_parcel_geometries,
            cost_values.condition_value AS sale_condition,
            cost_values.quality_value AS sale_quality
        FROM public.sales_summary s
        LEFT JOIN LATERAL (
            SELECT
                MIN(TRIM(elem->>'occupancy')) FILTER (
                    WHERE NULLIF(TRIM(elem->>'occupancy'), '') IS NOT NULL
                ) AS occupancy_value,
                MIN(TRIM(elem->>'cda_neighborhood')) FILTER (
                    WHERE NULLIF(TRIM(elem->>'cda_neighborhood'), '') IS NOT NULL
                ) AS cda_neighborhood_value,
                jsonb_agg(elem->'geometry') FILTER (
                    WHERE elem ? 'geometry' AND elem->'geometry' IS NOT NULL
                ) AS parcel_geometries
            FROM jsonb_array_elements(
                CASE
                    WHEN s.parcels_json IS NULL THEN '[]'::jsonb
                    WHEN jsonb_typeof(s.parcels_json) = 'array' THEN s.parcels_json
                    ELSE jsonb_build_array(s.parcels_json)
                END
            ) AS elem
        ) AS parcel_values ON TRUE
        LEFT JOIN LATERAL (
            SELECT
                MIN(LOWER(TRIM(elem->>'condition'))) FILTER (
                    WHERE NULLIF(TRIM(elem->>'condition'), '') IS NOT NULL
                ) AS condition_value,
                MIN(LOWER(TRIM(elem->>'quality'))) FILTER (
                    WHERE NULLIF(TRIM(elem->>'quality'), '') IS NOT NULL
                ) AS quality_value
            FROM jsonb_array_elements(
                CASE
                    WHEN s.res_cost_json IS NULL THEN '[]'::jsonb
                    WHEN jsonb_typeof(s.res_cost_json) = 'array' THEN s.res_cost_json
                    ELSE jsonb_build_array(s.res_cost_json)
                END
            ) AS elem
        ) AS cost_values ON TRUE
    ),
    candidate_sales AS (
        SELECT
            sp.parcel_id AS subject_parcel_id,
            sp.subject_geometry,
            sp.total_area AS subject_total_area,
            sp.total_living_area AS subject_total_living_area,
            sp.subject_condition,
            swcv.sale_condition,
            sp.subject_quality,
            swcv.sale_quality,
            sp.subject_occupancy,
            swcv.sale_occupancy,
            sp.subject_cda_neighborhood,
            swcv.sale_cda_neighborhood,
            sp.number_of_apartments AS subject_number_of_apartments,
            swcv.number_of_apartments AS sale_number_of_apartments,
            sp.number_of_apartments_one_bedroom AS subject_number_of_apartments_one_bed,
            swcv.number_of_apartments_one_bed AS sale_number_of_apartments_one_bed,
            sp.number_of_apartments_two_bedroom AS subject_number_of_apartments_two_bed,
            swcv.number_of_apartments_two_bed AS sale_number_of_apartments_two_bed,
            sp.number_of_apartments_three_bedroom AS subject_number_of_apartments_three_bed,
            swcv.number_of_apartments_three_bed AS sale_number_of_apartments_three_bed,
            sp.number_of_units AS subject_number_of_units,
            swcv.number_of_units AS sale_number_of_units,
            sp.number_of_stories AS subject_number_of_stories,
            swcv.number_of_stories AS sale_number_of_stories,
            sp.number_of_garages AS subject_number_of_garages,
            swcv.number_of_garages AS sale_number_of_garages,
            sp.number_of_carports AS subject_number_of_carports,
            swcv.number_of_carports AS sale_number_of_carports,
            sp.number_of_full_baths AS subject_number_of_full_baths,
            swcv.number_of_full_baths AS sale_number_of_full_baths,
            sp.number_of_half_baths AS subject_number_of_half_baths,
            swcv.number_of_half_baths AS sale_number_of_half_baths,
            sp.ground_floor_area AS subject_ground_floor_area,
            swcv.ground_floor_area AS sale_ground_floor_area,
            sp.total_area AS subject_total_area_for_gower,
            swcv.total_area AS sale_total_area_for_gower,
            sp.total_living_area AS subject_total_living_area_for_gower,
            swcv.total_living_area AS sale_total_living_area_for_gower,
            sp.finished_basement_area AS subject_finished_basement_area,
            swcv.finished_basement_area AS sale_finished_basement_area,
            sp.avg_year_built AS subject_avg_year_built,
            swcv.avg_year_built AS sale_avg_year_built,
            sp.number_of_buildings AS subject_number_of_buildings,
            swcv.number_of_buildings AS sale_number_of_buildings,
            s.sale_id,
            s.sale_price,
            s.sale_date,
            swcv.centroid_x AS sale_centroid_x,
            swcv.centroid_y AS sale_centroid_y,
            swcv.sale_parcel_geometries,
            s.total_area AS sale_total_area,
            s.total_living_area AS sale_total_living_area,
            abs(s.total_area - sp.total_area) AS total_area_difference,
            abs(s.total_living_area - sp.total_living_area) AS total_living_area_difference,
            (
                ST_Distance(
                    sp.centroid_geog,
                    ST_SetSRID(ST_MakePoint(swcv.centroid_x, swcv.centroid_y), 4326)::geography
                ) / 1609.344
            )::numeric AS distance_miles
        FROM subject_parcels sp
        CROSS JOIN feature_ranges fr
        INNER JOIN sales_with_cost_values swcv
            ON swcv.centroid_x IS NOT NULL
            AND swcv.centroid_y IS NOT NULL
            AND (p_min_sale_date IS NULL OR swcv.sale_date >= p_min_sale_date)
            AND (p_max_sale_date IS NULL OR swcv.sale_date <= p_max_sale_date)
            AND (
                p_sale_types IS NULL
                OR array_length(p_sale_types, 1) IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM unnest(p_sale_types) AS st
                    WHERE LOWER(TRIM(st)) = LOWER(TRIM(swcv.sale_type))
                )
            )
            AND (
                p_occupancies IS NULL
                OR array_length(p_occupancies, 1) IS NULL
                OR (
                    swcv.parcels_json IS NOT NULL
                    AND EXISTS (
                        SELECT 1
                        FROM jsonb_array_elements((swcv.parcels_json #>> '{}')::jsonb) AS elem
                        WHERE
                            (elem->>'occupancy') ~ '^\\d+$'
                            AND (elem->>'occupancy')::integer = ANY (p_occupancies)
                    )
                )
            )
            AND (
                p_cda_neighborhoods IS NULL
                OR array_length(p_cda_neighborhoods, 1) IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM unnest(p_cda_neighborhoods) AS cn
                    WHERE LOWER(TRIM(cn)) = LOWER(TRIM(swcv.sale_cda_neighborhood))
                )
            )
            AND (
                p_conditions IS NULL
                OR array_length(p_conditions, 1) IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM unnest(p_conditions) AS c
                    WHERE LOWER(TRIM(c)) = swcv.sale_condition
                )
            )
            AND (
                p_qualities IS NULL
                OR array_length(p_qualities, 1) IS NULL
                OR EXISTS (
                    SELECT 1
                    FROM unnest(p_qualities) AS q
                    WHERE LOWER(TRIM(q)) = swcv.sale_quality
                )
            )
            AND (
                sp.total_area IS NULL
                OR swcv.total_area IS NULL
                OR abs(swcv.total_area - sp.total_area) <= p_total_area_band
            )
            AND (
                sp.total_living_area IS NULL
                OR swcv.total_living_area IS NULL
                OR abs(swcv.total_living_area - sp.total_living_area) <= p_total_living_area_band
            )
            AND ST_DWithin(
                sp.centroid_geog,
                ST_SetSRID(ST_MakePoint(swcv.centroid_x, swcv.centroid_y), 4326)::geography,
                p_max_distance_miles * 1609.344
            )
        INNER JOIN public.sales_summary s ON s.id = swcv.id
    ),
    scored_candidates AS (
        SELECT
            cs.*,
            CASE
                WHEN cs.subject_condition IS NULL OR cs.sale_condition IS NULL THEN NULL
                WHEN cs.subject_condition = cs.sale_condition THEN 0::numeric
                ELSE 1::numeric
            END AS condition_gower_distance,
            CASE
                WHEN cs.subject_quality IS NULL OR cs.sale_quality IS NULL THEN NULL
                WHEN cs.subject_quality = cs.sale_quality THEN 0::numeric
                ELSE 1::numeric
            END AS quality_gower_distance,
            CASE
                WHEN cs.subject_occupancy IS NULL OR cs.sale_occupancy IS NULL THEN NULL
                WHEN LOWER(TRIM(cs.subject_occupancy)) = LOWER(TRIM(cs.sale_occupancy)) THEN 0::numeric
                ELSE 1::numeric
            END AS occupancy_gower_distance,
            CASE
                WHEN cs.subject_cda_neighborhood IS NULL OR cs.sale_cda_neighborhood IS NULL THEN NULL
                WHEN LOWER(TRIM(cs.subject_cda_neighborhood)) = LOWER(TRIM(cs.sale_cda_neighborhood)) THEN 0::numeric
                ELSE 1::numeric
            END AS cda_neighborhood_gower_distance,
            CASE
                WHEN cs.subject_number_of_apartments IS NULL OR cs.sale_number_of_apartments IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_apartments - cs.subject_number_of_apartments)::numeric / fr.number_of_apartments_range)
            END AS number_of_apartments_gower_distance,
            CASE
                WHEN cs.subject_number_of_apartments_one_bed IS NULL OR cs.sale_number_of_apartments_one_bed IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_apartments_one_bed - cs.subject_number_of_apartments_one_bed)::numeric / fr.number_of_apartments_one_bed_range)
            END AS number_of_apartments_one_bed_gower_distance,
            CASE
                WHEN cs.subject_number_of_apartments_two_bed IS NULL OR cs.sale_number_of_apartments_two_bed IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_apartments_two_bed - cs.subject_number_of_apartments_two_bed)::numeric / fr.number_of_apartments_two_bed_range)
            END AS number_of_apartments_two_bed_gower_distance,
            CASE
                WHEN cs.subject_number_of_apartments_three_bed IS NULL OR cs.sale_number_of_apartments_three_bed IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_apartments_three_bed - cs.subject_number_of_apartments_three_bed)::numeric / fr.number_of_apartments_three_bed_range)
            END AS number_of_apartments_three_bed_gower_distance,
            CASE
                WHEN cs.subject_number_of_units IS NULL OR cs.sale_number_of_units IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_units - cs.subject_number_of_units)::numeric / fr.number_of_units_range)
            END AS number_of_units_gower_distance,
            CASE
                WHEN cs.subject_number_of_stories IS NULL OR cs.sale_number_of_stories IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_stories - cs.subject_number_of_stories)::numeric / fr.number_of_stories_range)
            END AS number_of_stories_gower_distance,
            CASE
                WHEN cs.subject_number_of_garages IS NULL OR cs.sale_number_of_garages IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_garages - cs.subject_number_of_garages)::numeric / fr.number_of_garages_range)
            END AS number_of_garages_gower_distance,
            CASE
                WHEN cs.subject_number_of_carports IS NULL OR cs.sale_number_of_carports IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_carports - cs.subject_number_of_carports)::numeric / fr.number_of_carports_range)
            END AS number_of_carports_gower_distance,
            CASE
                WHEN cs.subject_number_of_full_baths IS NULL OR cs.sale_number_of_full_baths IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_full_baths - cs.subject_number_of_full_baths)::numeric / fr.number_of_full_baths_range)
            END AS number_of_full_baths_gower_distance,
            CASE
                WHEN cs.subject_number_of_half_baths IS NULL OR cs.sale_number_of_half_baths IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_half_baths - cs.subject_number_of_half_baths)::numeric / fr.number_of_half_baths_range)
            END AS number_of_half_baths_gower_distance,
            CASE
                WHEN cs.subject_ground_floor_area IS NULL OR cs.sale_ground_floor_area IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_ground_floor_area - cs.subject_ground_floor_area)::numeric / fr.ground_floor_area_range)
            END AS ground_floor_area_gower_distance,
            CASE
                WHEN cs.subject_total_area_for_gower IS NULL OR cs.sale_total_area_for_gower IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_total_area_for_gower - cs.subject_total_area_for_gower)::numeric / fr.total_area_range)
            END AS total_area_gower_distance,
            CASE
                WHEN cs.subject_total_living_area_for_gower IS NULL OR cs.sale_total_living_area_for_gower IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_total_living_area_for_gower - cs.subject_total_living_area_for_gower)::numeric / fr.total_living_area_range)
            END AS total_living_area_gower_distance,
            CASE
                WHEN cs.subject_finished_basement_area IS NULL OR cs.sale_finished_basement_area IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_finished_basement_area - cs.subject_finished_basement_area)::numeric / fr.finished_basement_area_range)
            END AS finished_basement_area_gower_distance,
            CASE
                WHEN cs.subject_avg_year_built IS NULL OR cs.sale_avg_year_built IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_avg_year_built - cs.subject_avg_year_built)::numeric / fr.avg_year_built_range)
            END AS avg_year_built_gower_distance,
            CASE
                WHEN cs.subject_number_of_buildings IS NULL OR cs.sale_number_of_buildings IS NULL THEN NULL
                ELSE LEAST(1::numeric, ABS(cs.sale_number_of_buildings - cs.subject_number_of_buildings)::numeric / fr.number_of_buildings_range)
            END AS number_of_buildings_gower_distance
        FROM candidate_sales cs
        CROSS JOIN feature_ranges fr
    ),
    with_overall_gower AS (
        SELECT
            sc.*,
            (
                SELECT AVG(distance_value)
                FROM unnest(
                    ARRAY[
                        sc.condition_gower_distance,
                        sc.quality_gower_distance,
                        sc.occupancy_gower_distance,
                        sc.cda_neighborhood_gower_distance,
                        sc.number_of_apartments_gower_distance,
                        sc.number_of_apartments_one_bed_gower_distance,
                        sc.number_of_apartments_two_bed_gower_distance,
                        sc.number_of_apartments_three_bed_gower_distance,
                        sc.number_of_units_gower_distance,
                        sc.number_of_stories_gower_distance,
                        sc.number_of_garages_gower_distance,
                        sc.number_of_carports_gower_distance,
                        sc.number_of_full_baths_gower_distance,
                        sc.number_of_half_baths_gower_distance,
                        sc.ground_floor_area_gower_distance,
                        sc.total_area_gower_distance,
                        sc.total_living_area_gower_distance,
                        sc.finished_basement_area_gower_distance,
                        sc.avg_year_built_gower_distance,
                        sc.number_of_buildings_gower_distance
                    ]::numeric[]
                ) AS distance_value
                WHERE distance_value IS NOT NULL
            ) AS overall_gower_distance
        FROM scored_candidates sc
    ),
    ranked_sales AS (
        SELECT
            cs.subject_parcel_id,
            cs.subject_geometry,
            cs.subject_total_area,
            cs.subject_total_living_area,
            cs.sale_id,
            cs.sale_price,
            cs.sale_date,
            cs.sale_centroid_x,
            cs.sale_centroid_y,
            cs.sale_parcel_geometries,
            cs.sale_total_area,
            cs.sale_total_living_area,
            cs.total_area_difference,
            cs.total_living_area_difference,
            cs.subject_condition,
            cs.sale_condition,
            cs.subject_quality,
            cs.sale_quality,
            cs.subject_occupancy,
            cs.sale_occupancy,
            cs.subject_cda_neighborhood,
            cs.sale_cda_neighborhood,
            cs.condition_gower_distance,
            cs.quality_gower_distance,
            cs.occupancy_gower_distance,
            cs.cda_neighborhood_gower_distance,
            cs.number_of_apartments_gower_distance,
            cs.number_of_apartments_one_bed_gower_distance,
            cs.number_of_apartments_two_bed_gower_distance,
            cs.number_of_apartments_three_bed_gower_distance,
            cs.number_of_units_gower_distance,
            cs.number_of_stories_gower_distance,
            cs.number_of_garages_gower_distance,
            cs.number_of_carports_gower_distance,
            cs.number_of_full_baths_gower_distance,
            cs.number_of_half_baths_gower_distance,
            cs.ground_floor_area_gower_distance,
            cs.total_area_gower_distance,
            cs.total_living_area_gower_distance,
            cs.finished_basement_area_gower_distance,
            cs.avg_year_built_gower_distance,
            cs.number_of_buildings_gower_distance,
            cs.overall_gower_distance,
            cs.distance_miles,
            ROW_NUMBER() OVER (
                PARTITION BY cs.subject_parcel_id
                ORDER BY cs.overall_gower_distance ASC NULLS LAST, cs.distance_miles ASC, cs.sale_date DESC NULLS LAST, cs.sale_price DESC NULLS LAST
            )::integer AS comp_rank
        FROM with_overall_gower cs
    )
    SELECT
        rs.subject_parcel_id,
        rs.subject_geometry,
        rs.subject_total_area,
        rs.subject_total_living_area,
        rs.sale_id,
        rs.sale_price,
        rs.sale_date,
        rs.sale_centroid_x,
        rs.sale_centroid_y,
        rs.sale_parcel_geometries,
        rs.sale_total_area,
        rs.sale_total_living_area,
        rs.total_area_difference,
        rs.total_living_area_difference,
        rs.subject_condition,
        rs.sale_condition,
        rs.subject_quality,
        rs.sale_quality,
        rs.subject_occupancy,
        rs.sale_occupancy,
        rs.subject_cda_neighborhood,
        rs.sale_cda_neighborhood,
        rs.condition_gower_distance,
        rs.quality_gower_distance,
        rs.occupancy_gower_distance,
        rs.cda_neighborhood_gower_distance,
        rs.number_of_apartments_gower_distance,
        rs.number_of_apartments_one_bed_gower_distance,
        rs.number_of_apartments_two_bed_gower_distance,
        rs.number_of_apartments_three_bed_gower_distance,
        rs.number_of_units_gower_distance,
        rs.number_of_stories_gower_distance,
        rs.number_of_garages_gower_distance,
        rs.number_of_carports_gower_distance,
        rs.number_of_full_baths_gower_distance,
        rs.number_of_half_baths_gower_distance,
        rs.ground_floor_area_gower_distance,
        rs.total_area_gower_distance,
        rs.total_living_area_gower_distance,
        rs.finished_basement_area_gower_distance,
        rs.avg_year_built_gower_distance,
        rs.number_of_buildings_gower_distance,
        rs.overall_gower_distance,
        rs.distance_miles,
        rs.comp_rank
    FROM ranked_sales rs
    WHERE rs.comp_rank <= p_number_of_comps
    ORDER BY rs.subject_parcel_id, rs.comp_rank;
END;
$$ LANGUAGE plpgsql STABLE;

    COMMENT ON FUNCTION public.find_comparison_sales(numeric[], integer, integer, integer, numeric, integer[], text[], text[], text[], text[], date, date)
    IS 'Find top-N comparable sales for each subject parcel using distance filters, optional occupancy/cda/sale type/condition/quality filters, and Gower distances across categorical and building/area features.';
