# =============================================================================
# Ivory Daily Sync Pipeline
# =============================================================================
# Purpose
#   1) Load Devnet CSV exports.
#   2) Transform into Ivory mirror/base tables.
#   3) Upsert mirror/base data daily.
#   4) Seed user-editable snapshot child rows only when sales are new.
#   5) Preserve Ivory-only user edits on subsequent daily runs.
#
# Design notes
#   - Keep Devnet-sourced data in schema `mirror` (read-only in app).
#   - Keep computed sale header data in schema `base` (system-managed).
#   - Keep analyst edits and editable snapshot child rows in schema `app`.
#   - Expose a final reporting view by joining base + app by sale_id.
# =============================================================================

suppressPackageStartupMessages({
  library(DBI)
  library(RPostgres)
  library(dplyr)
  library(readr)
  library(stringr)
  library(lubridate)
  library(jsonlite)
  library(glue)
  library(purrr)
})

# ----------------------------- Config ----------------------------------------
CFG <- list(
  csv_dir = Sys.getenv("DEVNET_CSV_DIR", unset = "./data/devnet"),
  db_host = Sys.getenv("IVORY_DB_HOST"),
  db_port = as.integer(Sys.getenv("IVORY_DB_PORT", unset = "5432")),
  db_name = Sys.getenv("IVORY_DB_NAME"),
  db_user = Sys.getenv("IVORY_DB_USER"),
  db_pass = Sys.getenv("IVORY_DB_PASSWORD"),
  db_sslmode = Sys.getenv("IVORY_DB_SSLMODE", unset = "require")
)

required_env <- c("IVORY_DB_HOST", "IVORY_DB_NAME", "IVORY_DB_USER", "IVORY_DB_PASSWORD")
missing_env <- required_env[Sys.getenv(required_env) == ""]
if (length(missing_env) > 0) {
  stop("Missing required environment variables: ", paste(missing_env, collapse = ", "))
}

# ----------------------------- DB Helpers ------------------------------------
connect_ivory <- function(cfg) {
  DBI::dbConnect(
    RPostgres::Postgres(),
    host = cfg$db_host,
    port = cfg$db_port,
    dbname = cfg$db_name,
    user = cfg$db_user,
    password = cfg$db_pass,
    sslmode = cfg$db_sslmode
  )
}

with_advisory_lock <- function(con, lock_key = 81427391L, code) {
  DBI::dbExecute(con, glue("SELECT pg_advisory_lock({lock_key})"))
  on.exit(DBI::dbExecute(con, glue("SELECT pg_advisory_unlock({lock_key})")), add = TRUE)
  force(code)
}

run_tx <- function(con, code) {
  DBI::dbWithTransaction(con, code)
}

copy_upsert <- function(con, df, target_schema, target_table, key_cols, update_cols = NULL) {
  if (nrow(df) == 0) return(invisible(NULL))

  tmp <- paste0("tmp_", target_table, "_", as.integer(Sys.time()))
  DBI::dbWriteTable(con, DBI::Id(schema = "pg_temp", table = tmp), df, temporary = TRUE, overwrite = TRUE)

  cols <- names(df)
  insert_cols_sql <- paste(DBI::dbQuoteIdentifier(con, cols), collapse = ", ")
  key_sql <- paste(DBI::dbQuoteIdentifier(con, key_cols), collapse = ", ")

  if (is.null(update_cols)) {
    update_cols <- setdiff(cols, key_cols)
  }

  set_sql <- paste(
    sprintf(
      "%s = EXCLUDED.%s",
      DBI::dbQuoteIdentifier(con, update_cols),
      DBI::dbQuoteIdentifier(con, update_cols)
    ),
    collapse = ",\n      "
  )

  sql <- glue(
    "INSERT INTO {DBI::dbQuoteIdentifier(con, target_schema)}.{DBI::dbQuoteIdentifier(con, target_table)} ({insert_cols_sql})\n",
    "SELECT {insert_cols_sql}\n",
    "FROM pg_temp.{DBI::dbQuoteIdentifier(con, tmp)}\n",
    "ON CONFLICT ({key_sql}) DO UPDATE SET\n",
    "      {set_sql};"
  )

  DBI::dbExecute(con, sql)
}

# ----------------------------- Extract ---------------------------------------
read_devnet_csv <- function(csv_dir, name) {
  path <- file.path(csv_dir, paste0(name, ".csv"))
  if (!file.exists(path)) stop("Missing CSV file: ", path)
  readr::read_csv(path, show_col_types = FALSE)
}

read_optional_csv <- function(csv_dir, name) {
  path <- file.path(csv_dir, paste0(name, ".csv"))
  if (!file.exists(path)) return(tibble())
  readr::read_csv(path, show_col_types = FALSE)
}

load_exports <- function(csv_dir) {
  list(
    parcels_raw = read_devnet_csv(csv_dir, "parcels"),
    sales_raw = read_devnet_csv(csv_dir, "sales"),
    land_reports_raw = read_devnet_csv(csv_dir, "land_reports"),
    res_cost_raw = read_devnet_csv(csv_dir, "res_cost"),
    res_rfcs_raw = read_devnet_csv(csv_dir, "res_rfcs"),
    com_cost_structures_raw = read_devnet_csv(csv_dir, "com_cost_structures"),
    building_name_to_type_raw = read_optional_csv(csv_dir, "building_name_to_type"),
    building_name_to_cat_raw = read_optional_csv(csv_dir, "building_name_to_cat"),
    census_geocoded_addresses_raw = read_devnet_csv(csv_dir, "geocoded_results"),
    parcel_address_map_raw = read_devnet_csv(csv_dir, "parcel_address_map")
  )
}

# ----------------------------- Transform -------------------------------------
to_parcels <- function(parcels_raw) {
  parcels_raw %>%
    transmute(
      parcel_id = as.character(parcel_id),
      year,
      site_address,
      property_class = prop_class,
      occupancy = land_use,
      tax_status,
      class_code,
      ward,
      cda,
      assessor_neighborhood = suppressWarnings(as.integer(str_sub(neighborhood, 2, 4))),
      appraised_total = suppressWarnings(as.numeric(appraised_total))
    )
}

to_sales <- function(sales_raw) {
  sales_raw %>%
    transmute(
      parcel_id = as.character(parcel_number),
      sale_id = document_number,
      sale_price = as.integer(round(as.numeric(net_selling_price))),
      sale_date = mdy_hms(date_of_sale),
      sale_year = as.integer(year(mdy_hms(date_of_sale))),
      sale_type = toupper(sale_type),
      field_review_date = mdy_hms(field_review_date)
    ) %>%
    filter(!is.na(sale_id))
}

to_res_cost <- function(res_cost_raw) {
  res_cost_raw %>%
    transmute(
      parcel_id = as.character(property_key),
      year,
      structure_name,
      condition,
      condition_score = case_when(
        condition == "Unsound" ~ 1L,
        condition == "Poor" ~ 2L,
        condition == "Fair" ~ 3L,
        condition == "Average" ~ 4L,
        condition == "Good" ~ 5L,
        condition == "Very Good" ~ 6L,
        condition == "Excellent" ~ 7L,
        TRUE ~ NA_integer_
      ),
      year_built,
      effective_year_built = eff_year_build
    )
}

to_res_rfcs <- function(res_rfcs_raw) {
  res_rfcs_raw %>%
    transmute(
      parcel_id = as.character(parcel_number),
      year,
      structure_type,
      gross_living_area = suppressWarnings(as.numeric(gross_living_area)),
      number_of_bedrooms = suppressWarnings(as.numeric(number_of_bedrooms)),
      number_of_bathrooms = suppressWarnings(as.numeric(number_of_bathrooms))
    )
}

to_building_name_to_type <- function(raw) {
  if (nrow(raw) == 0) {
    return(tibble(building_name = character(), structure_type = integer()))
  }

  name_col <- names(raw)[tolower(names(raw)) %in% c("bldgname", "building_name", "structure", "name")][1]
  type_col <- names(raw)[tolower(names(raw)) %in% c("bldgtype", "structure_type", "type")][1]

  if (is.na(name_col) || is.na(type_col)) {
    return(tibble(building_name = character(), structure_type = integer()))
  }

  raw %>%
    transmute(
      building_name = as.character(.data[[name_col]]),
      structure_type = suppressWarnings(as.integer(.data[[type_col]]))
    ) %>%
    filter(!is.na(building_name), building_name != "") %>%
    distinct(building_name, .keep_all = TRUE)
}

to_building_name_to_cat <- function(raw) {
  if (nrow(raw) == 0) {
    return(tibble(building_name = character(), structure_category = integer()))
  }

  name_col <- names(raw)[tolower(names(raw)) %in% c("bldgname", "building_name", "structure", "name")][1]
  cat_col <- names(raw)[tolower(names(raw)) %in% c("bldgcategory", "structure_category", "category")][1]

  if (is.na(name_col) || is.na(cat_col)) {
    return(tibble(building_name = character(), structure_category = integer()))
  }

  raw %>%
    transmute(
      building_name = as.character(.data[[name_col]]),
      structure_category = suppressWarnings(as.integer(.data[[cat_col]]))
    ) %>%
    filter(!is.na(building_name), building_name != "") %>%
    distinct(building_name, .keep_all = TRUE)
}

to_com_cost <- function(com_cost_structures_raw, building_name_to_type, building_name_to_cat) {
  com_base <- com_cost_structures_raw %>%
    transmute(
      parcel_id = as.character(parcel_id),
      year,
      structure_id,
      structure,
      structure_category = suppressWarnings(as.integer(structure_category)),
      structure_type = suppressWarnings(as.integer(structure_type)),
      sqft = suppressWarnings(as.numeric(sqft)),
      rcn = suppressWarnings(as.numeric(rcn)),
      rcnld = suppressWarnings(as.numeric(rcnld))
    )

  com_with_type <- com_base %>%
    left_join(
      building_name_to_type,
      by = c("structure" = "building_name"),
      suffix = c("", "_lkp")
    ) %>%
    mutate(structure_type = coalesce(structure_type, structure_type_lkp)) %>%
    select(-structure_type_lkp)

  com_with_type %>%
    left_join(
      building_name_to_cat,
      by = c("structure" = "building_name"),
      suffix = c("", "_lkp")
    ) %>%
    mutate(structure_category = coalesce(structure_category, structure_category_lkp)) %>%
    select(-structure_category_lkp)
}

first_existing_col <- function(df, candidates) {
  matches <- candidates[candidates %in% names(df)]
  if (length(matches) == 0) return(rep(NA, nrow(df)))
  df[[matches[[1]]]]
}

to_land_reports <- function(land_reports_raw) {
  parcel_id_src <- first_existing_col(land_reports_raw, c("parcel_id", "parcel_number"))
  year_src <- first_existing_col(land_reports_raw, c("year", "tax_year"))
  frontage_src <- first_existing_col(land_reports_raw, c("frontage_sqft", "frontage"))
  land_area_src <- first_existing_col(land_reports_raw, c("land_area_sqft", "sqft"))
  price_per_front_ft_src <- first_existing_col(land_reports_raw, c("price_per_front_ft"))
  price_per_sqft_src <- first_existing_col(land_reports_raw, c("price_per_sqft"))
  total_percent_adjustment_src <- first_existing_col(land_reports_raw, c("total_percent_adjustment"))

  land_reports_raw %>%
    transmute(
      parcel_id = as.character(parcel_id_src),
      year = suppressWarnings(as.integer(year_src)),
      frontage_sqft = suppressWarnings(as.numeric(frontage_src)),
      land_area_sqft = suppressWarnings(as.numeric(land_area_src)),
      price_per_front_ft = suppressWarnings(as.numeric(price_per_front_ft_src)),
      price_per_sqft = suppressWarnings(as.numeric(price_per_sqft_src)),
      total_percent_adjustment = suppressWarnings(as.numeric(total_percent_adjustment_src))
    ) %>%
    mutate(parcel_id = if_else(parcel_id == "", NA_character_, parcel_id))
}

build_parcel_land_summary <- function(land_reports) {
  if (nrow(land_reports) == 0) {
    return(tibble(
      parcel_id = character(),
      year = integer(),
      frontage_sqft = numeric(),
      land_area_sqft = numeric(),
      land_price_per_front_ft_sum = numeric(),
      land_price_per_sqft_sum = numeric(),
      land_total_percent_adjustment_sum = numeric(),
      land_report_row_count = integer()
    ))
  }

  land_reports %>%
    filter(!is.na(parcel_id), !is.na(year)) %>%
    group_by(parcel_id, year) %>%
    summarise(
      across(
        .cols = where(is.numeric) & !any_of(c("year")),
        .fns = ~ sum(.x, na.rm = TRUE),
        .names = "{.col}"
      ),
      land_report_row_count = n(),
      .groups = "drop"
    ) %>%
    rename(
      land_price_per_front_ft_sum = price_per_front_ft,
      land_price_per_sqft_sum = price_per_sqft,
      land_total_percent_adjustment_sum = total_percent_adjustment
    )
}

build_parcel_structure_summary <- function(res_cost, res_rfcs, com_cost) {
  res_summary <- res_cost %>%
    filter(!is.na(parcel_id), !is.na(year), !is.na(structure_name)) %>%
    group_by(parcel_id, year) %>%
    summarise(
      res_structure_count = n_distinct(structure_name),
      avg_res_condition_score = round(mean(condition_score, na.rm = TRUE), 2),
      .groups = "drop"
    )

  rfc_summary <- res_rfcs %>%
    filter(!is.na(parcel_id), !is.na(year)) %>%
    group_by(parcel_id, year) %>%
    summarise(
      res_gross_living_area_sqft = round(sum(gross_living_area, na.rm = TRUE)),
      .groups = "drop"
    )

  com_summary <- com_cost %>%
    filter(!is.na(parcel_id), !is.na(year), !is.na(structure_id)) %>%
    group_by(parcel_id, year) %>%
    summarise(
      com_structure_count = n_distinct(structure_id),
      com_structure_sqft = round(sum(sqft, na.rm = TRUE)),
      com_structure_type_values = toJSON(sort(unique(structure_type[!is.na(structure_type)]))),
      com_structure_category_values = toJSON(sort(unique(structure_category[!is.na(structure_category)]))),
      .groups = "drop"
    )

  res_summary %>%
    full_join(rfc_summary, by = c("parcel_id", "year")) %>%
    full_join(com_summary, by = c("parcel_id", "year")) %>%
    mutate(
      res_structure_count = coalesce(res_structure_count, 0L),
      com_structure_count = coalesce(com_structure_count, 0L),
      total_structure_count = as.integer(res_structure_count + com_structure_count),
      res_gross_living_area_sqft = coalesce(res_gross_living_area_sqft, 0),
      com_structure_sqft = coalesce(com_structure_sqft, 0),
      total_structure_sqft = as.integer(res_gross_living_area_sqft + com_structure_sqft),
      has_res_structures = res_structure_count > 0,
      has_com_structures = com_structure_count > 0
    )
}

to_census_addresses <- function(census_geocoded_addresses_raw) {
  census_geocoded_addresses_raw %>%
    transmute(
      address_id,
      raw_address = output_address,
      tigerline_id,
      tigerline_id_side,
      lon = suppressWarnings(as.numeric(lon)),
      lat = suppressWarnings(as.numeric(lat))
    ) %>%
    distinct(address_id, .keep_all = TRUE)
}

to_parcel_address_seed <- function(parcel_address_map_raw, census_addresses) {
  parcel_address_map_raw %>%
    transmute(
      parcel_id = as.character(parcel_id),
      address_id,
      unit = case_when(location == "0000" ~ NA_character_, TRUE ~ as.character(location)),
      is_primary = if_else(is_primary %in% c(1, TRUE), TRUE, FALSE),
      first_year = suppressWarnings(as.integer(first_year)),
      last_year = suppressWarnings(as.integer(last_year))
    ) %>%
    semi_join(census_addresses %>% select(address_id), by = "address_id") %>%
    distinct()
}

seed_insert_only <- function(con, df, target_schema, target_table, key_cols) {
  if (nrow(df) == 0) return(invisible(NULL))

  tmp <- paste0("tmp_seed_", target_table, "_", as.integer(Sys.time()))
  DBI::dbWriteTable(con, DBI::Id(schema = "pg_temp", table = tmp), df, temporary = TRUE, overwrite = TRUE)

  cols <- names(df)
  insert_cols_sql <- paste(DBI::dbQuoteIdentifier(con, cols), collapse = ", ")
  key_sql <- paste(DBI::dbQuoteIdentifier(con, key_cols), collapse = ", ")

  sql <- glue(
    "INSERT INTO {DBI::dbQuoteIdentifier(con, target_schema)}.{DBI::dbQuoteIdentifier(con, target_table)} ({insert_cols_sql})\n",
    "SELECT {insert_cols_sql}\n",
    "FROM pg_temp.{DBI::dbQuoteIdentifier(con, tmp)}\n",
    "ON CONFLICT ({key_sql}) DO NOTHING;"
  )

  DBI::dbExecute(con, sql)
}

build_sale_validity <- function(sales, parcels, res_cost, res_rfcs, com_cost) {
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

  stable_com_cost <- com_cost %>%
    filter(year >= 2020) %>%
    group_by(parcel_id) %>%
    filter(n_distinct(year) == n_distinct(com_cost$year[com_cost$year >= 2020])) %>%
    ungroup() %>%
    distinct(parcel_id)

  single_parcel_sales <- sales %>%
    group_by(sale_id) %>%
    filter(n_distinct(parcel_id) == 1) %>%
    ungroup() %>%
    distinct(sale_id)

  valid_single_parcel_sales <- sales %>%
    filter(sale_price > 10) %>%
    inner_join(single_parcel_sales, by = "sale_id") %>%
    inner_join(stable_parcels, by = "parcel_id") %>%
    filter(
      str_detect(sale_type, "OPEN MARKET, ARMS LENGTH") |
        (str_detect(sale_type, "VALID") & !str_detect(sale_type, "INVALID"))
    ) %>%
    distinct(sale_id, parcel_id)

  valid_mixed_use_sales <- valid_single_parcel_sales %>%
    inner_join(stable_com_cost, by = "parcel_id") %>%
    inner_join(stable_res_cost, by = "parcel_id") %>%
    inner_join(stable_res_rfc, by = "parcel_id") %>%
    distinct(sale_id) %>%
    mutate(valid_comp = TRUE, valid_ratio = FALSE, valid_model = FALSE)

  valid_res_sales <- valid_single_parcel_sales %>%
    inner_join(stable_res_cost, by = "parcel_id") %>%
    inner_join(stable_res_rfc, by = "parcel_id") %>%
    anti_join(valid_mixed_use_sales, by = "sale_id") %>%
    distinct(sale_id) %>%
    mutate(valid_comp = TRUE, valid_ratio = TRUE, valid_model = TRUE)

  valid_com_sales <- valid_single_parcel_sales %>%
    inner_join(stable_com_cost, by = "parcel_id") %>%
    anti_join(valid_mixed_use_sales, by = "sale_id") %>%
    anti_join(valid_res_sales, by = "sale_id") %>%
    distinct(sale_id) %>%
    mutate(valid_comp = TRUE, valid_ratio = TRUE, valid_model = TRUE)

  bind_rows(valid_mixed_use_sales, valid_res_sales, valid_com_sales) %>%
    distinct(sale_id, .keep_all = TRUE)
}

build_sale_snapshot_data <- function(sales, parcels, res_cost, res_rfcs, com_cost, sale_validity) {
  parcel_at_sale <- sales %>%
    select(sale_id, parcel_id, sale_year) %>%
    left_join(parcels, by = "parcel_id") %>%
    filter(!is.na(year), year <= sale_year) %>%
    # Keep the closest parcel record for each parcel in the sale year context.
    # A sale can include multiple parcels, so we must partition by both keys.
    group_by(sale_id, parcel_id) %>%
    slice_max(order_by = year, n = 1, with_ties = FALSE) %>%
    ungroup()

  parcel_snapshot <- parcel_at_sale %>%
    group_by(sale_id) %>%
    summarise(
      snapshot_parcels_json = toJSON(
        cur_data() %>% select(parcel_id, property_class, occupancy, tax_status, class_code, ward, cda, assessor_neighborhood, site_address, appraised_total),
        na = "null"
      ),
      snapshot_number_of_parcels = n(),
      snapshot_appraised_total = round(sum(appraised_total, na.rm = TRUE)),
      .groups = "drop"
    )

  res_cost_at_sale <- sales %>%
    select(sale_id, parcel_id, sale_year) %>%
    left_join(res_cost, by = "parcel_id") %>%
    filter(!is.na(year), year == sale_year + 1)

  res_snapshot <- res_cost_at_sale %>%
    group_by(sale_id) %>%
    summarise(
      snapshot_res_cost_json = toJSON(
        cur_data() %>% select(parcel_id, structure_name, condition, condition_score, year_built, effective_year_built),
        na = "null"
      ),
      snapshot_number_of_res_structures = n(),
      .groups = "drop"
    )

  res_rfc_snapshot <- sales %>%
    select(sale_id, parcel_id, sale_year) %>%
    left_join(res_rfcs, by = "parcel_id") %>%
    filter(!is.na(year), year == sale_year + 1) %>%
    group_by(sale_id) %>%
    summarise(
      snapshot_res_rfc_json = toJSON(
        cur_data() %>% select(parcel_id, structure_type, gross_living_area, number_of_bedrooms, number_of_bathrooms),
        na = "null"
      ),
      snapshot_gross_living_area = round(sum(gross_living_area, na.rm = TRUE)),
      .groups = "drop"
    )

  com_cost_at_sale <- sales %>%
    select(sale_id, parcel_id, sale_year) %>%
    left_join(com_cost, by = "parcel_id") %>%
    filter(!is.na(year), year == sale_year + 1)

  com_snapshot <- com_cost_at_sale %>%
    group_by(sale_id) %>%
    summarise(
      snapshot_com_structures_json = toJSON(
        cur_data() %>% select(parcel_id, structure_id, structure, structure_category, structure_type, sqft, rcn, rcnld),
        na = "null"
      ),
      snapshot_number_of_com_structures = n_distinct(structure_id),
      snapshot_com_sqft = round(sum(sqft, na.rm = TRUE)),
      .groups = "drop"
    )

  sale_snapshots_base <- sales %>%
    distinct(sale_id, sale_year, sale_date, sale_price, sale_type, field_review_date) %>%
    left_join(sale_validity, by = "sale_id") %>%
    left_join(parcel_snapshot, by = "sale_id") %>%
    left_join(res_snapshot, by = "sale_id") %>%
    left_join(res_rfc_snapshot, by = "sale_id") %>%
    left_join(com_snapshot, by = "sale_id") %>%
    mutate(
      valid_comp = coalesce(valid_comp, FALSE),
      valid_ratio = coalesce(valid_ratio, FALSE),
      valid_model = coalesce(valid_model, FALSE),
      snapshot_number_of_parcels = coalesce(snapshot_number_of_parcels, 0L),
      snapshot_number_of_res_structures = coalesce(snapshot_number_of_res_structures, 0L),
      snapshot_number_of_com_structures = coalesce(snapshot_number_of_com_structures, 0L),
      snapshot_source = case_when(
        snapshot_number_of_parcels > 1 ~ "manual_required",
        snapshot_number_of_res_structures > 1 ~ "manual_required",
        snapshot_number_of_com_structures > 1 ~ "manual_required",
        TRUE ~ "auto"
      )
    )

  sale_snapshot_parcels <- parcel_at_sale %>%
    select(
      sale_id,
      parcel_id,
      property_class,
      occupancy,
      tax_status,
      class_code,
      ward,
      cda,
      assessor_neighborhood,
      site_address,
      appraised_total
    ) %>%
    distinct()

  sale_snapshot_res_structures <- res_cost_at_sale %>%
    select(
      sale_id,
      parcel_id,
      structure_name,
      condition,
      condition_score,
      year_built,
      effective_year_built
    ) %>%
    filter(!is.na(structure_name)) %>%
    distinct()

  sale_snapshot_com_structures <- com_cost_at_sale %>%
    select(
      sale_id,
      parcel_id,
      structure_id,
      structure,
      structure_category,
      structure_type,
      sqft,
      rcn,
      rcnld
    ) %>%
    filter(!is.na(structure_id)) %>%
    distinct()

  list(
    sale_snapshots_base = sale_snapshots_base,
    sale_snapshot_parcels = sale_snapshot_parcels,
    sale_snapshot_res_structures = sale_snapshot_res_structures,
    sale_snapshot_com_structures = sale_snapshot_com_structures
  )
}

# ----------------------------- Load ------------------------------------------
sync_all <- function(con, exports) {
  parcels <- to_parcels(exports$parcels_raw)
  sales <- to_sales(exports$sales_raw)
  land_reports <- to_land_reports(exports$land_reports_raw)
  res_cost <- to_res_cost(exports$res_cost_raw)
  res_rfcs <- to_res_rfcs(exports$res_rfcs_raw)
  building_name_to_type <- to_building_name_to_type(exports$building_name_to_type_raw)
  building_name_to_cat <- to_building_name_to_cat(exports$building_name_to_cat_raw)
  com_cost <- to_com_cost(exports$com_cost_structures_raw, building_name_to_type, building_name_to_cat)
  parcel_land_summary <- build_parcel_land_summary(land_reports)
  parcel_structure_summary <- build_parcel_structure_summary(res_cost, res_rfcs, com_cost)
  sale_validity <- build_sale_validity(sales, parcels, res_cost, res_rfcs, com_cost)
  census_addresses <- to_census_addresses(exports$census_geocoded_addresses_raw)
  parcel_address_seed <- to_parcel_address_seed(exports$parcel_address_map_raw, census_addresses)

  parcels <- parcels %>%
    left_join(parcel_land_summary, by = c("parcel_id", "year")) %>%
    left_join(parcel_structure_summary, by = c("parcel_id", "year")) %>%
    mutate(
      frontage_sqft = coalesce(frontage_sqft, 0),
      land_area_sqft = coalesce(land_area_sqft, 0),
      land_price_per_front_ft_sum = coalesce(land_price_per_front_ft_sum, 0),
      land_price_per_sqft_sum = coalesce(land_price_per_sqft_sum, 0),
      land_total_percent_adjustment_sum = coalesce(land_total_percent_adjustment_sum, 0),
      land_report_row_count = coalesce(land_report_row_count, 0L),
      res_structure_count = coalesce(res_structure_count, 0L),
      com_structure_count = coalesce(com_structure_count, 0L),
      total_structure_count = coalesce(total_structure_count, 0L),
      res_gross_living_area_sqft = coalesce(res_gross_living_area_sqft, 0),
      com_structure_sqft = coalesce(com_structure_sqft, 0),
      total_structure_sqft = coalesce(total_structure_sqft, 0),
      has_res_structures = coalesce(has_res_structures, FALSE),
      has_com_structures = coalesce(has_com_structures, FALSE),
      com_structure_type_values = coalesce(com_structure_type_values, "[]"),
      com_structure_category_values = coalesce(com_structure_category_values, "[]")
    )

  snapshot_data <- build_sale_snapshot_data(sales, parcels, res_cost, res_rfcs, com_cost, sale_validity)

  # Mirror tables: all columns are system-managed.
  copy_upsert(con, parcels, "mirror", "parcels", key_cols = c("parcel_id", "year"))
  copy_upsert(con, sales, "mirror", "sales", key_cols = c("sale_id", "parcel_id"))
  copy_upsert(con, building_name_to_type, "mirror", "building_name_to_type", key_cols = c("building_name"))
  copy_upsert(con, building_name_to_cat, "mirror", "building_name_to_cat", key_cols = c("building_name"))
  copy_upsert(con, res_cost, "mirror", "res_cost", key_cols = c("parcel_id", "year", "structure_name"))
  copy_upsert(con, res_rfcs, "mirror", "res_rfcs", key_cols = c("parcel_id", "year", "structure_type"))
  copy_upsert(con, com_cost, "mirror", "com_cost_structures", key_cols = c("parcel_id", "year", "structure_id"))

  # Base snapshot table: system-managed only.
  # DO NOT put analyst-editable time-of-sale fields in this table.
  copy_upsert(con, snapshot_data$sale_snapshots_base, "base", "sale_snapshots_base", key_cols = c("sale_id"))

  # Optional: keep sale_type synced even for existing rows in app.sale_snapshots_edits.
  sale_type_updates <- sales %>% distinct(sale_id, sale_type)
  copy_upsert(
    con,
    sale_type_updates,
    "app",
    "sale_snapshots_edits",
    key_cols = c("sale_id"),
    update_cols = c("sale_type")
  )

  # Editable child snapshot tables: seed once per sale/key and never overwrite.
  # Users can modify these rows after initial creation.
  seed_insert_only(
    con,
    snapshot_data$sale_snapshot_parcels,
    "app",
    "sale_snapshot_parcels",
    key_cols = c("sale_id", "parcel_id")
  )

  seed_insert_only(
    con,
    snapshot_data$sale_snapshot_res_structures,
    "app",
    "sale_snapshot_res_structures",
    key_cols = c("sale_id", "parcel_id", "structure_name")
  )

  seed_insert_only(
    con,
    snapshot_data$sale_snapshot_com_structures,
    "app",
    "sale_snapshot_com_structures",
    key_cols = c("sale_id", "parcel_id", "structure_id")
  )

  # User-editable address tables: seed from census files once.
  # Subsequent daily runs only insert missing rows; existing analyst edits are preserved.
  seed_insert_only(
    con,
    census_addresses,
    "app",
    "addresses_lookup",
    key_cols = c("address_id")
  )

  seed_insert_only(
    con,
    parcel_address_seed,
    "app",
    "parcel_addresses",
    key_cols = c("parcel_id", "address_id", "first_year")
  )
}

# ----------------------------- Main ------------------------------------------
main <- function() {
  message("[ivory-sync] Starting daily sync...")
  exports <- load_exports(CFG$csv_dir)

  con <- connect_ivory(CFG)
  on.exit(DBI::dbDisconnect(con), add = TRUE)

  with_advisory_lock(con, code = {
    run_tx(con, {
      sync_all(con, exports)

      DBI::dbExecute(
        con,
        "INSERT INTO app.sync_runs(run_at, status, details) VALUES (NOW(), 'success', 'daily csv sync completed')"
      )
    })
  })

  message("[ivory-sync] Sync completed successfully.")
}

main()
