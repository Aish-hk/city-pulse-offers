import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Stamp } from "./Stamp";
import { BecausePill } from "./BecausePill";
import { TONE_BG, TONE_STAMP, TONE_BECAUSE, type CardTone, categoryIcon } from "@/lib/brand";

export interface OfferCardData {
  id: string;
  headline: string;
  body: string;
  cta: string;
  discount_pct: number;
  urgency_reason: string;
  expires_at: string;
  merchant?: {
    id?: string;
    name: string;
    category?: string | null;
    icon_name?: string | null;
    address?: string | null;
    photo_url?: string | null;
    cuisine?: string | null;
    neighborhood?: string | null;
  } | null;
}

interface OfferCardProps {
  offer: OfferCardData;
  tone?: CardTone;
  hero?: boolean;
  index?: number;
}

function timeLeft(expires_at: string): string {
  const ms = new Date(expires_at).getTime() - Date.now();
  if (ms <= 0) return "ended";
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins}m left`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ${mins % 60}m`;
}

export function OfferCard({ offer, tone = "cream", hero = false, index = 0 }: OfferCardProps) {
  const t: CardTone = hero ? "lime" : tone;
  const icon = offer.merchant?.icon_name || categoryIcon(offer.merchant?.category);
  const isDark = t === "tomato" || t === "grape" || t === "ink";
  const photo = offer.merchant?.photo_url;

  return (
    <Link
      to={`/wallet/offer/${offer.id}`}
      className={cn(
        "group relative block w-full overflow-hidden rounded-[28px] grain animate-fade-up",
        TONE_BG[t],
        hero ? "min-h-[460px]" : "min-h-[280px]"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Photo cap */}
      {photo && (
        <div className={cn("relative w-full overflow-hidden", hero ? "h-56" : "h-40")}>
          <img
            src={photo}
            alt={offer.merchant?.name || "Venue"}
            loading="lazy"
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-tomato text-cream px-3 py-1 font-mono text-[11px] tracking-widest uppercase">
            −{offer.discount_pct}% off
          </div>
        </div>
      )}

      <div className={cn(hero ? "p-6" : "p-5", photo && "pt-4")}>
        {/* Top row: stamp + merchant */}
        <div className="flex items-start justify-between relative">
          <div className="flex items-center gap-3">
            <Stamp icon={icon} tone={TONE_STAMP[t]} size={hero ? "lg" : "md"} />
            <div className="leading-tight">
              <div className={cn("font-mono text-[11px] tracking-widest uppercase", isDark ? "opacity-70" : "opacity-60")}>
                {offer.merchant?.name || "Local merchant"}
              </div>
              {(offer.merchant?.neighborhood || offer.merchant?.address) && (
                <div className={cn("text-[12px] capitalize", isDark ? "opacity-60" : "opacity-50")}>
                  {[offer.merchant?.neighborhood, offer.merchant?.cuisine].filter(Boolean).join(" · ") ||
                    offer.merchant?.address}
                </div>
              )}
            </div>
          </div>

          {!photo && (
            <div className="discount-display text-right" style={{ fontSize: hero ? 64 : 44 }}>
              −{offer.discount_pct}%
            </div>
          )}
        </div>

        {/* Headline */}
        <h2
          className={cn("font-display leading-[0.95] mt-5 text-balance pr-2")}
          style={{ fontSize: hero ? 44 : 26 }}
        >
          {offer.headline}
        </h2>

        {hero && (
          <p className={cn("mt-3 text-[15px] max-w-[34ch] text-pretty", isDark ? "opacity-80" : "opacity-70")}>
            {offer.body}
          </p>
        )}

        {/* Footer */}
        <div className={cn("mt-6 flex items-end justify-between gap-3")}>
          <BecausePill className={TONE_BECAUSE[t]}>{offer.urgency_reason}</BecausePill>
          <div className="flex items-center gap-2">
            <span className={cn("font-mono text-[11px]", isDark ? "opacity-70" : "opacity-60")}>
              {timeLeft(offer.expires_at)}
            </span>
            <span
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded-full transition-transform group-hover:translate-x-0.5",
                isDark ? "bg-cream/15 text-cream" : "bg-ink text-cream"
              )}
              aria-hidden
            >
              <i className="ph ph-arrow-up-right text-base" />
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function OfferCardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className={cn(
        "w-full rounded-[28px] bg-muted/60 relative overflow-hidden",
        hero ? "min-h-[460px]" : "min-h-[280px]"
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--foreground) / 0.06), transparent)",
          backgroundSize: "200% 100%",
          animation: "shimmer 1.6s infinite",
        }}
      />
    </div>
  );
}
