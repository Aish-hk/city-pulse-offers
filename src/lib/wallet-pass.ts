import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "./session";

export function generatePassNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return String(n);
}

export async function addPassForOffer(offerId: string) {
  const sid = getSessionId();
  const { data: existing } = await supabase
    .from("wallet_passes")
    .select("*")
    .eq("session_id", sid)
    .eq("offer_id", offerId)
    .maybeSingle();
  if (existing) return existing;
  const row = {
    session_id: sid,
    offer_id: offerId,
    pass_number: generatePassNumber(),
    activated: false,
  };
  const { data } = await supabase.from("wallet_passes").insert(row).select().single();
  return data;
}

export async function activatePass(offerId: string) {
  const sid = getSessionId();
  await supabase
    .from("wallet_passes")
    .update({ activated: true, last_tapped_at: new Date().toISOString() })
    .eq("session_id", sid)
    .eq("offer_id", offerId);
}

export async function listPasses() {
  const sid = getSessionId();
  const { data } = await supabase
    .from("wallet_passes")
    .select("*, offers(*, merchants(name, photo_url, cuisine, neighborhood))")
    .eq("session_id", sid)
    .order("created_at", { ascending: false });
  return data || [];
}
