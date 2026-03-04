-- Create function to search neighborhood summaries with filters

CREATE OR REPLACE FUNCTION public.search_neighborhood_summaries(
    p_neighborhood_type TEXT DEFAULT NULL,
    p_neighborhood_id TEXT DEFAULT NULL,
    p_summary_type TEXT DEFAULT NULL,
    p_limit INTEGER DEFAULT 100,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    id BIGINT,
    neighborhood_type TEXT,
    neighborhood_id TEXT,
    summary_type TEXT,
    metrics JSONB,
    computed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id,
        ns.neighborhood_type,
        ns.neighborhood_id,
        ns.summary_type,
        ns.metrics,
        ns.computed_at,
        ns.created_at,
        ns.updated_at
    FROM public.neighborhood_summaries ns
    WHERE 
        (p_neighborhood_type IS NULL OR ns.neighborhood_type = p_neighborhood_type)
        AND (p_neighborhood_id IS NULL OR ns.neighborhood_id = p_neighborhood_id)
        AND (p_summary_type IS NULL OR ns.summary_type = p_summary_type)
    ORDER BY ns.computed_at DESC, ns.neighborhood_type, ns.neighborhood_id
    LIMIT p_limit
    OFFSET p_offset;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.search_neighborhood_summaries IS 'Search neighborhood summaries with optional filters';


-- Create function to get the latest summary for a specific neighborhood
CREATE OR REPLACE FUNCTION public.get_latest_neighborhood_summary(
    p_neighborhood_type TEXT,
    p_neighborhood_id TEXT,
    p_summary_type TEXT
)
RETURNS TABLE (
    id BIGINT,
    neighborhood_type TEXT,
    neighborhood_id TEXT,
    summary_type TEXT,
    metrics JSONB,
    computed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ns.id,
        ns.neighborhood_type,
        ns.neighborhood_id,
        ns.summary_type,
        ns.metrics,
        ns.computed_at,
        ns.created_at,
        ns.updated_at
    FROM public.neighborhood_summaries ns
    WHERE 
        ns.neighborhood_type = p_neighborhood_type
        AND ns.neighborhood_id = p_neighborhood_id
        AND ns.summary_type = p_summary_type
    ORDER BY ns.computed_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_latest_neighborhood_summary IS 'Get the most recent summary for a specific neighborhood and summary type';


-- Create function to get all latest summaries for neighborhoods with geometry
CREATE OR REPLACE FUNCTION public.get_neighborhood_summaries_with_geom()
RETURNS TABLE (
    neighborhood_id TEXT,
    neighborhood_type TEXT,
    geom GEOMETRY,
    latest_computed_at TIMESTAMPTZ,
    summaries JSONB
) AS $$
BEGIN
    RETURN QUERY
    WITH latest_summaries AS (
        -- Get the most recent summary for each (neighborhood_type, neighborhood_id, summary_type)
        SELECT
            ns.neighborhood_type AS nb_type,
            ns.neighborhood_id AS nb_id,
            ns.summary_type,
            ns.metrics,
            ns.computed_at,
            ROW_NUMBER() OVER (
                PARTITION BY ns.neighborhood_type, ns.neighborhood_id, ns.summary_type
                ORDER BY ns.computed_at DESC
            ) as rn
        FROM public.neighborhood_summaries ns
    ),
    filtered_summaries AS (
        SELECT
            ls.nb_type,
            ls.nb_id,
            ls.summary_type,
            ls.metrics,
            ls.computed_at
        FROM latest_summaries ls
        WHERE ls.rn = 1
    ),
    grouped_summaries AS (
        -- Group all summaries by neighborhood
        SELECT
            fs.nb_type,
            fs.nb_id,
            MAX(fs.computed_at) as latest_computed_at,
            JSONB_OBJECT_AGG(
                fs.summary_type,
                jsonb_build_object(
                    'summary_type', fs.summary_type,
                    'metrics', fs.metrics,
                    'computed_at', fs.computed_at
                )
            ) as summaries_obj
        FROM filtered_summaries fs
        GROUP BY fs.nb_type, fs.nb_id
    ),
    with_geom AS (
        SELECT
            gs.nb_id AS neighborhood_id,
            gs.nb_type AS neighborhood_type,
            gs.latest_computed_at,
            gs.summaries_obj as summaries,
            CASE
                WHEN gs.nb_type = 'cda_neighborhood' THEN
                    (SELECT cn.geom FROM public.cda_neighborhoods cn WHERE cn.source_id = gs.nb_id LIMIT 1)
                WHEN gs.nb_type = 'assessor_neighborhood' THEN
                    (SELECT an.geom FROM public.assessor_neighborhoods an WHERE an.name = gs.nb_id LIMIT 1)
                WHEN gs.nb_type = 'ward' THEN
                    (SELECT w.geom FROM public.wards w WHERE w.name = gs.nb_id LIMIT 1)
                ELSE NULL::GEOMETRY
            END as neighborhood_geom
        FROM grouped_summaries gs
        WHERE gs.nb_type IN ('cda_neighborhood', 'assessor_neighborhood', 'ward')
    )
    SELECT
        wg.neighborhood_id,
        wg.neighborhood_type,
        wg.neighborhood_geom,
        wg.latest_computed_at,
        wg.summaries
    FROM with_geom wg;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

COMMENT ON FUNCTION public.get_neighborhood_summaries_with_geom IS 'Get all latest summaries for CDA neighborhoods, assessor neighborhoods, and wards with their geometry - one row per neighborhood';
