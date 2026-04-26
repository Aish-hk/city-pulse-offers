import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getOrCreateProfile, updateProfile, type Profile } from "@/lib/profile";
import { CUISINES, LONDON_NEIGHBORHOODS } from "@/lib/london";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { toast } from "sonner";
import { AVATARS } from "@/lib/avatars";
import { HowItWorksSteps } from "@/components/HowItWorksSteps";

const DIETARY = ["vegan", "vegetarian", "gluten-free", "halal", "no booze"];

function avatarIndex(value: string | null | undefined): number {
  if (!value) return 0;
  const m = /^av:(\d+)$/.exec(value);
  return m ? Number(m[1]) % AVATARS.length : 0;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState({ saved: 0, redeemed: 0, passes: 0 });

  useEffect(() => {
    (async () => {
      const p = await getOrCreateProfile();
      setProfile(p);
      const sid = getSessionId();
      const [{ count: saved }, { count: redeemed }, { count: passes }] = await Promise.all([
        supabase.from("saved_offers").select("*", { count: "exact", head: true }).eq("session_id", sid),
        supabase.from("redemptions").select("*", { count: "exact", head: true }).eq("user_session_id", sid),
        supabase.from("wallet_passes").select("*", { count: "exact", head: true }).eq("session_id", sid),
      ]);
      setStats({ saved: saved || 0, redeemed: redeemed || 0, passes: passes || 0 });
    })();
  }, []);

  async function patch(p: Partial<Profile>) {
    if (!profile) return;
    const next = { ...profile, ...p };
    setProfile(next);
    await updateProfile(p);
  }

  function toggle(field: "dietary_prefs" | "fav_neighborhoods" | "fav_cuisines", v: string) {
    if (!profile) return;
    const arr = profile[field] || [];
    const next = arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];
    patch({ [field]: next } as any);
  }

  if (!profile) {
    return (
      <PhoneShell>
        <div className="pt-12 text-center font-mono text-xs opacity-60">Loading profile…</div>
      </PhoneShell>
    );
  }

  return (
    <PhoneShell>
      <header className="pt-safe pb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-widest uppercase text-foreground/60">Profile</div>
        <ThemeToggle />
      </header>

      {/* Identity */}
      <section className="rounded-[28px] bg-card border border-border/50 p-6">
        <div className="flex items-center gap-4">
          <div className="h-20 w-20 shrink-0 rounded-2xl bg-background flex items-center justify-center overflow-hidden ring-1 ring-border/60 p-1">
            <img
              src={AVATARS[avatarIndex(profile.avatar_emoji)]}
              alt="Your avatar"
              className="h-full w-full object-contain"
            />
          </div>
          <input
            type="text"
            value={profile.display_name || ""}
            placeholder="Your name"
            onChange={(e) => patch({ display_name: e.target.value })}
            onBlur={() => toast.success("Saved")}
            className="flex-1 bg-transparent font-display text-3xl focus:outline-none placeholder:text-foreground/30"
          />
        </div>

        <div className="mt-6">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mb-3">Pick your face</div>
          <div className="grid grid-cols-6 gap-2">
            {AVATARS.map((src, i) => {
              const active = avatarIndex(profile.avatar_emoji) === i;
              return (
                <button
                  key={i}
                  onClick={() => patch({ avatar_emoji: `av:${i}` })}
                  className={`aspect-square rounded-xl overflow-hidden ring-2 transition-all ${
                    active ? "ring-foreground scale-105" : "ring-transparent hover:ring-border"
                  } bg-background`}
                  aria-label={`Avatar ${i + 1}`}
                >
                  <img src={src} alt="" className="h-full w-full object-contain p-1" />
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Saved" value={stats.saved} />
        <Stat label="Redeemed" value={stats.redeemed} />
        <Stat label="Passes" value={stats.passes} />
      </section>

      <HowItWorksSteps />

      <div className="h-6" />
    </PhoneShell>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl bg-card border border-border/50 p-4 text-center">
      <div className="font-display text-3xl">{value}</div>
      <div className="font-mono text-[10px] tracking-widest uppercase opacity-60 mt-1">{label}</div>
    </div>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-9 rounded-full text-sm capitalize transition-colors ${
        active ? "bg-foreground text-background" : "bg-background border border-border/60 text-foreground/80"
      }`}
    >
      {children}
    </button>
  );
}
