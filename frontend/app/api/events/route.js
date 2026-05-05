import { createClient } from "@supabase/supabase-js";

export async function GET(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Supabase environment variables missing" }, { status: 500 });
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { searchParams } = new URL(request.url);
    const city = (searchParams.get("city") || "").toLowerCase() || null;
    
    let query = supabase
      .from("events")
      .select("*")
      .order("last_updated", { ascending: false });

    if (city && city !== "all") {
      query = query.eq("city", city);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    return Response.json({ events: data || [] });
  } catch (err) {
    return Response.json({ error: "Failed to read events", details: err.message }, { status: 500 });
  }
}
