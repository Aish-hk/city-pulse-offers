import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { CityPulseHeader } from "@/components/CityPulseHeader";
import { OfferCard, OfferCardSkeleton, type OfferCardData } from "@/components/OfferCard";
import { PhoneShell } from "@/components/PhoneShell";
import { PillButton } from "@/components/PillButton";
import { toneFor } from "@/lib/brand";
import { handleAiResponse } from "@/lib/aiErrors";
import illusCityScene from "@/assets/illus-city-scene.webp";
import illusBcnMap from "@/assets/illus-bcn-map.webp";

const LOADING_LINES = [
  "Reading the city…",
  "Finding what fits…",
  "Almost there…",
];

export default function Wallet() {
  const sessionId = getSessionId();
  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [ctx, setCtx] = useState<any>(null);
  const [loadingLine, setLoadingLine] = useState(0);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      setLoadingLine(i);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  // Initial load: existing live offers + generate new ones in background
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("offers")
        .select("id, headline, body, cta, discount_pct, urgency_reason, expires_at, merchant_id, merchants(id, name, category, icon_name, address)")
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("relevance_score", { ascending: false })
        .limit(8);
      const mapped: OfferCardData[] = (data || []).map((o: any) => ({
        id: o.id,
        headline: o.headline,
        body: o.body,
        cta: o.cta,
        discount_pct: o.discount_pct,
        urgency_reason: o.urgency_reason,
        expires_at: o.expires_at,
        merchant: o.merchants,
      }));
      setOffers(mapped);
      setLoading(false);
      // Trigger generation for fresh, session-tagged offers
      generateNew();
    })();

    // Realtime: new offers
    const ch = supabase
      .channel("wallet-offers")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "offers" }, async (payload) => {
        const o: any = payload.new;
        if (!o) return;
        const { data: m } = await supabase.from("merchants").select("id, name, category, icon_name, address").eq("id", o.merchant_id).maybeSingle();
        setOffers((prev) => {
          if (prev.find((x) => x.id === o.id)) return prev;
          return [{ ...o, merchant: m } as OfferCardData, ...prev].slice(0, 12);
        });
      })
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function generateNew() {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-offer", {
        body: { user_session_id: sessionId, lat: 51.5246, lng: -0.0784 },
      });
      if (!handleAiResponse(data, error)) return;
      if (data?.context) setCtx(data.context);
    } catch (e) {
      console.error("gen offer", e);
    } finally {
      setGenerating(false);
    }
  }

  // Pull a context snapshot if we don't have one yet (so header shows weather)
  useEffect(() => {
    if (ctx) return;
    (async () => {
      try {
        const { data } = await supabase.functions.invoke("get-context", {
          body: { lat: 51.5246, lng: -0.0784, session_id: sessionId },
        });
        if (data) setCtx(data);
      } catch {}
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hero = offers[0];
  const stack = offers.slice(1);

  return (
    <PhoneShell>
      <CityPulseHeader
        neighborhood={ctx?.neighborhood || "Bermondsey"}
        tempC={ctx?.temp_c}
        weather={ctx?.weather}
        liveOfferCount={offers.length}
        timeLabel={ctx?.time_of_day?.replace("_", " ")}
      />

      {/* Generation status pill */}
      {generating && (
        <div className="mt-4 flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-cream/70">
            {LOADING_LINES[loadingLine]}
          </span>
        </div>
      )}

      <section className="mt-5 space-y-4">
        {loading ? (
          <>
            <OfferCardSkeleton hero />
            <OfferCardSkeleton />
            <OfferCardSkeleton />
          </>
        ) : hero ? (
          <>
            <OfferCard offer={hero} hero index={0} />
            {stack.map((o, i) => (
              <OfferCard key={o.id} offer={o} tone={toneFor(i)} index={i + 1} />
            ))}
          </>
        ) : (
          <EmptyState onGenerate={generateNew} generating={generating} />
        )}
      </section>

      {/* Footer illustration: editorial sticker */}
      <section className="mt-10">
        <div className="relative rounded-[28px] overflow-hidden bg-cream-warm text-ink p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">The neighbourhood</div>
              <h3 className="font-display text-3xl mt-1 leading-none">A city that nudges, not shouts.</h3>
            </div>
          </div>
          <img src={illusCityScene} alt="Illustration of city life" className="w-full mt-3 mix-blend-multiply" />
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[11px] opacity-70">→ Built for the corner café.</span>
            <PillButton size="sm" variant="ink" onClick={() => generateNew()}>
              <i className="ph ph-arrows-clockwise" /> Refresh feed
            </PillButton>
          </div>
        </div>

        <div className="relative rounded-[28px] overflow-hidden mt-4 rotate-tilt-r bg-tomato text-cream p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-80">Concierge</div>
              <h3 className="font-display text-3xl mt-1 leading-none">Ask the city.</h3>
              <p className="text-sm opacity-90 mt-2 max-w-[24ch]">"Where can I sit indoors with a flat white in 5 minutes?"</p>
            </div>
            <img src={illusBcnMap} alt="" className="w-28 rounded-2xl" />
          </div>
        </div>
      </section>
    </PhoneShell>
  );
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="rounded-[28px] bg-ink-2 text-cream p-7 min-h-[300px] flex flex-col justify-between">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest opacity-60">No live offers — yet</div>
        <h2 className="font-display text-4xl mt-2 leading-[0.95]">The city's quiet. Let's wake it up.</h2>
      </div>
      <PillButton variant="lime" onClick={onGenerate} disabled={generating}>
        <i className="ph-fill ph-sparkle" /> {generating ? "Reading the city…" : "Generate offers"}
      </PillButton>
    </div>
  );
}
