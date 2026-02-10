-- Update geometries table to accept any geometry type
ALTER TABLE public.geometries
ALTER COLUMN geom
SET
    DATA TYPE geometry (GEOMETRY, 4326);

COMMENT ON COLUMN public.geometries.geom IS 'Geometry (Point, Polygon, MultiPolygon, etc.) in WGS84 latitude/longitude';