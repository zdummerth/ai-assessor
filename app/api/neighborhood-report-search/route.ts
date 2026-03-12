import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 20;

type SortableColumn =
  | "report_timestamp"
  | "year"
  | "year_built"
  | "total_area"
  | "gla"
  | "story"
  | "total"
  | "neighborhood";

function parseInteger(value: string | null) {
  if (!value) return undefined;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseFloatValue(value: string | null) {
  if (!value) return undefined;
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function parseTextArray(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return undefined;
  const parsed = value
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  return parsed.length > 0 ? parsed : undefined;
}

function parseIntegerArray(searchParams: URLSearchParams, key: string) {
  const value = searchParams.get(key);
  if (!value) return undefined;
  const parsed = value
    .split("|")
    .map((item) => Number.parseInt(item.trim(), 10))
    .filter((item) => !Number.isNaN(item));
  return parsed.length > 0 ? parsed : undefined;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const limit = parseInteger(searchParams.get("limit")) ?? 50;
  const sortColumn =
    (searchParams.get("sort") as SortableColumn | null) || "report_timestamp";
  const sortAscending = searchParams.get("sort_asc") === "true";

  const supabase = await createClient();

  let query = supabase.from("neighborhood_report").select("*");

  const year = parseInteger(searchParams.get("year")) ?? 2026;
  query = query.eq("year", year);

  const neighborhoods = parseTextArray(searchParams, "neighborhoods");
  if (neighborhoods) query = query.in("neighborhood", neighborhoods);

  const occupancies = parseIntegerArray(searchParams, "occupancies");
  if (occupancies) query = query.in("occupancy", occupancies);

  const costGroups = parseTextArray(searchParams, "cost_groups");
  if (costGroups) query = query.in("cost_group", costGroups);

  const cdus = parseTextArray(searchParams, "cdus");
  if (cdus) query = query.in("cdu", cdus);

  const grades = parseTextArray(searchParams, "grades");
  if (grades) query = query.in("grade", grades);

  const minYearBuilt = parseInteger(searchParams.get("min_year_built"));
  if (minYearBuilt !== undefined) query = query.gte("year_built", minYearBuilt);

  const maxYearBuilt = parseInteger(searchParams.get("max_year_built"));
  if (maxYearBuilt !== undefined) query = query.lte("year_built", maxYearBuilt);

  const minTotalArea = parseInteger(searchParams.get("min_total_area"));
  if (minTotalArea !== undefined) query = query.gte("total_area", minTotalArea);

  const maxTotalArea = parseInteger(searchParams.get("max_total_area"));
  if (maxTotalArea !== undefined) query = query.lte("total_area", maxTotalArea);

  const minGla = parseInteger(searchParams.get("min_gla"));
  if (minGla !== undefined) query = query.gte("gla", minGla);

  const maxGla = parseInteger(searchParams.get("max_gla"));
  if (maxGla !== undefined) query = query.lte("gla", maxGla);

  const minStory = parseFloatValue(searchParams.get("min_story"));
  if (minStory !== undefined) query = query.gte("story", minStory);

  const maxStory = parseFloatValue(searchParams.get("max_story"));
  if (maxStory !== undefined) query = query.lte("story", maxStory);

  const minTotal = parseInteger(searchParams.get("min_total"));
  if (minTotal !== undefined) query = query.gte("total", minTotal);

  const maxTotal = parseInteger(searchParams.get("max_total"));
  if (maxTotal !== undefined) query = query.lte("total", maxTotal);

  const { data, error } = await query
    .order(sortColumn, { ascending: sortAscending })
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
