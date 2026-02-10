-- Add block, lot, and ext columns to parcel_search_table
ALTER TABLE public.parcel_search_table
ADD COLUMN IF NOT EXISTS block text NULL,
ADD COLUMN IF NOT EXISTS lot text NULL,
ADD COLUMN IF NOT EXISTS ext text NULL;