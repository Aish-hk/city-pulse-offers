import heroGif from "@/assets/wallet-hero.gif";
import { LiveDot } from "./LiveDot";
import { ThemeToggle } from "./ThemeToggle";

interface WalletHeroProps {
  neighborhood: string;
  tempC?: number | null;
  weather?: string | null;
  liveOfferCount: number;
  timeLabel?: string;
}

function moodFor(weather?: string | null, tempC?: number | null): string {
  const w = (weather || "").toLowerCase();
  if (w.includes("rain") || w.includes("drizzle")) return "wet & quiet";
  if (w === "cloudy") return "soft & grey";
  if (w === "sunny" || w === "clear") return "wide awake";
  if (w === "snow") return "hushed";
  if (tempC != null && tempC < 6) return "biting cold";
  return "alive";
}

export function WalletHero({
  neighborhood,
  tempC,
  weather,
  liveOfferCount,
  timeLabel,
}: WalletHeroProps) {
  const mood = moodFor(weather, tempC);
  return (
    <header className="-mx-4 px-4 pt-safe pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-foreground text-background"
          >
            <i className="ph-fill ph-wallet text-sm" />
          </span>
          <span className="font-display text-lg leading-none tracking-tight">
            City Wallet
          </span>
        </div>
        <div className="flex items-center gap-3">
          <LiveDot label={`${liveOfferCount} LIVE`} />
          <ThemeToggle />
        </div>
      </div>

      {/* Thin divider above the hero illustration */}
      <div className="mt-4 h-px w-full bg-foreground/15" />

      {/* Hero illustration card — fully replaces the green gradient */}
      <div className="mt-4 rounded-[28px] overflow-hidden bg-card border border-border/40">
        <img
          src={heroGif}
          alt="Two friends sharing a meal, paying with the app"
          className="w-full h-auto"
        />
      </div>

      {/* Mood line below the hero */}
      <div className="mt-5 flex items-end justify-between gap-4">
        <h1 className="font-display text-[40px] leading-[0.95] text-balance text-foreground">
          The city is{" "}
          <span className="text-tomato">{mood}</span> right now.
        </h1>
        <span className="font-mono text-[11px] text-foreground/60 mt-1 shrink-0">
          {tempC != null ? `${Math.round(tempC)}°C` : "—"}
          {timeLabel ? ` · ${timeLabel}` : ""}
        </span>
      </div>
    </header>
  );
}
