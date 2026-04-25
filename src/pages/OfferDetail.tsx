import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Stamp } from "@/components/Stamp";
import { BecausePill } from "@/components/BecausePill";
import { PillButton } from "@/components/PillButton";
import { categoryIcon } from "@/lib/brand";

export default function OfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("offers")
        .select("*, merchants(*)")
        .eq("id", id)
        .maybeSingle();
      setOffer(data);
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return <div className="dark min-h-screen bg-ink text-cream flex items-center justify-center"><span className="font-mono text-xs opacity-70">Loading…</span></div>;
  }
  if (!offer) {
    return (
      <div className="dark min-h-screen bg-ink text-cream flex flex-col items-center justify-center gap-4 p-6">
        <h2 className="font-display text-3xl">This offer's gone cold.</h2>
        <Link to="/wallet" className="font-mono text-xs text-lime">← back to wallet</Link>
      </div>
    );
  }

  const ctx = offer.context_snapshot || {};
  const expiresMs = new Date(offer.expires_at).getTime() - Date.now();
  const mins = Math.max(0, Math.round(expiresMs / 60000));

  return (
    <div className="dark min-h-screen bg-ink text-cream">
      <div className="mx-auto max-w-md min-h-screen flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between p-4 pt-safe">
          <button onClick={() => navigate(-1)} className="h-10 w-10 rounded-full bg-cream/10 flex items-center justify-center">
            <i className="ph ph-x text-lg" />
          </button>
          <span className="font-mono text-[11px] tracking-widest uppercase opacity-70">Offer · {mins}m left</span>
          <button className="h-10 w-10 rounded-full bg-cream/10 flex items-center justify-center">
            <i className="ph ph-bookmark-simple text-lg" />
          </button>
        </div>

        {/* Hero block */}
        <div className="px-5 pt-2">
          <div className="flex items-center gap-3">
            <Stamp icon={offer.merchants?.icon_name || categoryIcon(offer.merchants?.category)} tone="bg-lime text-ink" size="lg" />
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">{offer.merchants?.name}</div>
              <div className="text-[12px] opacity-60">{offer.merchants?.address}</div>
            </div>
          </div>

          <div className="mt-6 flex items-start justify-between">
            <h1 className="font-display text-[44px] leading-[0.95] text-balance pr-2">{offer.headline}</h1>
            <div className="discount-display text-lime" style={{ fontSize: 76 }}>−{offer.discount_pct}%</div>
          </div>

          <p className="mt-3 text-[15px] opacity-85">{offer.body}</p>

          <BecausePill className="bg-cream/10 text-cream mt-5">{offer.urgency_reason}</BecausePill>
        </div>

        {/* Why this offer breakdown */}
        <div className="mt-7 mx-5 rounded-[24px] bg-ink-2 p-5">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-70 mb-3">Why this fits you</div>
          <ul className="space-y-3">
            <BreakdownRow icon="ph-cloud" label="Weather">{ctx.weather || "—"}{ctx.temp_c != null ? ` · ${Math.round(ctx.temp_c)}°C` : ""}</BreakdownRow>
            <BreakdownRow icon="ph-clock" label="Time">{ctx.time_of_day?.replace("_", " ") || "—"}</BreakdownRow>
            <BreakdownRow icon="ph-map-pin" label="Distance">~{Math.round((Math.random() * 300) + 120)}m away</BreakdownRow>
            <BreakdownRow icon="ph-sparkle" label="Score">{Number(offer.relevance_score || 0).toFixed(2)}</BreakdownRow>
          </ul>
        </div>

        <div className="flex-1" />

        {/* CTA bar */}
        <div className="p-5 pb-safe sticky bottom-0 bg-gradient-to-t from-ink to-ink/0">
          <div className="grid grid-cols-[1fr,auto] gap-3">
            <PillButton variant="lime" onClick={() => navigate(`/wallet/redeem/${offer.id}`)}>
              <i className="ph-fill ph-qr-code" /> {offer.cta || "Redeem now"}
            </PillButton>
            <PillButton variant="ghost" className="text-cream">
              <i className="ph ph-bookmark-simple" />
            </PillButton>
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownRow({ icon, label, children }: { icon: string; label: string; children: React.ReactNode }) {
  return (
    <li className="flex items-center justify-between text-sm">
      <span className="flex items-center gap-2 opacity-80">
        <i className={`ph ${icon}`} />
        <span className="font-mono text-[11px] uppercase tracking-widest">{label}</span>
      </span>
      <span className="opacity-100">{children}</span>
    </li>
  );
}
