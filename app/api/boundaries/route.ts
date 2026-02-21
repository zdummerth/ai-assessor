import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const VALID_BOUNDARY_TYPES = new Set([
  "wards",
  "cda_neighborhoods",
  "assessor_neighborhoods",
]);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const boundaryType = searchParams.get("type");
  const idsParam = searchParams.get("ids");

  const selectedIdTokens = idsParam
    ? idsParam
        .split("|")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];

  if (!boundaryType || !VALID_BOUNDARY_TYPES.has(boundaryType)) {
    return NextResponse.json(
      { error: "Invalid or missing boundary type" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  let query;
  switch (boundaryType) {
    case "wards":
      query = supabase
        .from("wards")
        .select("id, name, geom")
        .order("name", { ascending: true });
      if (selectedIdTokens.length > 0) {
        query = query.in("name", selectedIdTokens);
      }
      break;
    case "cda_neighborhoods":
      query = supabase
        .from("cda_neighborhoods")
        .select("source_id, name, geom")
        .order("name", { ascending: true });
      if (selectedIdTokens.length > 0) {
        query = query.in("source_id", selectedIdTokens);
      }
      break;
    case "assessor_neighborhoods":
      query = supabase
        .from("assessor_neighborhoods")
        .select("id, name, geom")
        .order("name", { ascending: true });
      if (selectedIdTokens.length > 0) {
        query = query.in("name", selectedIdTokens);
      }
      break;
    default:
      return NextResponse.json(
        { error: "Invalid boundary type" },
        { status: 400 },
      );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
