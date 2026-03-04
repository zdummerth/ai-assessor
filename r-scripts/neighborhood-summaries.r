# =============================================================================
# Neighborhood Sales Summaries
# =============================================================================
# Computes neighborhood-level sales metrics for residential and commercial
# properties, clustered by geography and property characteristics.
# Output: neighborhood_summaries table with JSON metrics column
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
# CONFIGURATION
# =============================================================================

# Define minimum sales threshold for summaries
MIN_SALES_COUNT <- 1

# Clustering parameters for commercial neighborhoods
COM_CLUSTER_COUNT <- 8
COM_CLUSTER_SEED <- 42

# Date filter for recent sales
RECENT_SALES_YEAR_THRESHOLD <- 2022


# =============================================================================
# 1. LOAD RAW DATA
# =============================================================================

# -- Parcels ------------------------------------------------------------------
prcls_raw <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl/1-30-26.xlsx"
)

parcel_shapes <- st_read("I:/GIS/ARCDATA/CITY/Prcl.shp") %>%
  st_transform(crs = 4326)

#https://www.stlouis-mo.gov/data/datasets/dataset.cfm?id=85
cda_shapes <- st_read("C:/Users/dummerthz/Downloads/neighborhoods/Neighborhoods/Neighborhoods.shp") %>% 
  st_transform(crs = 4326)

stl_shape = st_read("C:/Users/dummerthz/Downloads/stl_boundary/stl_boundary.shp") %>% 
  st_transform(crs = 4326)

# -- Buildings ----------------------------------------------------------------
all_bldg <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl_bldg_all/9-10-25.xlsx"
)
com_bldg <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl_bldg_com/9-3-25.xlsx"
)
res_bldg <- readxl::read_xlsx(
  "G:/R-Projects/general/supabase-report-transformations/data/access_table_prcl_bldg_res/11-12-25.xlsx"
)

# -- Residential Cost ---------------------------------------------------------
res_cost_raw <- combine_most_recent_files(
  "G:/R-Projects/general/supabase-report-transformations/data/res_costing_ladder_exports"
)

# -- Sales --------------------------------------------------------------------
sales_raw_files <- combine_most_recent_files(
  "supabase-report-transformations/data/sale_reports"
)

# -- Parcel Info (tax status, class, appraiser) --------------------------------
parcel_info_raw <- get_parcel_info()


# =============================================================================
# 2. PREPARE PARCELS
# =============================================================================

parcels <- prcls_raw %>%
  select(
    parcel_id          = AsrParcelId,
    collector_parcel_id = ColParcelId,
    unit_number         = StdUnitNum,
    zip                 = ZIP,
    owner_name_2        = OwnerName2,
    geo_handle          = Handle,
    class_code          = AsrClassCode,
    abatement_type      = AbatementType,
    abatement_start_year = AbatementStartYear,
    abatement_end_year  = AbatementEndYear,
    sbd_district_1      = SpecBusDist,
    sbd_district_2      = SpecBusDist2,
    sbd_district_3      = SpecBusDist3,
    tif_district        = TIFDist,
    land_area           = LandArea,
    assessed_land       = AsdLand,
    assessed_improvements = AsdImprove,
    assessed_total      = AsdTotal,
    assessed_res_land   = AsdResLand,
    assessed_com_land   = AsdComLand,
    assessed_agr_land   = AsdAgrLand,
    assessed_res_improvements = AsdResImprove,
    assessed_com_improvements = AsdComImprove,
    assessed_agr_improvements = AsdAgrImprove,
    appraised_land      = AprLand,
    appraised_res_land  = AprResLand,
    appraised_com_land  = AprComLand,
    appraised_agr_land  = AprAgrLand,
    appraised_res_improvements = AprResImprove,
    appraised_com_improvements = AprComImprove,
    appraised_agr_improvements = AprAgrImprove,
    ward                = Ward20,
    cda_neighborhood    = Nbrhd,
    assessor_neighborhood = AsrNbrhd
  ) %>%
  convert_parcel_number(parcel_id) %>%
  # drop summary records
  filter(is.na(owner_name_2) | owner_name_2 != "***SUMMARY RECORD; NOT ON LRMS***") %>% 
  select(-owner_name_2)


# -- Add tax status, property class, appraiser --------------------------------
parcel_info <- parcel_info_raw %>%
  select(
    parcel_id       = parcel_number,
    site_address,
    occupancy = land_use,
    tax_status,
    property_class  = prop_class,
    current_appraiser,
    appraised_total,
    year
  ) %>%
  mutate(is_active = TRUE) %>%
  convert_parcel_number(parcel_id, keep_components = TRUE)

parcels <- parcel_info %>%
  filter(year == 2026) %>%
  left_join(parcels, join_by(parcel_id))


# =============================================================================
# 3. PREPARE BUILDINGS
# =============================================================================

buildings <- all_bldg %>%
  left_join(com_bldg, join_by(AsrParcelId, BldgNum)) %>%
  left_join(res_bldg,  join_by(AsrParcelId, BldgNum)) %>%
  select(
    parcel_id                       = AsrParcelId,
    building_number                 = BldgNum,
    building_use                    = BldgUse,
    building_name                   = BldgName,
    building_category               = BldgCategory.x,
    building_type                   = BldgType.x,
    year_built                      = YearBuilt.x,
    effective_year_built            = EffectiveYearBuilt.x,
    number_of_apartments            = NbrOfApts,
    number_of_apartments_one_bed    = NbrOfApts1Br,
    number_of_apartments_two_bed    = NbrOfApts2Br,
    number_of_apartments_three_bed  = NbrOfApts3Br,
    number_of_units                 = NbrOfUnits,
    number_of_stories               = NbrOfStories.x,
    number_of_garages               = NbrOfGarages,
    number_of_carports              = NbrOfCarports,
    number_of_full_baths            = FullBaths,
    number_of_half_baths            = HalfBaths,
    has_attic                       = Attic,
    exterior_wall_type              = ExtWallType,
    notes                           = Notes,
    ground_floor_area               = GroundFloorArea,
    total_area                      = TotalArea.x,
    total_living_area               = LivingAreaTotal,
    living_area_at_grade            = LivingAreaAtGrade,
    finished_basement_area          = BsmtAreaFinished
  ) %>%
  mutate(year = 2026) %>%
  convert_parcel_number(parcel_id)


# =============================================================================
# 4. PREPARE RESIDENTIAL COST
# =============================================================================

res_cost <- res_cost_raw %>%
  filter(year == 2026) %>%
  transmute(
    property_key,
    struct_rcnld_with_oby  = round(struct_rcnld_value + oby_rcnld_value),
    rcnld_with_land       = round(land_value + struct_rcnld_value + oby_rcnld_value),
    rcn_with_land         = round(land_value + struct_rcn_value   + oby_rcn_value)
  ) %>%
  convert_parcel_number(property_key) %>%
  rename(parcel_id = property_key)



# =============================================================================
# 5. PREPARE SALES
# =============================================================================

sales <- sales_raw_files %>%
  convert_parcel_number(parcel_number) %>%
  rename(parcel_id = parcel_number) %>%
  mutate(
    sale_date          = mdy_hms(date_of_sale),
    field_review_date  = mdy_hms(field_review_date),
    sale_year          = as.integer(year(sale_date)),
    sale_price         = as.integer(round(as.numeric(net_selling_price))),
    sale_type          = toupper(sale_type)
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
  filter(!is.na(sale_id), sale_price > 0)


# =============================================================================
# 6. PREPARE SALE-LEVEL DATA WITH GEOMETRY
# =============================================================================

# Join sales with buildings (one building per parcel)
sales_with_buildings <- sales %>% 
  inner_join(buildings, join_by(parcel_id))

# Filter to single-parcel building sales
single_parcel_building_sales <- sales_with_buildings %>% 
  group_by(sale_id) %>% 
  filter(n() == 1) %>% 
  ungroup() %>% 
  filter(
    sale_type == "IMPROVED, OPEN MARKET, ARMS LENGTH"
    | (str_detect(sale_type, 'VALID') & !str_detect(sale_type, 'INVALID'))
  ) %>% 
  filter(sale_price > 10) %>% 
  inner_join(
    parcels %>% select(parcel_id, geo_handle, appraised_total, land_area, 
                       occupancy, cda_neighborhood, assessor_neighborhood, ward), 
    join_by(parcel_id)
  ) %>% 
  inner_join(
    parcel_info %>% select(parcel_id, year, occupancy_at_sale = occupancy), 
    join_by(parcel_id, sale_year == year)
  ) %>%
  inner_join(parcel_shapes, join_by(geo_handle == HANDLE)) %>% 
  left_join(
    res_cost %>% group_by(parcel_id) %>% filter(n() == 1), 
    join_by(parcel_id)
  ) %>%
  mutate(
    sales_ratio = appraised_total / na_if(sale_price, 0),
    cost_ratio = appraised_total / na_if(rcnld_with_land, 0),
    # Normalize occupancy codes
    occupancy = case_when(
      occupancy == "1310" ~ "1110",
      occupancy == "1311" ~ "1111",
      occupancy == "1320" ~ "1120",
      occupancy == "1330" ~ "1130",
      occupancy == "1340" ~ "1140",
      occupancy == "1385" ~ "1185",
      TRUE ~ occupancy
    ),
    occupancy_at_sale = case_when(
      occupancy_at_sale == "1310" ~ "1110",
      occupancy_at_sale == "1311" ~ "1111",
      occupancy_at_sale == "1320" ~ "1120",
      occupancy_at_sale == "1330" ~ "1130",
      occupancy_at_sale == "1340" ~ "1140",
      occupancy_at_sale == "1385" ~ "1185",
      TRUE ~ occupancy_at_sale
    )
  )

# Identify conversion sales (occupancy changed)
conversion_sales <- single_parcel_building_sales %>% 
  filter(occupancy != occupancy_at_sale) %>% 
  select(parcel_id, contains("sale"), contains("occupancy"))


# =============================================================================
# 7. SEGMENT SALES BY PROPERTY TYPE
# =============================================================================

# Apartment sales (multi-family)
apartment_sales <- single_parcel_building_sales %>% 
  filter(occupancy_at_sale == "1185") %>% 
  mutate(
    price_per_sqft = round(sale_price / total_area, 2),
    building_land_ratio = round(total_area / land_area, 2),
    centroid = st_centroid(geometry)
  )

# Condo sales
condo_sales <- single_parcel_building_sales %>% 
  filter(occupancy_at_sale %in% c("1114", "1115")) %>% 
  mutate(
    price_per_sqft = round(sale_price / total_living_area, 2),
    centroid = st_centroid(geometry)
  )

# Residential sales (single-family, townhomes, etc.)
res_sales <- single_parcel_building_sales %>% 
  filter(occupancy_at_sale %in% c("1110", "1111", "1120", "1130", "1140")) %>% 
  mutate(
    price_per_sqft = round(sale_price / na_if(total_living_area, 0), 2),
    centroid = st_centroid(geometry)
  )

# Commercial sales (everything else with building data)
com_sales <- single_parcel_building_sales %>% 
  filter(total_area > 0 & land_area > 0 & !is.na(building_category)) %>% 
  anti_join(apartment_sales, join_by(parcel_id)) %>% 
  anti_join(condo_sales, join_by(parcel_id)) %>% 
  anti_join(res_sales, join_by(parcel_id)) %>% 
  mutate(
    price_per_sqft = round(sale_price / na_if(total_area, 0), 2),
    building_land_ratio = round(total_area / na_if(land_area, 0), 2),
    centroid = st_centroid(geometry)
  )


# =============================================================================
# 8. CREATE COMMERCIAL NEIGHBORHOODS VIA CLUSTERING
# =============================================================================

# Prepare features for k-means clustering
com_sales_features <- com_sales %>%
  mutate(
    x = st_coordinates(centroid)[,1],
    y = st_coordinates(centroid)[,2],
    building_category_num = as.numeric(as.factor(building_category))
  ) %>%
  st_drop_geometry()

# Scale features (emphasize spatial proximity)
features_scaled <- com_sales_features %>%
  select(x, y, building_category_num, price_per_sqft, building_land_ratio) %>%
  mutate(
    x = x * 3,
    y = y * 3
  ) %>%
  scale()

# Perform k-means clustering
set.seed(COM_CLUSTER_SEED)
clusters <- kmeans(
  features_scaled, 
  centers = COM_CLUSTER_COUNT, 
  nstart = 25, 
  iter.max = 100
)

com_sales_features$cluster <- as.factor(clusters$cluster)
com_sales <- com_sales %>%
  mutate(cluster = as.factor(clusters$cluster))

# Create Voronoi polygons for commercial neighborhoods
cluster_centers <- com_sales_features %>%
  group_by(cluster) %>%
  summarise(x = mean(x), y = mean(y)) %>%
  st_as_sf(coords = c("x", "y"), crs = 4326)

stl_shape_proj <- stl_shape %>% st_transform(3857)
cluster_centers_proj <- cluster_centers %>% st_transform(3857)

com_neighborhoods <- cluster_centers_proj %>%
  st_union() %>%
  st_voronoi() %>%
  st_collection_extract("POLYGON") %>%
  st_as_sf() %>%
  st_set_crs(3857) %>%
  st_intersection(stl_shape_proj) %>%
  st_join(cluster_centers_proj) %>%
  st_transform(4326)


# =============================================================================
# 9. CALCULATE NEIGHBORHOOD SUMMARIES
# =============================================================================

# Helper function to create summary metrics
create_sales_metrics <- function(df, group_vars) {
  df %>%
    group_by(across(all_of(group_vars))) %>%
    summarise(
      median_sale_price = median(sale_price, na.rm = TRUE),
      avg_sale_price = mean(sale_price, na.rm = TRUE),
      median_price_sqft = median(price_per_sqft, na.rm = TRUE),
      avg_price_sqft = mean(price_per_sqft, na.rm = TRUE),
      number_of_sales = n(),
      .groups = 'drop'
    ) %>%
    filter(number_of_sales >= MIN_SALES_COUNT)
}

# Helper function to create ratio metrics
create_ratio_metrics <- function(df, group_vars) {
  df %>%
    group_by(across(all_of(group_vars))) %>%
    summarise(
      median_ratio = median(sales_ratio, na.rm = TRUE),
      avg_ratio = mean(sales_ratio, na.rm = TRUE),
      median_cost_ratio = median(cost_ratio, na.rm = TRUE),
      avg_cost_ratio = mean(cost_ratio, na.rm = TRUE),
      number_of_sales = n(),
      .groups = 'drop'
    ) %>%
    filter(number_of_sales >= MIN_SALES_COUNT)
}

# Filter for recent sales
recent_res_sales <- res_sales %>% filter(sale_year > RECENT_SALES_YEAR_THRESHOLD)
recent_res_sales_no_conversion <- recent_res_sales %>% 
  anti_join(conversion_sales, join_by(sale_id))

## Commercial Summaries
com_sales_by_category <- create_sales_metrics(com_sales, c("building_category"))

com_sales_by_category_cda <- create_sales_metrics(
  com_sales, 
  c("building_category", "cda_neighborhood")
)

com_sales_by_cluster <- create_sales_metrics(com_sales, c("cluster"))

com_sales_by_category_cluster <- create_sales_metrics(
  com_sales, 
  c("building_category", "cluster")
)

## Residential Sales Summaries
res_sales_by_occupancy <- create_sales_metrics(
  recent_res_sales, 
  c("occupancy_at_sale")
)

res_sales_by_occupancy_cda <- create_sales_metrics(
  recent_res_sales, 
  c("occupancy_at_sale", "cda_neighborhood")
)

res_sales_by_occupancy_assessor <- create_sales_metrics(
  recent_res_sales, 
  c("occupancy_at_sale", "assessor_neighborhood")
)

res_sales_by_occupancy_ward <- create_sales_metrics(
  recent_res_sales, 
  c("occupancy_at_sale", "ward")
)

## Condo Sales Summaries
condo_sales_by_occupancy <- create_sales_metrics(
  condo_sales %>% filter(sale_year > RECENT_SALES_YEAR_THRESHOLD),
  c("occupancy_at_sale")
)

condo_sales_by_occupancy_cda <- create_sales_metrics(
  condo_sales %>% filter(sale_year > RECENT_SALES_YEAR_THRESHOLD),
  c("occupancy_at_sale", "cda_neighborhood")
)

## Apartment Sales Summaries
apartment_sales_by_occupancy <- create_sales_metrics(
  apartment_sales %>% filter(sale_year > RECENT_SALES_YEAR_THRESHOLD),
  c("occupancy_at_sale")
)

apartment_sales_by_occupancy_cda <- create_sales_metrics(
  apartment_sales %>% filter(sale_year > RECENT_SALES_YEAR_THRESHOLD),
  c("occupancy_at_sale", "cda_neighborhood")
)

## Residential Ratio Summaries (excluding conversions)
res_ratios_by_occupancy <- create_ratio_metrics(
  recent_res_sales_no_conversion, 
  c("occupancy_at_sale")
)

res_ratios_by_occupancy_cda <- create_ratio_metrics(
  recent_res_sales_no_conversion, 
  c("occupancy_at_sale", "cda_neighborhood")
)

res_ratios_by_occupancy_assessor <- create_ratio_metrics(
  recent_res_sales_no_conversion, 
  c("occupancy_at_sale", "assessor_neighborhood")
)


# =============================================================================
# 10. PREPARE FINAL OUTPUT FOR DATABASE
# =============================================================================

# Combine all summaries into a single table with JSON metrics
prepare_neighborhood_summary <- function(summary_df, 
                                         summary_type, 
                                         neighborhood_type,
                                         neighborhood_id_col) {
  summary_df %>%
    mutate(
      summary_type = summary_type,
      neighborhood_type = neighborhood_type
    ) %>%
    rename(neighborhood_id = !!neighborhood_id_col) %>%
    mutate(
      neighborhood_id = as.character(neighborhood_id),
      metrics = pmap(
        list(!!!syms(setdiff(names(.), c("neighborhood_id", "summary_type", "neighborhood_type")))),
        ~ list(...)
      )
    ) %>%
    select(neighborhood_type, neighborhood_id, summary_type, metrics)
}

# Prepare all summaries
all_summaries <- bind_rows(
  # Commercial
  prepare_neighborhood_summary(
    com_sales_by_category, 
    "commercial_sales", 
    "building_category", 
    "building_category"
  ),
  prepare_neighborhood_summary(
    com_sales_by_cluster, 
    "commercial_sales", 
    "commercial_cluster", 
    "cluster"
  ),
  prepare_neighborhood_summary(
    com_sales_by_category_cluster %>% rename(neighborhood_id = cluster), 
    "commercial_sales_by_category", 
    "commercial_cluster", 
    "neighborhood_id"
  ),
  prepare_neighborhood_summary(
    com_sales_by_category_cda %>% rename(neighborhood_id = cda_neighborhood), 
    "commercial_sales_by_category", 
    "cda_neighborhood", 
    "neighborhood_id"
  ),
  
  # Residential Sales
  prepare_neighborhood_summary(
    res_sales_by_occupancy, 
    "residential_sales", 
    "occupancy", 
    "occupancy_at_sale"
  ),
  prepare_neighborhood_summary(
    res_sales_by_occupancy_cda %>% rename(neighborhood_id = cda_neighborhood), 
    "residential_sales_by_occupancy", 
    "cda_neighborhood", 
    "neighborhood_id"
  ),
  prepare_neighborhood_summary(
    res_sales_by_occupancy_assessor %>% rename(neighborhood_id = assessor_neighborhood), 
    "residential_sales_by_occupancy", 
    "assessor_neighborhood", 
    "neighborhood_id"
  ),
  prepare_neighborhood_summary(
    res_sales_by_occupancy_ward %>% rename(neighborhood_id = ward), 
    "residential_sales_by_occupancy", 
    "ward", 
    "neighborhood_id"
  ),
  
  # Condo Sales
  prepare_neighborhood_summary(
    condo_sales_by_occupancy, 
    "condo_sales", 
    "occupancy", 
    "occupancy_at_sale"
  ),
  prepare_neighborhood_summary(
    condo_sales_by_occupancy_cda %>% rename(neighborhood_id = cda_neighborhood), 
    "condo_sales_by_occupancy", 
    "cda_neighborhood", 
    "neighborhood_id"
  ),
  
  # Apartment Sales
  prepare_neighborhood_summary(
    apartment_sales_by_occupancy, 
    "apartment_sales", 
    "occupancy", 
    "occupancy_at_sale"
  ),
  prepare_neighborhood_summary(
    apartment_sales_by_occupancy_cda %>% rename(neighborhood_id = cda_neighborhood), 
    "apartment_sales_by_occupancy", 
    "cda_neighborhood", 
    "neighborhood_id"
  ),
  
  # Residential Ratios
  prepare_neighborhood_summary(
    res_ratios_by_occupancy, 
    "residential_ratios", 
    "occupancy", 
    "occupancy_at_sale"
  ),
  prepare_neighborhood_summary(
    res_ratios_by_occupancy_cda %>% rename(neighborhood_id = cda_neighborhood), 
    "residential_ratios_by_occupancy", 
    "cda_neighborhood", 
    "neighborhood_id"
  ),
  prepare_neighborhood_summary(
    res_ratios_by_occupancy_assessor %>% rename(neighborhood_id = assessor_neighborhood), 
    "residential_ratios_by_occupancy", 
    "assessor_neighborhood", 
    "neighborhood_id"
  )
)

# Convert metrics to JSON
neighborhood_summaries <- all_summaries %>%
  mutate(
    metrics = map_chr(metrics, ~ toJSON(.x, auto_unbox = TRUE)),
    computed_at = Sys.time()
  )


# =============================================================================
# 11. EXPORT TO DATABASE
# =============================================================================

# Insert in batches (function from lib.R)
insert_batches(neighborhood_summaries, 2500, "/neighborhood_summaries")
