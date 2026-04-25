// Validate + redeem an offer. Inserts a redemption record (broadcasts via realtime).

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { offer_id, session_id } = await req.json();
    if (!offer_id) throw new Error("offer_id required");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: offer, error: oerr } = await supabase
      .from("offers")
      .select("*")
      .eq("id", offer_id)
      .maybeSingle();
    if (oerr) throw oerr;
    if (!offer) throw new Error("offer not found");
    if (new Date(offer.expires_at).getTime() < Date.now()) throw new Error("offer expired");

    // Simulated basket between £4.50 and £18 inverse to discount
    const base = 800 + Math.round(Math.random() * 1000);
    const simulated_amount_pence = Math.max(450, Math.round(base * (1 - offer.discount_pct / 100)));

    await supabase
      .from("redemptions")
      .insert({ offer_id, user_session_id: session_id, simulated_amount_pence });

    await supabase.from("offers").update({ status: "redeemed" }).eq("id", offer_id);

    return new Response(
      JSON.stringify({ success: true, simulated_amount_pence, merchant_id: offer.merchant_id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "unknown" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
