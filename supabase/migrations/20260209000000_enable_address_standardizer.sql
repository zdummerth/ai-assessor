-- Enable the address_standardizer extension for standardizing street addresses
-- This extension provides functions to parse and standardize postal addresses
-- Enable the core address_standardizer extension
CREATE EXTENSION IF NOT EXISTS address_standardizer;

-- Enable US-specific address standardization data
-- This provides rules and reference data for US addresses
CREATE EXTENSION IF NOT EXISTS address_standardizer_data_us;