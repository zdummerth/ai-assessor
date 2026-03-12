# Load required libraries
library(httr2)
library(dotenv)
library(jsonlite)
library(dplyr)

# Load environment variables from the .env file in your working directory.
# Ensure your .env file contains a line like: SUPABASE_KEY=your_supabase_key_here
#dotenv::load_dot_env(file = "supabase-report-transformations/data-sync/.env")
dotenv::load_dot_env(file = "supabase-report-transformations/data-sync/ai-assessor.env")

# Set the API key and base URL from the curl example.
#api_key <- Sys.getenv("SUPABASE_KEY")
#base_url <- "https://ptaplfitlcnebqhoovrv.supabase.co/rest/v1"
api_key <- Sys.getenv("SUPABASE_SECRET_KEY")
base_url <- "https://eqfdoxpghbzmankzavbo.supabase.co/rest/v1"

# Define the call_api function with range_start and range_end parameters.
call_api <- function(endpoint, method = "GET", body = NULL, params = NULL,
                     range_start = 0, range_end = 10, upsert = FALSE,
                     upsert_columns = NULL, on_conflict = NULL,
                     missing = "default", return_representation = FALSE,
                     verbose = FALSE) {
  url <- paste0(base_url, endpoint)
  
  # Build a list of headers. If upsert is TRUE, add the Prefer header.
  headers_list <- list(
    apikey = api_key,
    Authorization = paste("Bearer", api_key),
    `Content-Type` = "application/json",
    Range = paste0(range_start, "-", range_end)
  )
  
  if (upsert) {
    prefer_values <- c("resolution=merge-duplicates")
    if (!is.null(missing) && nzchar(missing)) {
      prefer_values <- c(prefer_values, paste0("missing=", missing))
    }
    if (isTRUE(return_representation)) {
      prefer_values <- c(prefer_values, "return=representation")
    }
    headers_list$Prefer <- paste(prefer_values, collapse = ",")
  }
  
  # Start building the request with required headers.
  req <- request(url) %>% req_headers(!!!headers_list)
  
  # Append query parameters if provided.
  if (upsert) {
    if (!is.null(upsert_columns) && length(upsert_columns) > 0) {
      cols <- unique(trimws(as.character(upsert_columns)))
      cols <- cols[nzchar(cols)]
      if (length(cols) > 0) {
        if (is.null(params)) params <- list()
        params$columns <- paste(cols, collapse = ",")
      }
    }

    if (!is.null(on_conflict) && length(on_conflict) > 0) {
      conflict_cols <- unique(trimws(as.character(on_conflict)))
      conflict_cols <- conflict_cols[nzchar(conflict_cols)]
      if (length(conflict_cols) > 0) {
        if (is.null(params)) params <- list()
        params$on_conflict <- paste(conflict_cols, collapse = ",")
      }
    }
  }

  if (!is.null(params)) {
    req <- req %>% req_url_query(!!!params)
  }
  
  
  # Set the HTTP method and attach a JSON body if applicable.
  method <- toupper(method)
  if (method == "GET") {
    req <- req %>% req_method("GET")
  } else if (method == "POST") {
    req <- req %>% 
      req_method("POST") %>%
      { if (!is.null(body)) req_body_json(., body, na = "null", auto_unbox = TRUE) else . }
  } else if (method == "PATCH") {
    req <- req %>% 
      req_method("PATCH") %>%
      { if (!is.null(body)) req_body_json(., body, na = "null", auto_unbox = TRUE) else . }
  } else if (method == "DELETE") {
    req <- req %>% req_method("DELETE")
  } else {
    stop("Unsupported HTTP method")
  }
  
  # Perform the request.
  if (isTRUE(verbose)) {
    resp <- req %>% req_perform(verbosity = 2)
  } else {
    resp <- req %>% req_perform()
  }
  
  return(resp)
}




#result <- call_api(
#  endpoint = "/parcel_years", 
#  method = "POST",
#  body = list(
#    parcel_number = "5442-9-391.000",
#    assessor_year = 2023
#  )
#)

# -----------------------------
# call_api() usage examples
# -----------------------------
# GET example (read rows)
# get_resp <- call_api(
#   endpoint = "/parcels",
#   method = "GET",
#   params = list(select = "parcel_id,year", year = "eq.2025")
# )
# if (resp_status(get_resp) >= 200 && resp_status(get_resp) < 300 && resp_has_body(get_resp)) {
#   get_data <- jsonlite::fromJSON(resp_body_string(get_resp))
# }
#
# POST example (insert rows)
# post_resp <- call_api(
#   endpoint = "/parcels",
#   method = "POST",
#   body = list(
#     list(parcel_id = "123", year = 2025, owner_name = "Jane Doe")
#   )
# )
#
# PATCH example (update matching rows)
# patch_resp <- call_api(
#   endpoint = "/parcels",
#   method = "PATCH",
#   params = list(parcel_id = "eq.123", year = "eq.2025"),
#   body = list(owner_name = "Updated Name")
# )
#
# DELETE example (delete matching rows)
# delete_resp <- call_api(
#   endpoint = "/parcels",
#   method = "DELETE",
#   params = list(parcel_id = "eq.123", year = "eq.2025")
# )
#
# UPSERT example through call_api (partial-column safe)
# upsert_resp <- call_api(
#   endpoint = "/parcels",
#   method = "POST",
#   body = list(
#     list(parcel_id = "123", year = 2025, owner_name = "Jane Doe")
#   ),
#   upsert = TRUE,
#   on_conflict = c("parcel_id", "year"),
#   upsert_columns = c("parcel_id", "year", "owner_name")
# )



insert_batches <- function(dataframe,
                           batch_size = 5000,
                           table_name,
                           upsert = TRUE,
                           conflict_columns = NULL,
                           update_columns = NULL,
                           return_representation = FALSE,
                           stop_on_error = TRUE,
                           verbose = FALSE) {
  if (!is.data.frame(dataframe)) {
    stop("`dataframe` must be a data.frame")
  }

  if (nrow(dataframe) == 0) {
    message("No rows to insert; skipping request.")
    return(invisible(list()))
  }

  if (is.null(names(dataframe)) || any(!nzchar(names(dataframe)))) {
    stop("All dataframe columns must be named for PostgREST inserts/upserts")
  }

  endpoint <- ifelse(startsWith(table_name, "/"), table_name, paste0("/", table_name))

  if (upsert && !is.null(update_columns)) {
    missing_update_cols <- setdiff(update_columns, names(dataframe))
    if (length(missing_update_cols) > 0) {
      stop("`update_columns` contains columns not present in `dataframe`: ",
           paste(missing_update_cols, collapse = ", "))
    }
  }

  upsert_columns <- names(dataframe)
  if (upsert && !is.null(update_columns)) {
    upsert_columns <- unique(c(conflict_columns, update_columns))
  }

  if (upsert && !is.null(conflict_columns)) {
    missing_conflict_cols <- setdiff(conflict_columns, names(dataframe))
    if (length(missing_conflict_cols) > 0) {
      stop("`conflict_columns` contains columns not present in `dataframe`: ",
           paste(missing_conflict_cols, collapse = ", "))
    }
  }

  # Calculate the total number of rows and split the dataframe into batches
  n <- nrow(dataframe)
  batches <- split(dataframe, ceiling(seq_len(n) / batch_size))
  
  cat("Total rows to insert:", n, "\n")
  cat("Inserting in", length(batches), "batch(es) of up to", batch_size, "rows each.\n")

  results <- vector("list", length(batches))
  names(results) <- as.character(seq_along(batches))
  
  # Iterate over each batch using purrr::imap
  purrr::iwalk(batches, function(batch, batch_number) {
    batch_number_int <- as.integer(batch_number)
    batch_rows <- nrow(batch)
    cat(sprintf("[%d/%d] Processing batch (%d rows)...\n",
                batch_number_int, length(batches), batch_rows))

    # Convert each row in the current batch to a list
    batch_list <- purrr::map(seq_len(nrow(batch)), function(i) as.list(batch[i, ]))

    # Insert the current batch by calling the API
    response <- tryCatch(
      call_api(
        endpoint = endpoint,
        method = "POST",
        body = batch_list,
        upsert = upsert,
        upsert_columns = if (upsert) upsert_columns else NULL,
        on_conflict = conflict_columns,
        return_representation = return_representation,
        verbose = verbose
      ),
      error = function(e) {
        msg <- conditionMessage(e)
        cat(sprintf("[%d/%d] ERROR: %s\n", batch_number_int, length(batches), msg))
        if (isTRUE(stop_on_error)) {
          stop(e)
        }
        return(structure(list(error = msg), class = "insert_batches_error"))
      }
    )

    if (inherits(response, "insert_batches_error")) {
      results[[batch_number]] <<- list(
        batch = batch_number_int,
        rows = batch_rows,
        success = FALSE,
        status = NA_integer_,
        error = response$error
      )
      return(invisible(NULL))
    }

    status_code <- resp_status(response)
    if (status_code >= 200 && status_code < 300) {
      cat(sprintf("[%d/%d] Success (HTTP %d)\n", batch_number_int, length(batches), status_code))
      results[[batch_number]] <<- list(
        batch = batch_number_int,
        rows = batch_rows,
        success = TRUE,
        status = status_code,
        error = NULL
      )
    } else {
      error_body <- ""
      if (resp_has_body(response)) {
        error_body <- tryCatch(resp_body_string(response), error = function(e) "")
      }
      error_msg <- if (nzchar(error_body)) {
        gsub("[\r\n]+", " ", substr(error_body, 1, 500))
      } else {
        paste0("HTTP ", status_code)
      }

      cat(sprintf("[%d/%d] ERROR (HTTP %d): %s\n",
                  batch_number_int, length(batches), status_code, error_msg))

      results[[batch_number]] <<- list(
        batch = batch_number_int,
        rows = batch_rows,
        success = FALSE,
        status = status_code,
        error = error_msg
      )

      if (isTRUE(stop_on_error)) {
        stop(sprintf("Batch %d failed with HTTP %d", batch_number_int, status_code))
      }
    }
  })

  successful_batches <- sum(vapply(results, function(x) isTRUE(x$success), logical(1)))
  failed_batches <- length(results) - successful_batches
  cat(sprintf("Finished: %d successful batch(es), %d failed batch(es).\n",
              successful_batches, failed_batches))

  invisible(results)
}

# -----------------------------
# insert_batches() usage examples
# -----------------------------
# Simple insert (no upsert)
# insert_batches(
#   dataframe = parcels_df,
#   batch_size = 2500,
#   table_name = "parcels",
#   upsert = FALSE
# )
#
# Upsert with composite conflict key, update all provided columns
# insert_batches(
#   dataframe = parcels_df,
#   batch_size = 2500,
#   table_name = "parcels",
#   upsert = TRUE,
#   conflict_columns = c("parcel_id", "year")
# )
#
# Partial upsert: dataframe has id + only columns you want to update
# (other DB columns are preserved because they are not in upsert_columns)
# partial_updates_df <- data.frame(
#   parcel_id = c("123", "456"),
#   year = c(2025, 2025),
#   owner_name = c("Jane Doe", "John Doe")
# )
# insert_batches(
#   dataframe = partial_updates_df,
#   batch_size = 1000,
#   table_name = "parcels",
#   upsert = TRUE,
#   conflict_columns = c("parcel_id", "year"),
#   update_columns = c("owner_name")
# )
#
# Continue processing after errors (logs errors and summarizes failures)
# insert_batches(
#   dataframe = parcels_df,
#   batch_size = 2500,
#   table_name = "parcels",
#   upsert = TRUE,
#   conflict_columns = c("parcel_id", "year"),
#   stop_on_error = FALSE
# )