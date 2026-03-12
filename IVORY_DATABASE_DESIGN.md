# Ivory Database Design (Devnet Sync + User Editable Time-of-Sale)

## Goal

Keep Ivory synchronized with Devnet daily while preserving Ivory-only user edits for:

- Time-of-sale fields
- Parcel-address edits seeded from census geocoded data

## Architecture

Use ownership-based schemas so sync safety is enforced structurally.

1. `mirror` schema: raw Devnet mirrors (system-managed, overwrite allowed)
2. `base` schema: computed sale headers from mirror data (system-managed, overwrite allowed)
3. `app` schema: user-editable data only (never overwritten by daily sync)
4. `reporting` schema: read views that combine `base` + `app`

## Data Ownership Rules

1. Daily sync may `UPSERT` into `mirror.*` and `base.*`.
2. Daily sync must never `UPDATE` user-owned columns in `app.*`.
3. For app-seeded data (parcel addresses), sync should `INSERT ... ON CONFLICT DO NOTHING` only.
4. Sale parcel/structure snapshot child rows are created when a sale first appears in Ivory.
5. Existing editable snapshot child rows must not be overwritten by daily sync.

## Cardinality Rules

1. A sale can have multiple parcels.
2. A parcel can have multiple structures in a given assessment year.
3. A sale snapshot is one row per `sale_id`, but must aggregate all related parcels and structures.

Because of these rules, design keys and snapshot transforms must preserve one-to-many relationships before aggregation.

## Core Tables

### `mirror` (Devnet source of truth copy)

- `mirror.parcels`
  - PK: `(parcel_id, year)`
  - Includes denormalized land report summary columns (sum of all parcel land report rows for the year):
    - `frontage_sqft`
    - `land_area_sqft`
    - `land_price_per_front_ft_sum`
    - `land_price_per_sqft_sum`
    - `land_total_percent_adjustment_sum`
    - `land_report_row_count`
  - Includes denormalized structure summary columns for fast parcel-level querying:
    - `res_structure_count`
    - `avg_res_condition_score`
    - `com_structure_count`
    - `total_structure_count`
    - `res_gross_living_area_sqft`
    - `com_structure_sqft`
    - `total_structure_sqft`
    - `has_res_structures`
    - `has_com_structures`
    - `com_structure_type_values`
    - `com_structure_category_values`
- `mirror.sales`
  - PK: `(sale_id, parcel_id)`
- `mirror.res_cost`
  - PK: `(parcel_id, year, structure_name)`
- `mirror.res_rfcs`
  - PK: `(parcel_id, year, structure_type)`
- `mirror.com_cost_structures`
  - PK: `(parcel_id, year, structure_id)`
- `mirror.building_name_to_type`
  - PK: `(building_name)`
- `mirror.building_name_to_cat`
  - PK: `(building_name)`

These are fully refreshable from Devnet exports.

### `base` (system-derived)

- `base.sale_snapshots_base`
  - PK: `(sale_id)`
  - Contains computed JSON and rollups (parcel/res/com snapshot data)
  - Contains Devnet-sourced sale metadata (`sale_type`, `sale_price`, dates)
  - Contains sale validity flags derived from stability/business rules:
    - `valid_comp`
    - `valid_ratio`
    - `valid_model`

No user-editable fields in this table.

### `app` (user editable)

- `app.sale_snapshots_edits`
  - PK: `(sale_id)`
  - User-owned fields (examples):
    - `tos_effective_year`
    - `tos_building_condition`
    - `tos_quality_grade`
    - `snapshot_reviewed`
    - `review_notes`
    - `manual_adjustment_json`
  - Optional Devnet field patch allowed: `sale_type` only, if desired

- `app.sale_snapshot_parcels`
  - PK: `(sale_id, parcel_id)`
  - Seeded when sale is first entered into Ivory
  - User editable after seed
  - Daily sync: `INSERT ... ON CONFLICT DO NOTHING`

- `app.sale_snapshot_res_structures`
  - PK: `(sale_id, parcel_id, structure_name)`
  - Seeded when sale is first entered into Ivory
  - User editable after seed
  - Daily sync: `INSERT ... ON CONFLICT DO NOTHING`

- `app.sale_snapshot_com_structures`
  - PK: `(sale_id, parcel_id, structure_id)`
  - Seeded when sale is first entered into Ivory
  - User editable after seed
  - Daily sync: `INSERT ... ON CONFLICT DO NOTHING`

- `app.addresses_lookup`
  - PK: `(address_id)`
  - Initially seeded from census geocoded CSV
  - Columns: `raw_address`, `tigerline_id`, `tigerline_id_side`, `lon`, `lat`, plus audit columns
  - User can correct or enrich address content after seed

- `app.parcel_addresses`
  - Unique key: `(parcel_id, address_id, first_year)`
  - Initially seeded from census parcel-address map CSV
  - User editable (`unit`, `is_primary`, `last_year`, etc.)

- `app.sync_runs`
  - Pipeline run log: run timestamp, status, details

### `reporting` (consumption)

- `reporting.sale_snapshots`
  - View joining `base.sale_snapshots_base` to `app.sale_snapshots_edits`
  - Use `COALESCE` so edited values override defaults

- `reporting.parcel_addresses_current`
  - View over `app.parcel_addresses` filtered to active records

## Parcel Address Strategy (Requested)

1. Load census geocoded addresses (`geocoded_results.csv`) into `app.addresses_lookup`.
2. Load parcel-address relationships (`parcel_address_map.csv`) into `app.parcel_addresses`.
3. Use seed-only behavior in daily job:
   - `INSERT ... ON CONFLICT DO NOTHING`
   - Never overwrite existing rows, because users may have edited them.

This ensures initial population from census while preserving user-maintained corrections.

## Daily Sync Flow

1. Export Devnet data to CSV.
2. Read CSVs in R.
3. Transform and upsert to `mirror.*`.
4. Build and upsert `base.sale_snapshots_base`.
5. Seed missing rows into `app.sale_snapshot_parcels`, `app.sale_snapshot_res_structures`, and `app.sale_snapshot_com_structures`.
6. Optionally patch only allowed system fields in `app.sale_snapshots_edits`.
7. Seed new (missing) census addresses and parcel-address rows into `app.*` with insert-only semantics.
8. Record pipeline run in `app.sync_runs`.

## Conflict Rules

1. Mirror/base conflicts: `ON CONFLICT DO UPDATE`.
2. User-editable tables: `ON CONFLICT DO NOTHING` (or very explicit allowlist updates only).
3. Never mix system-owned and user-owned columns in the same table unless update allowlist is enforced.

## Recommended Constraints and Indexes

1. Add `NOT NULL` and PK/unique constraints matching natural keys above.
2. Add index on `mirror.sales(sale_date)` and `mirror.sales(sale_year)`.
3. Add index on `base.sale_snapshots_base(snapshot_source)`.
4. Add indexes on `app.parcel_addresses(parcel_id)` and `app.parcel_addresses(address_id)`.
5. Add geometry or coordinate indexes later if you store `POINT`/PostGIS in `app.addresses_lookup`.
6. Add index on `app.sale_snapshot_parcels(parcel_id)` for parcel-centric sale queries.
7. Add indexes on `app.sale_snapshot_res_structures(parcel_id)` and `app.sale_snapshot_com_structures(parcel_id)` for structure lookups.
8. Add index on `mirror.parcels(total_structure_count)` if parcel filtering by structure count is common.

## Optional Hardening

1. `sync_manifest` table with per-file checksum and row counts.
2. Reject run if required CSV is missing.
3. Advisory lock to prevent concurrent runs.
4. Wrap each run in a transaction.
5. Add validation reports (record counts, null key checks, duplicate key checks).

## Mapping To Current Pipeline

- Implemented in `r-scripts/ivory-daily-sync.r`:
  - Added CSV inputs for `geocoded_results` and `parcel_address_map`
  - Added CSV input for `land_reports`
  - Added optional CSV inputs for `building_name_to_type` and `building_name_to_cat`
  - Added transforms `to_census_addresses()` and `to_parcel_address_seed()`
  - Added `seed_insert_only()` helper
  - Enriches commercial structure type/category from building name lookup tables when needed
  - Aggregates land report rows per `(parcel_id, year)` and merges summed numeric columns into `mirror.parcels`
  - Adds parcel-level denormalized structure summary fields onto `mirror.parcels`
  - Computes sale validity flags and stores them in `base.sale_snapshots_base`
  - Seeds editable sale snapshot child rows (`app.sale_snapshot_parcels`, `app.sale_snapshot_res_structures`, `app.sale_snapshot_com_structures`) only when missing
  - Seeds into `app.addresses_lookup` and `app.parcel_addresses` without overwriting edits
