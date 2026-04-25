import { LiveDot } from "./LiveDot";
import { weatherGradient, weatherIcon } from "@/lib/brand";
import { cn } from "@/lib/utils";

interface CityPulseHeaderProps {
  neighborhood: string;
  tempC?: number | null;
  weather?: string | null;
  liveOfferCount: number;
  timeLabel?: string;
}

export function CityPulseHeader({
  neighborhood,
  tempC,
  weather,
  liveOfferCount,
  timeLabel,
}: CityPulseHeaderProps) {
  const grad = weatherGradient(weather);
  const wicon = weatherIcon(weather);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 -mx-4 px-4 pt-safe pb-4 bg-gradient-to-b text-cream",
        grad
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <i className="ph ph-map-pin-area text-xl text-lime" aria-hidden />
          <span className="font-mono text-[11px] tracking-widest uppercase opacity-80">
            {neighborhood}
          </span>
        </div>
        <LiveDot label={`${liveOfferCount} LIVE`} />
      </div>

      <div className="mt-2 flex items-end justify-between gap-4">
        <h1 className="font-display text-[40px] leading-[0.95] text-balance">
          The city is{" "}
          <span className="text-lime">{moodFor(weather, tempC)}</span> right now.
        </h1>
        <div className="flex flex-col items-end shrink-0">
          <i className={cn("ph-fill text-3xl text-lime", wicon)} aria-hidden />
          <span className="font-mono text-[11px] opacity-80 mt-1">
            {tempC != null ? `${Math.round(tempC)}°C` : "—"}{timeLabel ? ` · ${timeLabel}` : ""}
          </span>
        </div>
      </div>
    </header>
  );
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
