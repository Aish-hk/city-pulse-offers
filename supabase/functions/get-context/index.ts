// Open-Meteo + demo overrides → unified context.
// Public, no auth.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

function mapWmo(code: number): string {
  if ([0, 1].includes(code)) return "sunny";
  if ([2].includes(code)) return "cloudy";
  if ([3].includes(code)) return "cloudy";
  if ([45, 48].includes(code)) return "fog";
  if ([51, 53, 55, 56, 57].includes(code)) return "drizzle";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) return "rain";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "snow";
  if ([95, 96, 99].includes(code)) return "storm";
  return "cloudy";
}

function timeOfDay(d: Date): string {
  const h = d.getHours();
  if (h < 6) return "late_night";
  if (h < 11) return "morning";
  if (h < 14) return "lunch";
  if (h < 17) return "afternoon";
  if (h < 21) return "evening";
  return "night";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { lat = 51.5246, lng = -0.0784, session_id } = await req.json().catch(() => ({}));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Persist session location (best-effort)
    if (session_id) {
      await supabase
        .from("user_sessions")
        .upsert({ session_id, current_lat: lat, current_lng: lng }, { onConflict: "session_id" });
    }

    // Demo overrides
    const { data: ovr } = await supabase.from("demo_overrides").select("*").eq("id", "global").maybeSingle();

    const now = ovr?.time_override ? new Date(ovr.time_override) : new Date();
    let weather = ovr?.weather_override as string | null;
    let tempC: number | null = null;

    if (!weather) {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weather_code&timezone=auto`;
        const wr = await fetch(url);
        const wj = await wr.json();
        weather = mapWmo(wj?.current?.weather_code ?? 2);
        tempC = wj?.current?.temperature_2m ?? null;
      } catch (_e) {
        weather = "cloudy";
        tempC = 12;
      }
    } else {
      // Synthesize plausible temp by weather
      tempC = weather === "sunny" ? 22 : weather === "snow" ? -1 : weather === "rain" ? 11 : 14;
    }

    const dow = now.getDay() === 0 ? 7 : now.getDay(); // 1..7 (Mon=1, Sun=7)

    const synthetic_events = synthesizeEvents(now, weather);

    const payload = {
      now: now.toISOString(),
      time_of_day: timeOfDay(now),
      day_of_week: dow,
      weather,
      temp_c: tempC,
      lat,
      lng,
      neighborhood: nearestNeighborhood(lat, lng),
      synthetic_events,
      from_override: !!(ovr?.weather_override || ovr?.time_override),
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("get-context error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function nearestNeighborhood(lat: number, lng: number): string {
  // Lazy mapping for the demo radius
  if (lat < 51.526 && lng > -0.075) return "Brick Lane";
  if (lat > 51.525) return "Shoreditch";
  return "Bermondsey";
}

function synthesizeEvents(now: Date, weather: string | null): string[] {
  const e: string[] = [];
  const h = now.getHours();
  const dow = now.getDay();
  if (h >= 16 && h <= 18 && dow >= 1 && dow <= 5) e.push("commuter rush forming");
  if (h >= 14 && h <= 16) e.push("post-lunch lull");
  if ((weather || "").includes("rain")) e.push("rain dampening foot traffic");
  if (dow === 5 && h >= 17) e.push("Friday wind-down");
  if (dow === 6 || dow === 0) e.push("weekend wanderers");
  return e;
}
