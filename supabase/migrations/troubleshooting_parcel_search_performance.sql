-- Performance troubleshooting queries for parcel_search function
-- Run these to identify bottlenecks and verify index usage

-- 1. EXPLAIN ANALYZE the function with typical parameters
-- Replace parameters with your actual test values
EXPLAIN (ANALYZE, BUFFERS, VERBOSE)
SELECT * FROM public.parcel_search(
    cda_neighborhood_ids := ARRAY[1,2,3]::bigint[],
    assessor_neighborhood_ids := NULL,
    ward_ids := NULL,
    block_numbers := NULL,
    min_app_total := NULL,
    max_app_total := NULL,
    sort_by := 'block_asc'
);

-- 2. Check if spatial indexes exist and are valid
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename IN ('geometries', 'cda_neighborhoods', 'assessor_neighborhoods', 'wards')
    AND indexdef LIKE '%GIST%'
ORDER BY tablename, indexname;

-- 3. Check if other indexes exist on key columns
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM
    pg_indexes
WHERE
    tablename IN ('parcels', 'assessments', 'geometries')
ORDER BY tablename, indexname;

-- 4. Check table sizes to understand data volume
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_indexes_size(schemaname||'.'||tablename)) AS indexes_size
FROM
    pg_tables
WHERE
    schemaname = 'public'
    AND tablename IN ('parcels', 'geometries', 'assessments', 'cda_neighborhoods', 'assessor_neighborhoods', 'wards')
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 5. Check statistics on tables (last analyzed, row counts)
SELECT
    schemaname,
    tablename,
    n_live_tup AS row_count,
    last_autoanalyze,
    last_analyze
FROM
    pg_stat_user_tables
WHERE
    schemaname = 'public'
    AND tablename IN ('parcels', 'geometries', 'assessments', 'cda_neighborhoods', 'assessor_neighborhoods', 'wards')
ORDER BY tablename;

-- 6. If statistics are stale, run ANALYZE
-- ANALYZE public.parcels;
-- ANALYZE public.geometries;
-- ANALYZE public.assessments;
-- ANALYZE public.cda_neighborhoods;
-- ANALYZE public.assessor_neighborhoods;
-- ANALYZE public.wards;
