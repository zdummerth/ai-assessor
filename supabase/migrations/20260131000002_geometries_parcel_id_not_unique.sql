-- Allow multiple geometries per parcel by dropping unique constraint
ALTER TABLE public.geometries
DROP CONSTRAINT IF EXISTS geometries_parcel_id_key;