import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PhoneShell } from "@/components/PhoneShell";
import { ConciergeCard } from "@/components/ConciergeCard";
import { OfferCard, OfferCardSkeleton, type OfferCardData } from "@/components/OfferCard";
import { FilterBar, DEFAULT_FILTERS, type Filters } from "@/components/FilterBar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { toneFor } from "@/lib/brand";
import { bootTheme } from "@/lib/theme";

export default function Discover() {
  const [offers, setOffers] = useState<OfferCardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  useEffect(() => {
    bootTheme();
  }, []);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("offers")
        .select("id, headline, body, cta, discount_pct, urgency_reason, expires_at, merchant_id, merchants(id, name, category, icon_name, address, photo_url, cuisine, neighborhood)")
        .eq("status", "active")
        .gte("expires_at", new Date().toISOString())
        .order("relevance_score", { ascending: false })
        .limit(24);
      setOffers(
        (data || []).map((o: any) => ({
          id: o.id,
          headline: o.headline,
          body: o.body,
          cta: o.cta,
          discount_pct: o.discount_pct,
          urgency_reason: o.urgency_reason,
          expires_at: o.expires_at,
          merchant: o.merchants,
        }))
      );
      setLoading(false);
    })();
  }, []);

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

  return (
    <PhoneShell>
      <header className="pt-safe pb-2 flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-widest uppercase text-foreground/60">Discover</div>
        <ThemeToggle />
      </header>

      <h1 className="font-display text-[40px] leading-[0.95] mt-2 text-balance">
        What does <span className="text-tomato">today</span> taste like?
      </h1>

      <div className="mt-6">
        <ConciergeCard />
      </div>

      <FilterBar value={filters} onChange={setFilters} totalCount={offers.length} />

      <section className="mt-5 space-y-4">
        {loading ? (
          <>
            <OfferCardSkeleton />
            <OfferCardSkeleton />
          </>
        ) : (
          visible.map((o, i) => <OfferCard key={o.id} offer={o} tone={toneFor(i)} index={i} />)
        )}
      </section>
    </PhoneShell>
  );
}
