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

/**
 * Photo tile that replaces the icon stamp when a merchant photo exists.
 * Same rotated-square footprint as <Stamp/>, so layout stays consistent.
 */
function PhotoTile({
  src,
  alt,
  size = "md",
  rotate = -6,
}: {
  src: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  rotate?: number;
}) {
  const dim = size === "lg" ? "h-20 w-20" : size === "sm" ? "h-10 w-10" : "h-14 w-14";
  return (
    <span
      className={cn("inline-block overflow-hidden rounded-2xl shadow-md ring-1 ring-ink/10 shrink-0", dim)}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <img src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </span>
  );
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
        hero ? "min-h-[420px] p-7" : "min-h-[260px] p-6"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Top row: photo/stamp + merchant + discount */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          {photo ? (
            <PhotoTile src={photo} alt={offer.merchant?.name || "Venue"} size={hero ? "lg" : "md"} />
          ) : (
            <Stamp icon={icon} tone={TONE_STAMP[t]} size={hero ? "lg" : "md"} />
          )}
          <div className="leading-tight min-w-0">
            <div className={cn("font-mono text-[11px] tracking-widest uppercase truncate", isDark ? "opacity-70" : "opacity-60")}>
              {offer.merchant?.name || "Local merchant"}
            </div>
            {(offer.merchant?.neighborhood || offer.merchant?.cuisine || offer.merchant?.address) && (
              <div className={cn("text-[12px] capitalize truncate mt-1", isDark ? "opacity-60" : "opacity-50")}>
                {[offer.merchant?.neighborhood, offer.merchant?.cuisine].filter(Boolean).join(" · ") ||
                  offer.merchant?.address}
              </div>
            )}
          </div>
        </div>

        <div className="discount-display text-right shrink-0" style={{ fontSize: hero ? 56 : 38, lineHeight: 0.9 }}>
          −{offer.discount_pct}%
        </div>
      </div>

      {/* Headline */}
      <h2
        className={cn("font-display leading-[1.05] mt-8 text-balance pr-2")}
        style={{ fontSize: hero ? 40 : 24 }}
      >
        {offer.headline}
      </h2>

      {/* Body — generous vertical breathing room */}
      {(hero || offer.body) && (
        <p className={cn("mt-5 text-[15px] leading-relaxed max-w-[36ch] text-pretty", isDark ? "opacity-80" : "opacity-70")}>
          {offer.body}
        </p>
      )}

      {/* Footer */}
      <div className={cn("mt-10 flex items-end justify-between gap-3")}>
        <BecausePill className={TONE_BECAUSE[t]}>{offer.urgency_reason}</BecausePill>
        <div className="flex items-center gap-3">
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
    </Link>
  );
}

export function OfferCardSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div
      className={cn(
        "w-full rounded-[28px] bg-muted/60 relative overflow-hidden",
        hero ? "min-h-[420px]" : "min-h-[260px]"
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
