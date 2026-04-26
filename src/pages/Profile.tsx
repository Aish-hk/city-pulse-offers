import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getOrCreateProfile, updateProfile, type Profile } from "@/lib/profile";
import { CUISINES, LONDON_NEIGHBORHOODS } from "@/lib/london";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Link } from "react-router-dom";
import { toast } from "sonner";

const AVATAR_OPTIONS = ["🌿", "🍵", "🥐", "🍜", "🍷", "🌶️", "🍋", "🌙"];
const DIETARY = ["vegan", "vegetarian", "gluten-free", "halal", "no booze"];

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
          <div className="h-16 w-16 rounded-2xl bg-background flex items-center justify-center text-3xl">
            {profile.avatar_emoji}
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

        <div className="mt-4">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mb-2">Avatar</div>
          <div className="flex gap-2 flex-wrap">
            {AVATAR_OPTIONS.map((e) => (
              <button
                key={e}
                onClick={() => patch({ avatar_emoji: e })}
                className={`h-10 w-10 rounded-xl text-xl ${profile.avatar_emoji === e ? "bg-foreground text-background" : "bg-background"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Saved" value={stats.saved} />
        <Stat label="Redeemed" value={stats.redeemed} />
        <Stat label="Passes" value={stats.passes} />
      </section>

      {/* Dietary */}
      <section className="mt-4 rounded-[28px] bg-card border border-border/50 p-6">
        <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mb-3">Dietary</div>
        <div className="flex gap-2 flex-wrap">
          {DIETARY.map((d) => (
            <Chip key={d} active={profile.dietary_prefs.includes(d)} onClick={() => toggle("dietary_prefs", d)}>
              {d}
            </Chip>
          ))}
        </div>
      </section>

      {/* Favourite cuisines */}
      <section className="mt-4 rounded-[28px] bg-card border border-border/50 p-6">
        <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mb-3">Favourite cuisines</div>
        <div className="flex gap-2 flex-wrap">
          {CUISINES.filter((c) => c !== "All cuisines").map((c) => (
            <Chip key={c} active={profile.fav_cuisines.includes(c)} onClick={() => toggle("fav_cuisines", c)}>
              {c}
            </Chip>
          ))}
        </div>
      </section>

      {/* Favourite neighborhoods */}
      <section className="mt-4 rounded-[28px] bg-card border border-border/50 p-6">
        <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mb-3">Favourite neighbourhoods</div>
        <div className="flex gap-2 flex-wrap">
          {LONDON_NEIGHBORHOODS.filter((n) => n !== "All cities").map((n) => (
            <Chip key={n} active={profile.fav_neighborhoods.includes(n)} onClick={() => toggle("fav_neighborhoods", n)}>
              {n}
            </Chip>
          ))}
        </div>
      </section>

      {/* Notify radius */}
      <section className="mt-4 rounded-[28px] bg-card border border-border/50 p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">Notify radius</div>
          <span className="font-mono text-xs">{profile.notify_radius_m}m</span>
        </div>
        <input
          type="range"
          min={200}
          max={3000}
          step={100}
          value={profile.notify_radius_m}
          onChange={(e) => patch({ notify_radius_m: Number(e.target.value) })}
          className="w-full accent-foreground"
        />
      </section>

      <div className="mt-6 text-center">
        <Link to="/passes" className="font-mono text-[11px] tracking-widest uppercase text-foreground/70">
          → View Apple Wallet passes
        </Link>
      </div>
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
