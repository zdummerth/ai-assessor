-- Add composite index for efficient latest assessment lookups
-- This index optimizes the DISTINCT ON query in latest_assessments CTE
-- Eliminates need to scan and sort all assessments
CREATE INDEX IF NOT EXISTS assessments_parcel_date_id_idx ON public.assessments (
    parcel_id,
    date_of_assessment DESC NULLS LAST,
    id DESC
);

COMMENT ON INDEX public.assessments_parcel_date_id_idx IS 'Composite index for efficient latest assessment per parcel lookup. Matches DISTINCT ON ordering in parcel_search function.';