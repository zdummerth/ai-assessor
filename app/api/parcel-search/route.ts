import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get("q");
  const limit = searchParams.get("limit");

  if (!searchTerm || searchTerm.trim().length === 0) {
    return NextResponse.json({ data: [] });
  }

  const resultLimit = limit ? parseInt(limit, 10) : 50;

  if (isNaN(resultLimit) || resultLimit <= 0 || resultLimit > 100) {
    return NextResponse.json(
      { error: "limit must be between 1 and 100" },
      { status: 400 },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("search_parcels_with_range", {
    search_term: searchTerm,
    result_limit: resultLimit,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
