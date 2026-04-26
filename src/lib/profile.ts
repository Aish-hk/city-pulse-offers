import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "./session";

export interface Profile {
  session_id: string;
  display_name: string | null;
  avatar_emoji: string | null;
  dietary_prefs: string[];
  fav_neighborhoods: string[];
  fav_cuisines: string[];
  notify_radius_m: number;
}

const DEFAULTS: Omit<Profile, "session_id"> = {
  display_name: null,
  avatar_emoji: "🌿",
  dietary_prefs: [],
  fav_neighborhoods: [],
  fav_cuisines: [],
  notify_radius_m: 800,
};

export async function getOrCreateProfile(): Promise<Profile> {
  const sid = getSessionId();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("session_id", sid)
    .maybeSingle();
  if (data) return data as Profile;
  const row = { session_id: sid, ...DEFAULTS };
  await supabase.from("profiles").insert(row);
  return row as Profile;
}

export async function updateProfile(patch: Partial<Profile>): Promise<void> {
  const sid = getSessionId();
  await supabase.from("profiles").update(patch).eq("session_id", sid);
}
