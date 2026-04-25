// Generate context-aware offers via Lovable AI. Persists results to `offers`.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

type Ctx = {
  now: string;
  time_of_day: string;
  day_of_week: number;
  weather: string;
  temp_c: number | null;
  lat: number;
  lng: number;
  neighborhood: string;
};

function distM(a: [number, number], b: [number, number]) {
  const R = 6371000;
  const toRad = (x: number) => (x * Math.PI) / 180;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

function ruleScore(rule: any, ctx: Ctx, distance_m: number): number {
  let s = 0;
  // window
  const [sh, sm] = (rule.active_window_start || "00:00").split(":").map(Number);
  const [eh, em] = (rule.active_window_end || "23:59").split(":").map(Number);
  const now = new Date(ctx.now);
  const mins = now.getHours() * 60 + now.getMinutes();
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  if (mins >= startMins && mins <= endMins) s += 0.4;
  // days
  if ((rule.active_days || []).includes(ctx.day_of_week)) s += 0.2;
  // weather trigger
  const wTriggers = rule.trigger_conditions?.weather as string[] | undefined;
  if (!wTriggers || wTriggers.length === 0) s += 0.1;
  else if (wTriggers.includes(ctx.weather)) s += 0.4;
  // distance falloff
  s += Math.max(0, 1 - distance_m / 1500) * 0.2;
  return s;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { user_session_id, lat = 51.5246, lng = -0.0784, force_merchant_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Get context via internal function call
    const ctxResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/get-context`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
      body: JSON.stringify({ lat, lng, session_id: user_session_id }),
    });
    const ctx: Ctx = await ctxResp.json();

    // Pull active rules + merchants
    let rulesQuery = supabase
      .from("merchant_rules")
      .select("*, merchants(*)")
      .eq("is_active", true);
    if (force_merchant_id) rulesQuery = rulesQuery.eq("merchant_id", force_merchant_id);

    const { data: rules, error } = await rulesQuery;
    if (error) throw error;

    if (!rules || rules.length === 0) {
      return new Response(JSON.stringify({ offers: [], context: ctx, note: "no active rules" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Score
    const scored = rules
      .map((r: any) => {
        const d = distM([lat, lng], [r.merchants.lat, r.merchants.lng]);
        return { rule: r, distance_m: d, score: ruleScore(r, ctx, d) };
      })
      .filter((x) => x.score > 0.2)
      .sort((a, b) => b.score - a.score)
      .slice(0, 4);

    const created: any[] = [];

    for (const item of scored) {
      const r = item.rule;
      const m = r.merchants;
      const sys = `You are the Offer Generation Engine. Output RAW, VALID JSON ONLY. No markdown.
Schema: { "headline": string, "body": string, "cta": string, "discount_pct": int, "urgency_reason": string, "expires_in_minutes": int }
STRICT RULES:
1. Math: discount_pct must be an integer strictly between ${r.min_discount_pct}% and ${r.max_discount_pct}%.
2. Brand voice: match "${m.brand_voice}" exactly.
3. UK English only: flat white, takeaway, queue, savoury.
4. headline: max 8 words, punchy, editorial.
5. body: one sentence, max 18 words.
6. urgency_reason: short, earned by context, e.g. "Wet Tuesday afternoon — pre-rush capacity."
7. cta: 2-4 words, action-led.`;

      const usr = `Merchant: ${m.name} (${m.category}) on ${m.address}.
Goal: ${r.goal_text_input || r.goal_type}.
Inventory tag: ${r.inventory_tag || "general"}.
Context: ${ctx.time_of_day} on day ${ctx.day_of_week}, weather ${ctx.weather}, ${ctx.temp_c}°C, ${Math.round(item.distance_m)}m from customer.`;

      let aiJson: any = null;
      try {
        const aiResp = await fetch(LOVABLE_AI_URL, {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: sys },
              { role: "user", content: usr },
            ],
            response_format: { type: "json_object" },
          }),
        });
        if (!aiResp.ok) {
          const t = await aiResp.text();
          console.error("ai gateway error", aiResp.status, t);
          if (aiResp.status === 429 || aiResp.status === 402) {
            return new Response(JSON.stringify({ error: aiResp.status === 429 ? "rate_limited" : "credits_required" }), {
              status: aiResp.status,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            });
          }
          continue;
        }
        const aj = await aiResp.json();
        const content = aj.choices?.[0]?.message?.content || "{}";
        aiJson = JSON.parse(content);
      } catch (e) {
        console.error("AI parse fail", e);
        continue;
      }

      const discount = Math.max(
        r.min_discount_pct + 1,
        Math.min(r.max_discount_pct - 1, Number(aiJson.discount_pct) || r.min_discount_pct + 5)
      );
      const expiresMins = Math.max(15, Math.min(180, Number(aiJson.expires_in_minutes) || 60));

      const ins = await supabase
        .from("offers")
        .insert({
          merchant_id: m.id,
          rule_id: r.id,
          user_session_id,
          headline: String(aiJson.headline || "Quiet hour offer").slice(0, 120),
          body: String(aiJson.body || "").slice(0, 240),
          cta: String(aiJson.cta || "Grab it"),
          discount_pct: discount,
          urgency_reason: String(aiJson.urgency_reason || "Right place, right time."),
          expires_at: new Date(Date.now() + expiresMins * 60_000).toISOString(),
          context_snapshot: ctx,
          relevance_score: item.score,
          status: "active",
        })
        .select("*, merchants(*)")
        .single();

      if (!ins.error && ins.data) created.push(ins.data);
    }

    return new Response(JSON.stringify({ offers: created, context: ctx }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-offer", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
