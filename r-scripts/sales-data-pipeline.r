# =============================================================================
# Real Estate Sales Pipeline
# =============================================================================
#
# ARCHITECTURE:
#   Devnet is the source of truth. This pipeline:
#
#   1. Syncs devnet data to Supabase as VIEW-ONLY tables:
#        - parcels
#        - sales
#        - res_cost
#        - res_rfcs
#        - com_cost_structures
#        - com_cost_sections
#
#   2. Creates/updates an EDITABLE sale_snapshots table in Supabase:
#        - One row per sale
#        - Every sale gets parcel, res cost, and com cost JSON columns
#          populated from all available devnet data (not just stable records)
#        - Stable data is used only to determine validity flags
#        - sale_type is patched from devnet on every run
#        - All other snapshot data is insert-only — user edits are preserved
#
# TIME-OF-SALE LOGIC:
#   Structure data: matched to the assessment year immediately AFTER the sale
#   using closest(sale_year <= lower_year), where lower_year = year - 1.
#   e.g. a sale in 2022 matches the 2023 assessment (lower_year = 2022).
#   Parcel data: matched to the year OF the sale.
#
# =============================================================================

library(httr2)
library(jsonlite)
library(DBI)
library(RSQLite)
library(sf)
library(tidyverse)
library(lubridate)
library(readxl)

source("utils.R")
source("supabase-report-transformations/lib.R")
source("supabase-report-transformations/data-sync/call_api.R")


# =============================================================================
# 1. LOAD RAW DATA
# =============================================================================
# -- Parcel addresses ---------------------------------------------------------
# -- Parcel addresses ---------------------------------------------------------
address_joining <- read_csv(
  "census-geocoded-addresses/with_prefix/parcel_address_map.csv"
) %>% 
  filter(is_primary == 1) %>% 
  distinct()

census_geocoded_addresses <- read_csv(
  "census-geocoded-addresses/with_prefix/geocoded_results.csv"
) %>% 
  select(address_id, address = output_address, lon, lat) %>% 
  distinct()
  

parcel_addresses <- address_joining %>%
  inner_join(census_geocoded_addresses, join_by(address_id))

parcel_addresses <- parcel_addresses %>%
  st_as_sf(coords = c("lon", "lat"), crs = 4326)

# -- Parcel shapes ------------------------------------------------------------
parcel_shapes <- st_read("I:/GIS/ARCDATA/CITY/Prcl.shp") %>%
  st_transform(crs = 4326) %>%
  st_make_valid() %>%
  mutate(
    centroid = st_centroid(geometry)
  )


land_reports_raw = combine_most_recent_files("G:/R-Projects/general/supabase-report-transformations/data/land_reports")

land_reports = land_reports_raw %>% 
  select(
    parcel_id = parcel_number,
    year = tax_year,
    cost_method,
    land_type,
    frontage,
    land_area_sqft = sqft
  ) %>% 
  convert_parcel_number(parcel_id) %>% 
  group_by(parcel_id, year) %>% 
  summarise(
    frontage_sqft = round(sum(frontage, na.rm = TRUE)),
    land_area_sqft = round(sum(land_area_sqft, na.rm = TRUE))
  )


prcls_raw <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl/1-30-26.xlsx"
)

joining_table <- prcls_raw %>%
  distinct(
    parcel_id    = AsrParcelId,
    collector_id = ColParcelId,
    handle       = Handle
  ) %>%
  mutate(handle = as.character(handle)) %>%
  convert_parcel_number(parcel_id) %>%
  left_join(parcel_shapes, join_by(handle == HANDLE)) %>%
  distinct()

# -- Building name lookups (for com cost categorization only) -----------------
all_bldg <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl_bldg_all/9-10-25.xlsx"
)

name_to_type <- all_bldg %>%
  distinct(BldgName, BldgType) %>%
  filter(!is.na(BldgType) & BldgType > 0)

name_to_cat <- all_bldg %>%
  distinct(BldgName, BldgCategory) %>%
  filter(!is.na(BldgCategory) & BldgCategory > 0)

# -- Residential cost ---------------------------------------------------------
res_cost_raw <- combine_most_recent_files(
  "G:/R-Projects/general/supabase-report-transformations/data/res_costing_ladder_exports"
)

res_rfcs_raw <- test_combine_most_recent_files(
  "G:/R-Projects/general/supabase-report-transformations/data/residential_field_review_cards"
) %>%
  get_nas_per_column(TRUE) %>%
  convert_parcel_number(parcel_number) %>%
  select(parcel_id = parcel_number, everything())

# -- Commercial cost ----------------------------------------------------------
com_ms_cost_raw <- combine_most_recent_files(
  "G:/R-Projects/general/supabase-report-transformations/data/ms_structures_reports"
)

# -- Sales --------------------------------------------------------------------
sales_raw_files <- combine_most_recent_files(
  "supabase-report-transformations/data/sale_reports"
)

# -- Parcel info (tax status, class, appraiser) -------------------------------
parcel_info_raw <- get_parcel_info()


# =============================================================================
# 2. PREPARE DEVNET SYNC TABLES
# =============================================================================

# -- Parcels ------------------------------------------------------------------
parcels <- parcel_info_raw %>%
  select(
    parcel_id             = parcel_number,
    site_address,
    tax_status,
    property_class        = prop_class,
    everything(),
    assessor_neighborhood = neighborhood,
    occupancy             = land_use,
    -current_appraiser
  ) %>%
  convert_parcel_number(parcel_id, keep_components = TRUE) %>%
  mutate(
    assessor_neighborhood = as.integer(str_sub(assessor_neighborhood, 2, 4))
  ) %>%
  left_join(joining_table, join_by(parcel_id), multiple = "first") %>%
  mutate(geojson = geojsonsf::sfc_geojson(geometry))

# -- Sales --------------------------------------------------------------------
sales <- sales_raw_files %>%
  convert_parcel_number(parcel_number) %>%
  rename(parcel_id = parcel_number) %>%
  mutate(
    sale_date         = mdy_hms(date_of_sale),
    field_review_date = mdy_hms(field_review_date),
    sale_year         = as.integer(year(sale_date)),
    sale_price        = as.integer(round(as.numeric(net_selling_price))),
    sale_type         = toupper(sale_type)
  ) %>%
  select(
    parcel_id,
    sale_id           = document_number,
    sale_price,
    sale_year,
    sale_date,
    sale_type,
    field_review_date
  ) %>%
  filter(!is.na(sale_id))

d_sales = sales %>% count(sale_id)

# -- Residential cost ---------------------------------------------------------
res_cost <- res_cost_raw %>%
  convert_parcel_number(property_key) %>%
  rename(parcel_id = property_key) %>%
  mutate(
    base_material = case_when(
      quality == "GROUP 1" ~ "Frame",
      quality == "GROUP 3" ~ "Frame",
      quality == "GROUP 7" ~ "Brick",
      quality == "GROUP 9" ~ "Stone",
      TRUE ~ NA_character_
    ),
    condition_score = case_when(
      condition == "Unsound"   ~ 1,
      condition == "Poor"      ~ 2,
      condition == "Fair"      ~ 3,
      condition == "Average"   ~ 4,
      condition == "Good"      ~ 5,
      condition == "Very Good" ~ 6,
      condition == "Excellent" ~ 7
    )
  )

# -- Residential field review cards -------------------------------------------
res_rfcs <- res_rfcs_raw %>%
  mutate(across(
    contains("area") | contains("bath") | contains("basement") |
      contains("keyin_value") | contains("finished") | contains("number"),
    ~ .x %>%
      str_replace_all("[^0-9.]", "") %>%
      as.numeric() %>%
      replace_na(0) %>%
      round() %>%
      as.integer()
  )) %>%
  mutate(
    number_of_bathrooms      = (half_bath * 0.5) + (full_bath * 1),
    basement_livable_sqft    = round(basement_living_area + basement_recreation_room),
    basement_unfinished_sqft = round(basement_crawl_space + basement_unfinished_basement)
  ) %>%
  select(
    parcel_id,
    year,
    structure_type,
    first_floor_living_area,
    second_floor_living_area,
    third_floor_living_area,
    half_story_living_area,
    number_of_bedrooms,
    number_of_bathrooms,
    one_story_addition_sqft     = one_addition_keyin_value,
    one_story_addition_material = one_addition_quality,
    two_story_addition_sqft     = two_addition_keyin_value,
    two_story_addition_material = two_addition_quality,
    attached_garage_sqft        = attached_garage_keyin_value,
    detached_garage_sqft        = detached_garage_keyin_value,
    bulitin_garage_sqft         = builtin_garage_keyin_value,
    carport_slab_sqft           = carport_slab_keyin_value,
    carport_steel_sqft          = steel_carport_keyin_value,
    carport_aluminum_sqft       = aluminum_carport_keyin_value,
    attic_livable_sqft          = finished_attic,
    attic_unfinished_sqft       = unfinished_attic,
    basement_livable_sqft,
    basement_unfinished_sqft
  ) %>%
  mutate(
    addition_material = case_when(
      one_story_addition_sqft > 0 & two_story_addition_sqft > 0 &
        one_story_addition_material == two_story_addition_material ~ one_story_addition_material,
      one_story_addition_sqft > 0 & two_story_addition_sqft == 0  ~ one_story_addition_material,
      one_story_addition_sqft == 0 & two_story_addition_sqft > 0  ~ two_story_addition_material,
      one_story_addition_sqft > 0 & two_story_addition_sqft > 0   ~ "Mixed",
      TRUE ~ NA_character_
    ),
    addition_sqft     = one_story_addition_sqft + two_story_addition_sqft,
    gross_living_area = first_floor_living_area + second_floor_living_area +
      third_floor_living_area + half_story_living_area +
      attic_livable_sqft + basement_livable_sqft
  ) %>%
  select(
    -one_story_addition_sqft,
    -one_story_addition_material,
    -two_story_addition_sqft,
    -two_story_addition_material
  ) %>%
  mutate(
    addition_material = case_when(
      addition_material == "1" ~ "Frame",
      addition_material == "3" ~ "Frame",
      addition_material == "7" ~ "Brick",
      addition_material == "9" ~ "Stone",
      TRUE ~ addition_material
    ),
    number_of_stories = case_when(
      third_floor_living_area  > 0 ~ 3,
      second_floor_living_area > 0 ~ 2,
      first_floor_living_area  > 0 ~ 1,
      TRUE                         ~ NA_real_
    ) + if_else(half_story_living_area > 0, 0.5, 0)
  )

# -- Commercial cost ----------------------------------------------------------
com_parcel_structures <- com_ms_cost_raw %>%
  distinct(formatted_parcel_number, structure_id) %>%
  select(parcel_id = formatted_parcel_number, structure_id) %>%
  convert_parcel_number(parcel_id)

com_cost_base <- com_ms_cost_raw %>%
  left_join(com_parcel_structures, join_by(structure_id)) %>%
  left_join(name_to_cat,           join_by(structure == BldgName)) %>%
  left_join(name_to_type,          join_by(structure == BldgName)) %>%
  rename(
    sqft               = units,
    rcn                = repl_cost_new,
    structure_category = BldgCategory,
    structure_type     = BldgType
  ) %>%
  mutate(
    sqft         = round(sqft),
    rcn          = round(rcn),
    rcnld        = round(rcnld),
    depreciation = round(depreciation)
  )

com_cost_sections <- com_cost_base %>%
  select(
    year, parcel_id, structure_id, section_id,
    description, sqft, rcn, depreciation, rcnld
  ) %>%
  distinct()

com_cost_structures <- com_cost_base %>%
  group_by(parcel_id, structure_id, year_built, effective_age, structure,
           year, structure_category, structure_type) %>%
  summarise(
    number_of_sections = n(),
    sqft         = sum(sqft,         na.rm = TRUE),
    rcn          = sum(rcn,          na.rm = TRUE),
    rcnld        = sum(rcnld,        na.rm = TRUE),
    depreciation = sum(depreciation, na.rm = TRUE),
    .groups = "drop"
  )


# =============================================================================
# 3. IDENTIFY STABLE PARCELS AND STRUCTURES
#    Used only to determine sale validity flags — not to gate JSON population.
#    "Stable" = present with consistent data in every year since 2020.
# =============================================================================

stable_parcels <- parcels %>%
  filter(year >= 2020) %>%
  select(parcel_id, occupancy) %>%
  group_by(parcel_id) %>%
  filter(n_distinct(occupancy) == 1) %>%
  ungroup() %>%
  distinct(parcel_id)

stable_res_cost <- res_cost %>%
  filter(year >= 2020) %>%
  group_by(parcel_id) %>%
  filter(n() == n_distinct(year)) %>%
  ungroup() %>%
  distinct(parcel_id)

stable_res_rfc <- res_rfcs %>%
  filter(year >= 2020) %>%
  group_by(parcel_id) %>%
  filter(n() == n_distinct(year)) %>%
  ungroup() %>%
  distinct(parcel_id)

stable_com_cost <- com_cost_structures %>%
  filter(year >= 2020) %>%
  group_by(parcel_id) %>%
  filter(n_distinct(year) == n_distinct(com_cost_structures$year[com_cost_structures$year >= 2020])) %>%
  ungroup() %>%
  distinct(parcel_id)


# =============================================================================
# 4. SALE VALIDITY FLAGS
# =============================================================================

single_parcel_sales <- sales %>%
  group_by(sale_id) %>%
  filter(n() == 1) %>%
  distinct(sale_id)

valid_single_parcel_sales <- sales %>%
  filter(sale_price > 10) %>%
  inner_join(single_parcel_sales, join_by(sale_id)) %>%
  inner_join(stable_parcels,      join_by(parcel_id)) %>%
  filter(
    str_detect(sale_type, "OPEN MARKET, ARMS LENGTH") |
      (str_detect(sale_type, "VALID") & !str_detect(sale_type, "INVALID"))
  ) %>%
  distinct(sale_id, parcel_id)

valid_mixed_use_sales <- valid_single_parcel_sales %>%
  inner_join(stable_com_cost, join_by(parcel_id)) %>%
  inner_join(stable_res_cost, join_by(parcel_id)) %>%
  distinct(sale_id) %>%
  mutate(valid_comp = TRUE, valid_ratio = FALSE, valid_model = FALSE)

valid_res_sales <- valid_single_parcel_sales %>%
  inner_join(stable_res_cost,      join_by(parcel_id)) %>%
  anti_join(valid_mixed_use_sales, join_by(sale_id)) %>%
  distinct(sale_id) %>%
  mutate(valid_comp = TRUE, valid_ratio = TRUE, valid_model = TRUE)

valid_com_sales <- valid_single_parcel_sales %>%
  inner_join(stable_com_cost,      join_by(parcel_id)) %>%
  anti_join(valid_mixed_use_sales, join_by(sale_id)) %>%
  anti_join(valid_res_sales,       join_by(sale_id)) %>%
  distinct(sale_id) %>%
  mutate(valid_comp = TRUE, valid_ratio = TRUE, valid_model = TRUE)

sale_validity <- bind_rows(valid_mixed_use_sales, valid_res_sales, valid_com_sales)


# =============================================================================
# 5. BUILD SALE SNAPSHOTS
#    All sales get JSON columns populated from all available devnet data.
#    Stable data is only used above for validity flags.
# =============================================================================

# -- Parcel snapshot ----------------------------------------------------------
# All parcels joined at year of sale regardless of stability.

parcel_lookup <- parcels %>%
  select(
    parcel_id,
    year,
    property_class,
    occupancy,
    tax_status,
    taxcode,
    class_code,
    ward,
    cda,
    assessor_neighborhood,
    site_address,
    appraised_total,
    centroid,
    geometry
  )

parcel_at_sale <- sales %>%
  select(sale_id, parcel_id, sale_year) %>%
  left_join(parcel_lookup, join_by(parcel_id, closest(sale_year >= year))) %>%
  left_join(land_reports %>% mutate(lower_year = year - 1), join_by(parcel_id, closest(sale_year <= lower_year))) %>%
  left_join(
    parcel_addresses %>% 
      rename(addr_geom = geometry) %>%
      mutate(last_year = replace_na(last_year, 9999)),
    join_by(parcel_id, sale_year >= first_year, closest(sale_year <= last_year)), 
    multiple = "first"
  ) %>%
  mutate(
    location = if_else(!st_is_empty(centroid), centroid, addr_geom)
  ) %>%
  select(-addr_geom, -centroid) %>% 
  mutate(
    centroid_x = round(st_coordinates(location)[, 1], 4),
    centroid_y = round(st_coordinates(location)[, 2], 4)
  ) %>%
  st_drop_geometry()

parcel_snapshot <- parcel_at_sale %>%
  group_by(sale_id) %>%
  summarise(
    snapshot_parcels_json      = toJSON(
      pick(parcel_id, property_class, occupancy, tax_status, taxcode,
           class_code, ward, cda, assessor_neighborhood, site_address,
           appraised_total, frontage_sqft, land_area_sqft),
      na = "null"
    ),
    snapshot_number_of_parcels = n(),
    snapshot_frontage = round(sum(frontage_sqft, na.rm = TRUE)),
    snapshot_land_area_sqft = round(sum(land_area_sqft, na.rm = TRUE)),
    snapshot_appraised_total   = round(sum(appraised_total, na.rm = TRUE)),
    snapshot_centroid_x        = round(mean(centroid_x,     na.rm = TRUE), 4),
    snapshot_centroid_y        = round(mean(centroid_y,     na.rm = TRUE), 4),
    .groups = "drop"
  )

sale_snapshot_parcels <- parcel_at_sale %>%
  select(
    sale_id,
    parcel_id,
    property_class,
    occupancy,
    tax_status,
    taxcode,
    class_code,
    ward,
    cda,
    assessor_neighborhood,
    site_address,
    frontage_sqft,
    land_area_sqft,
    appraised_total,
    centroid_x,
    centroid_y
  ) %>%
  filter(!is.na(parcel_id)) %>%
  distinct()

# -- Residential cost snapshot ------------------------------------------------
# All res structures joined at year after sale regardless of stability.

res_cost_lookup <- res_cost %>%
  mutate(lower_year = year - 1)

res_cost_at_sale <- sales %>%
  select(sale_id, parcel_id, sale_year) %>%
  left_join(
    res_cost_lookup,
    join_by(parcel_id, closest(sale_year <= lower_year))
  ) %>%
  select(-lower_year, -year)

res_cost_snapshot <- res_cost_at_sale %>%
  filter(!is.na(structure_name)) %>%
  group_by(sale_id) %>%
  summarise(
    snapshot_res_cost_json            = toJSON(
      pick(parcel_id, structure_name, condition, condition_score,
           year_built, eff_year_build, base_material),
      na = "null"
    ),
    snapshot_number_of_res_structures = n(),
    .groups = "drop"
  )

sale_snapshot_res_cost <- res_cost_at_sale %>%
  filter(!is.na(structure_name)) %>%
  select(
    sale_id,
    parcel_id,
    structure_name,
    condition,
    condition_score,
    year_built,
    eff_year_build,
    base_material
  ) %>%
  distinct()

# -- Residential RFC snapshot -------------------------------------------------

res_rfc_lookup <- res_rfcs %>%
  mutate(lower_year = year - 1)

res_rfc_at_sale <- sales %>%
  select(sale_id, parcel_id, sale_year) %>%
  left_join(
    res_rfc_lookup,
    join_by(parcel_id, closest(sale_year <= lower_year))
  ) %>%
  select(-lower_year, -year)

res_rfc_snapshot <- res_rfc_at_sale %>%
  filter(!is.na(structure_type)) %>%
  group_by(sale_id) %>%
  summarise(
    snapshot_res_rfc_json             = toJSON(
      pick(parcel_id, structure_type, number_of_stories,
           gross_living_area, first_floor_living_area, second_floor_living_area,
           third_floor_living_area, half_story_living_area,
           basement_livable_sqft, basement_unfinished_sqft,
           attic_livable_sqft, attic_unfinished_sqft,
           addition_sqft, addition_material,
           attached_garage_sqft, detached_garage_sqft,
           number_of_bedrooms, number_of_bathrooms),
      na = "null"
    ),
    snapshot_gross_living_area        = round(sum(gross_living_area,        na.rm = TRUE)),
    snapshot_first_floor_living_area  = round(sum(first_floor_living_area,  na.rm = TRUE)),
    snapshot_second_floor_living_area = round(sum(second_floor_living_area, na.rm = TRUE)),
    snapshot_third_floor_living_area  = round(sum(third_floor_living_area,  na.rm = TRUE)),
    snapshot_half_story_living_area   = round(sum(half_story_living_area,   na.rm = TRUE)),
    snapshot_basement_livable_sqft    = round(sum(basement_livable_sqft,    na.rm = TRUE)),
    snapshot_basement_unfinished_sqft = round(sum(basement_unfinished_sqft, na.rm = TRUE)),
    snapshot_attic_livable_sqft       = round(sum(attic_livable_sqft,       na.rm = TRUE)),
    snapshot_attic_unfinished_sqft    = round(sum(attic_unfinished_sqft,    na.rm = TRUE)),
    snapshot_addition_sqft            = round(sum(addition_sqft,            na.rm = TRUE)),
    snapshot_attached_garage_sqft     = round(sum(attached_garage_sqft,     na.rm = TRUE)),
    snapshot_detached_garage_sqft     = round(sum(detached_garage_sqft,     na.rm = TRUE)),
    snapshot_number_of_bedrooms       = round(sum(number_of_bedrooms,       na.rm = TRUE)),
    snapshot_number_of_bathrooms      = round(sum(number_of_bathrooms,      na.rm = TRUE)),
    .groups = "drop"
  )

sale_snapshot_res_rfc <- res_rfc_at_sale %>%
  filter(!is.na(structure_type)) %>%
  select(
    sale_id,
    parcel_id,
    structure_type,
    number_of_stories,
    gross_living_area,
    first_floor_living_area,
    second_floor_living_area,
    third_floor_living_area,
    half_story_living_area,
    basement_livable_sqft,
    basement_unfinished_sqft,
    attic_livable_sqft,
    attic_unfinished_sqft,
    addition_sqft,
    addition_material,
    attached_garage_sqft,
    detached_garage_sqft,
    number_of_bedrooms,
    number_of_bathrooms
  ) %>%
  distinct()

# -- Commercial cost snapshot -------------------------------------------------
# All com structures joined at year after sale regardless of stability.

com_cost_lookup <- com_cost_structures %>%
  mutate(lower_year = year - 1)

com_cost_at_sale <- sales %>%
  select(sale_id, parcel_id, sale_year) %>%
  left_join(
    com_cost_lookup,
    join_by(parcel_id, closest(sale_year <= lower_year))
  ) %>%
  select(-lower_year, -year)

com_snapshot <- com_cost_at_sale %>%
  filter(!is.na(structure_id)) %>%
  group_by(sale_id) %>%
  summarise(
    snapshot_com_structures_json      = toJSON(
      pick(parcel_id, structure_id, structure, structure_category,
           structure_type, year_built, effective_age, number_of_sections,
           sqft, rcn, rcnld, depreciation),
      na = "null"
    ),
    snapshot_number_of_com_structures = n_distinct(structure_id, na.rm = TRUE),
    snapshot_com_sqft                 = round(sum(sqft,         na.rm = TRUE)),
    snapshot_com_rcn                  = round(sum(rcn,          na.rm = TRUE)),
    snapshot_com_rcnld                = round(sum(rcnld,        na.rm = TRUE)),
    snapshot_com_depreciation         = round(sum(depreciation, na.rm = TRUE)),
    .groups = "drop"
  )

sale_snapshot_com_cost <- com_cost_at_sale %>%
  filter(!is.na(structure_id)) %>%
  select(
    sale_id,
    parcel_id,
    structure_id,
    structure,
    structure_category,
    structure_type,
    year_built,
    effective_age,
    number_of_sections,
    sqft,
    rcn,
    rcnld,
    depreciation
  ) %>%
  distinct()

# -- Assemble snapshots -------------------------------------------------------

sale_snapshots_new <- sales %>%
  distinct(sale_id, sale_year, sale_date, sale_price, sale_type, field_review_date) %>%
  add_count(sale_id, name = "n_parcels") %>%
  left_join(sale_validity,    join_by(sale_id)) %>%
  left_join(parcel_snapshot,  join_by(sale_id)) %>%
  left_join(res_cost_snapshot, join_by(sale_id)) %>%
  left_join(res_rfc_snapshot,  join_by(sale_id)) %>%
  left_join(com_snapshot,      join_by(sale_id)) %>%
  mutate(
    valid_comp  = replace_na(valid_comp,  FALSE),
    valid_ratio = replace_na(valid_ratio, FALSE),
    valid_model = replace_na(valid_model, FALSE),
    snapshot_number_of_parcels        = replace_na(snapshot_number_of_parcels,        0L),
    snapshot_number_of_res_structures = replace_na(snapshot_number_of_res_structures, 0L),
    snapshot_number_of_com_structures = replace_na(snapshot_number_of_com_structures, 0L),
    snapshot_price_per_res_living_sqft = case_when(
      !is.na(snapshot_gross_living_area) & snapshot_gross_living_area > 0 ~
        round(sale_price / snapshot_gross_living_area, 2),
      TRUE ~ NA_real_
    ),
    snapshot_price_per_com_sqft = case_when(
      !is.na(snapshot_com_sqft) & snapshot_com_sqft > 0 ~
        round(sale_price / snapshot_com_sqft, 2),
      TRUE ~ NA_real_
    ),
    snapshot_land_to_building_ratio = case_when(
      (replace_na(snapshot_gross_living_area, 0) + replace_na(snapshot_com_sqft, 0)) > 0 &
        !is.na(snapshot_land_area_sqft) ~
        round(
          snapshot_land_area_sqft /
            (replace_na(snapshot_gross_living_area, 0) + replace_na(snapshot_com_sqft, 0)),
          4
        ),
      TRUE ~ NA_real_
    ),
    snapshot_source = case_when(
      n_parcels > 1                                                                    ~ "manual_required",
      snapshot_number_of_res_structures > 1                                            ~ "manual_required",
      snapshot_number_of_com_structures > 1                                            ~ "manual_required",
      snapshot_number_of_res_structures >= 1 & snapshot_number_of_com_structures >= 1 ~ "manual_required",
      valid_comp & !is.na(snapshot_parcels_json)                                       ~ "auto",
      TRUE                                                                             ~ "manual_required"
    ),
    snapshot_reviewed = FALSE
  ) %>%
  select(-n_parcels)

nas = sale_snapshots_new %>% 
  filter(is.na(snapshot_centroid_x))
source_counts <- sale_snapshots_new %>% count(snapshot_source)


# =============================================================================
# 6. PUSH DEVNET SYNC TABLES TO SUPABASE (view-only)
# =============================================================================

generate_postgres_table_def(parcels,             "parcels")
generate_postgres_table_def(sales,               "sales")
generate_postgres_table_def(res_cost,            "res_cost")
generate_postgres_table_def(res_rfcs,            "res_rfcs")
generate_postgres_table_def(com_cost_structures, "com_cost_structures")
generate_postgres_table_def(com_cost_sections,   "com_cost_sections")

insert_batches(parcels,             2500, "/parcels")
insert_batches(sales,               2500, "/sales")
insert_batches(res_cost,            2500, "/res_cost")
insert_batches(res_rfcs,            2500, "/res_rfcs")
insert_batches(com_cost_structures, 2500, "/com_cost_structures")
insert_batches(com_cost_sections,   2500, "/com_cost_sections")


# =============================================================================
# 7. PUSH SALE SNAPSHOTS TO SUPABASE
#
#    Two separate operations:
#      (a) sale_type patch  — runs every time, overwrites sale_type on all
#                             existing rows so it stays in sync with devnet
#      (b) new row insert   — insert-only, never overwrites snapshot data or
#                             user edits on rows that already exist
#      (c) push normalized snapshot child tables for querying
# =============================================================================

generate_postgres_table_def(sale_snapshots_new, "sale_snapshots")
generate_postgres_table_def(sale_snapshot_parcels, "sale_snapshot_parcels")
generate_postgres_table_def(sale_snapshot_res_cost, "sale_snapshot_res_cost")
generate_postgres_table_def(sale_snapshot_res_rfc, "sale_snapshot_res_rfc")
generate_postgres_table_def(sale_snapshot_com_cost, "sale_snapshot_com_cost")

# (a) Patch sale_type on every existing snapshot row from devnet
sale_type_updates <- sales %>%
  distinct(sale_id, sale_type)

patch_batches(sale_type_updates, 2500, "/sale_snapshots")

# (b) Insert only new sale_ids — preserves all existing snapshot data and edits
insert_batches(sale_snapshots_new, 2500, "/sale_snapshots")

# (c) Push queryable snapshot child tables
insert_batches(sale_snapshot_parcels, 2500, "/sale_snapshot_parcels")
insert_batches(sale_snapshot_res_cost, 2500, "/sale_snapshot_res_cost")
insert_batches(sale_snapshot_res_rfc, 2500, "/sale_snapshot_res_rfc")
insert_batches(sale_snapshot_com_cost, 2500, "/sale_snapshot_com_cost")




#call_api(
#  endpoint = "/sale_snapshots",
#  method   = "DELETE",
#  params   = list(sale_id = "not.is.null"),
#  range_start = 0,
#  range_end   = 1000000
#)
