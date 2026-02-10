-- Update cda_neighborhoods geometry column from Polygon to MultiPolygon
-- Convert existing Polygon geometries to MultiPolygon using ST_Multi()
ALTER TABLE public.cda_neighborhoods
ALTER COLUMN geom
SET
    DATA TYPE geometry (MultiPolygon, 4326) USING ST_Multi (geom);

COMMENT ON COLUMN public.cda_neighborhoods.geom IS 'MultiPolygon geometry in WGS84 (lat/lng)';