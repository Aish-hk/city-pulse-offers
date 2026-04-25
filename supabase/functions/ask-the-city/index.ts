// Conversational concierge: search live offers, return up to 3 with reasons.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const LOVABLE_AI_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";

const SYS = `You are the "City Wallet Concierge" — a plugged-in local friend. Brief, confident, zero-fluff. UK English.
Given a list of live offers and a user query, pick up to 3 that fit and return JSON.
Output RAW JSON ONLY:
{ "answer": string, "picks": [{ "offer_id": string, "reason": string }] }
- answer: one short sentence framing the picks. No sales speak.
- reason: one sentence per pick. Plain English.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { query } = await req.json();
    if (!query) throw new Error("query required");
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const { data: offers } = await supabase
      .from("offers")
      .select("id, headline, body, discount_pct, urgency_reason, expires_at, merchants(name,category,address)")
      .eq("status", "active")
      .gte("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(20);

    const summary = (offers || []).map((o: any) => ({
      id: o.id,
      headline: o.headline,
      merchant: o.merchants?.name,
      category: o.merchants?.category,
      discount_pct: o.discount_pct,
      because: o.urgency_reason,
    }));

    const aiResp = await fetch(LOVABLE_AI_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: `Query: "${query}"\nOffers: ${JSON.stringify(summary)}` },
        ],
        response_format: { type: "json_object" },
      }),
    });
    if (!aiResp.ok) {
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "credits_required", message: "Your Lovable AI workspace is out of credits. Top up in Settings → Workspace → Usage.", picks: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "rate_limited", message: "Too many requests — try again in a moment.", picks: [] }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      return new Response(
        JSON.stringify({ error: "ai_gateway_error", picks: [] }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const aj = await aiResp.json();
    const parsed = JSON.parse(aj.choices?.[0]?.message?.content || "{}");
    const picksWithFull = (parsed.picks || []).map((p: any) => ({
      ...p,
      offer: (offers || []).find((o: any) => o.id === p.offer_id) || null,
    }));
    return new Response(JSON.stringify({ ...parsed, picks: picksWithFull }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
