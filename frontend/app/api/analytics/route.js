import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Supabase environment variables missing" }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data: all, error } = await supabase.from("events").select("*");
    if (error) throw error;

    const events = all || [];
    const total = events.length;
    const upcoming = events.filter((e) => e.status === "upcoming").length;
    const expired = events.filter((e) => e.status === "expired").length;
    const withDate = events.filter((e) => e.event_date).length;

    const byCity = {};
    events.forEach((e) => {
        if (e.city) byCity[e.city] = (byCity[e.city] || 0) + 1;
    });

    const byCategory = {};
    events.forEach((e) => {
        const cat = e.category || "Other";
        byCategory[cat] = (byCategory[cat] || 0) + 1;
    });

    return Response.json({
        total,
        upcoming,
        expired,
        withDate,
        cities: Object.keys(byCity).length,
        byCity: Object.entries(byCity)
            .map(([city, count]) => ({ city, count }))
            .sort((a, b) => b.count - a.count),
        byCategory: Object.entries(byCategory)
            .map(([category, count]) => ({ category, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8),
    });
  } catch (err) {
    return Response.json({ error: "Failed to get analytics", details: err.message }, { status: 500 });
  }
}
