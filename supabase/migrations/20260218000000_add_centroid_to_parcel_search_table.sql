-- Add centroid generated column to parcel_search_table
ALTER TABLE public.parcel_search_table
ADD COLUMN centroid geometry GENERATED ALWAYS AS (ST_Centroid ("geometry")) STORED;