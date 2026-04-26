import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { WalletHero } from "@/components/WalletHero";
import { OfferCard, OfferCardSkeleton, type OfferCardData } from "@/components/OfferCard";
import { PhoneShell } from "@/components/PhoneShell";
import { PillButton } from "@/components/PillButton";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "@/components/FilterBar";
import { toneFor } from "@/lib/brand";
import { handleAiResponse } from "@/lib/aiErrors";
import { bootTheme } from "@/lib/theme";

const LOADING_LINES = ["Reading the city…", "Finding what fits…", "Almost there…"];

export default function Wallet() {
  const sessionId = getSessionId();
  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [ctx, setCtx] = useState<any>(null);
  const [loadingLine, setLoadingLine] = useState(0);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    bootTheme();
  }, []);

  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      i = (i + 1) % LOADING_LINES.length;
      setLoadingLine(i);
    }, 1200);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("offers")
        .select("id, headline, body, cta, discount_pct, urgency_reason, expires_at, merchant_id, merchants(id, name, category, icon_name, address, photo_url, cuisine, neighborhood)")
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("relevance_score", { ascending: false })
        .limit(12);
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
      generateNew();
    })();

    const ch = supabase
      .channel("wallet-offers")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "offers" }, async (payload) => {
        const o: any = payload.new;
        if (!o) return;
        const { data: m } = await supabase
          .from("merchants")
          .select("id, name, category, icon_name, address, photo_url, cuisine, neighborhood")
          .eq("id", o.merchant_id)
          .maybeSingle();
        setOffers((prev) => {
          if (prev.find((x) => x.id === o.id)) return prev;
          return [{ ...o, merchant: m } as OfferCardData, ...prev].slice(0, 16);
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

  // Apply filters client-side
  const visible = useMemo(() => {
    return offers.filter((o) => {
      const m = o.merchant;
      if (filters.neighborhood !== "All cities" && m?.neighborhood !== filters.neighborhood) return false;
      if (filters.cuisine !== "All cuisines" && m?.cuisine !== filters.cuisine) return false;
      if (filters.query) {
        const q = filters.query.toLowerCase();
        const hay = `${m?.name || ""} ${m?.cuisine || ""} ${o.headline} ${o.body}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [offers, filters]);

  const hero = visible[0];
  const stack = visible.slice(1);

  return (
    <PhoneShell>
      <WalletHero
        neighborhood={ctx?.neighborhood || "Bermondsey"}
        tempC={ctx?.temp_c}
        weather={ctx?.weather}
        liveOfferCount={offers.length}
        timeLabel={ctx?.time_of_day?.replace("_", " ")}
      />

      <FilterBar value={filters} onChange={setFilters} totalCount={offers.length} />

      {generating && (
        <div className="mt-4 flex items-center gap-2">
          <span className="live-dot" />
          <span className="font-mono text-[11px] uppercase tracking-widest text-foreground/70">
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
    </PhoneShell>
  );
}

function EmptyState({ onGenerate, generating }: { onGenerate: () => void; generating: boolean }) {
  return (
    <div className="rounded-[28px] bg-card p-7 min-h-[300px] flex flex-col justify-between border border-border/50">
      <div>
        <div className="font-mono text-[11px] uppercase tracking-widest opacity-60">No offers match</div>
        <h2 className="font-display text-4xl mt-2 leading-[0.95]">Try another neighbourhood.</h2>
      </div>
      <PillButton variant="lime" onClick={onGenerate} disabled={generating}>
        <i className="ph-fill ph-sparkle" /> {generating ? "Reading the city…" : "Generate offers"}
      </PillButton>
    </div>
  );
}
