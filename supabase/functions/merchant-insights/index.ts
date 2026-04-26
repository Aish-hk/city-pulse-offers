// "Why is it quiet?" insight generator.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYS = `You are a senior merchandising analyst speaking directly to a small business owner.
Output RAW, VALID JSON ONLY. No markdown.
Schema: { "diagnosis": string, "suggested_action": string, "confidence": "low" | "medium" | "high" }
RULES:
- diagnosis: one sentence, plain UK English, what is happening right now and why. Mention specific context (weather, day, time of day).
- suggested_action: one sentence, a concrete offer to fire in the next 60 minutes. Include discount % and inventory tag.
- Talk like a friend who knows retail, not a McKinsey deck.
Example diagnosis: "Tuesday 3pm and it's drizzling — your pastry case is full and the office crowd has gone home. This is the slowest hour of your week."
Example suggested_action: "Push 25% off any pastry + flat white to anyone within 400m for the next 90 minutes."`;

function safeParseJson(raw: string): any {
  let s = String(raw).replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  try { return JSON.parse(s); } catch {}
  const start = s.search(/[\{\[]/);
  const open = start !== -1 ? s[start] : "{";
  const close = open === "[" ? "]" : "}";
  const end = s.lastIndexOf(close);
  if (start !== -1 && end > start) {
    s = s.substring(start, end + 1);
  }
  s = s.replace(/,\s*}/g, "}").replace(/,\s*]/g, "]").replace(/[\x00-\x1F\x7F]/g, "");
  try { return JSON.parse(s); } catch (e) {
    console.error("safeParseJson failed", e, "raw:", raw.slice(0, 500));
    return {};
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { merchant_id } = await req.json();
    if (!merchant_id) throw new Error("merchant_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { data: merchant } = await supabase.from("merchants").select("*").eq("id", merchant_id).maybeSingle();
    if (!merchant) throw new Error("merchant not found");

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: offers } = await supabase
      .from("offers")
      .select("id, discount_pct, status, created_at")
      .eq("merchant_id", merchant_id)
      .gte("created_at", since);
    const offerIds = (offers || []).map((o: any) => o.id);
    let redemptions: any[] = [];
    if (offerIds.length) {
      const { data } = await supabase.from("redemptions").select("*").in("offer_id", offerIds);
      redemptions = data || [];
    }

    // Get city context
    const ctxResp = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/get-context`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}` },
      body: JSON.stringify({ lat: merchant.lat, lng: merchant.lng }),
    });
    const ctx = await ctxResp.json();

    const usr = `Merchant: ${merchant.name} (${merchant.category}) on ${merchant.address}.
Brand voice: ${merchant.brand_voice}.
Now: ${ctx.time_of_day}, day ${ctx.day_of_week}, weather ${ctx.weather}, ${ctx.temp_c}°C in ${ctx.neighborhood}.
Last 24h: ${offers?.length || 0} offers fired, ${redemptions.length} redemptions.
Synthetic events: ${(ctx.synthetic_events || []).join("; ") || "none"}.`;

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: usr },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("ai err", aiResp.status, t);
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "credits_required", message: "Your Lovable AI workspace is out of credits. Top up in Settings → Workspace → Usage." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Too many requests — try again in a moment." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "ai_gateway_error", message: "AI gateway error" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const aj = await aiResp.json();
    const raw = aj.choices?.[0]?.message?.content || "{}";
    const parsed = safeParseJson(raw);

    const ins = await supabase.from("merchant_insights").insert({
      merchant_id,
      diagnosis: String(parsed.diagnosis || ""),
      suggested_action: String(parsed.suggested_action || ""),
      context_snapshot: { ctx, offers_count: offers?.length || 0, redemptions_count: redemptions.length, confidence: parsed.confidence },
    }).select("*").single();

    return new Response(JSON.stringify({ insight: ins.data, context: ctx }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
