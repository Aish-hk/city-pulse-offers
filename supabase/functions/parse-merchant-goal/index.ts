// HERO: parse merchant goal text into a structured rule + readback.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYS = `You convert a small-business owner's plain-English goal into a structured offer rule.
Output RAW, VALID JSON ONLY. No markdown. No commentary.
Schema:
{
  "goal_type": "fill_quiet_hours" | "move_stock" | "bring_back_regulars" | "match_weather" | "general",
  "active_window_start": "HH:MM",
  "active_window_end": "HH:MM",
  "active_days": int[]  // 1=Mon..7=Sun
  "suggested_max_discount": int,  // 5..40
  "suggested_min_discount": int,  // 5..40 (less than max)
  "trigger_conditions": object,   // e.g. {"weather": ["rain","cloudy"]}
  "inventory_tag": string,
  "human_summary": string         // mirror them in their own words, one sentence
}
RULES:
- "mornings" -> 06:00-11:00, "lunch" -> 11:30-14:30, "afternoon" -> 14:00-17:00, "evenings" -> 17:00-21:00, "late" -> 21:00-23:30.
- "weekdays" -> [1,2,3,4,5], "weekends" -> [6,7]. Default all days if unspecified.
- "rainy" -> trigger_conditions.weather = ["rain","drizzle"]. "sunny" -> ["sunny","clear"]. "cold" -> {"temp_max_c": 8}.
- inventory_tag: extract the noun (pastry, pints, bagels, brunch, curries). Default "general".
- human_summary: friendly, UK English, mirrors the merchant. Example: "Got it — you want to push pastries to the rain crowd between 2 and 5pm on weekdays."`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { goal_text, merchant_id, persist = true } = await req.json();
    if (!goal_text || typeof goal_text !== "string") throw new Error("goal_text required");

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: `Merchant goal: "${goal_text.trim()}"` },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "rate_limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "credits_required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }
    const aj = await aiResp.json();
    const parsed = JSON.parse(aj.choices?.[0]?.message?.content || "{}");

    let rule_id: string | null = null;
    if (persist && merchant_id) {
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );
      const ins = await supabase.from("merchant_rules").insert({
        merchant_id,
        goal_type: parsed.goal_type || "general",
        goal_text_input: goal_text,
        active_window_start: parsed.active_window_start || "00:00",
        active_window_end: parsed.active_window_end || "23:59",
        active_days: parsed.active_days || [1, 2, 3, 4, 5, 6, 7],
        max_discount_pct: parsed.suggested_max_discount || 25,
        min_discount_pct: parsed.suggested_min_discount || 12,
        trigger_conditions: parsed.trigger_conditions || {},
        inventory_tag: parsed.inventory_tag || "general",
        is_active: true,
      }).select("id").single();
      if (!ins.error) rule_id = ins.data.id;
    }

    return new Response(JSON.stringify({ parsed, rule_id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
