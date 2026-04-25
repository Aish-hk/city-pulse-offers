import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Stamp } from "@/components/Stamp";
import { LiveDot } from "@/components/LiveDot";
import { PillButton } from "@/components/PillButton";
import { categoryIcon } from "@/lib/brand";
import { OfferCard, OfferCardSkeleton, type OfferCardData } from "@/components/OfferCard";
import { handleAiResponse } from "@/lib/aiErrors";
import illusAvatars from "@/assets/illus-avatars.webp";
import illusCityLife from "@/assets/illus-city-life.jpeg";

// Resolve "id" — accept either a real UUID or the slug "watch-house" (demo convenience).
async function resolveMerchant(idParam: string) {
  const isUuid = /^[0-9a-f]{8}-/.test(idParam);
  let q = supabase.from("merchants").select("*");
  q = isUuid ? q.eq("id", idParam) : q.ilike("name", "%watch house%");
  const { data } = await q.limit(1).maybeSingle();
  return data;
}

const PRESETS = [
  { label: "Fill quiet hours", icon: "ph-armchair", text: "Fill empty seats during the quiet weekday afternoon lull" },
  { label: "Move stock", icon: "ph-package", text: "Move excess pastries before close" },
  { label: "Bring back regulars", icon: "ph-users-three", text: "Bring back regulars who haven't been in this week" },
  { label: "Match the weather", icon: "ph-cloud-rain", text: "When it rains, push hot drinks to anyone within 400m" },
];

type InventoryItem = { id: string; name: string; icon: string; stock: number; tag: "hot" | "cold" | "bake" | "savoury" };
const INVENTORY: InventoryItem[] = [
  { id: "flat-white", name: "Flat White", icon: "ph-coffee", stock: 999, tag: "hot" },
  { id: "iced-latte", name: "Iced Latte", icon: "ph-cup", stock: 24, tag: "cold" },
  { id: "croissant", name: "Croissant", icon: "ph-cookie", stock: 8, tag: "bake" },
  { id: "almond-pastry", name: "Almond Pastry", icon: "ph-cookie", stock: 12, tag: "bake" },
  { id: "banana-bread", name: "Banana Bread", icon: "ph-bread", stock: 5, tag: "bake" },
  { id: "toastie", name: "Ham Toastie", icon: "ph-hamburger", stock: 6, tag: "savoury" },
];

export default function MerchantDashboard() {
  const { id = "watch-house" } = useParams();
  const [merchant, setMerchant] = useState<any>(null);
  const [goalText, setGoalText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parsed, setParsed] = useState<any>(null);
  const [discountRange, setDiscountRange] = useState<[number, number]>([15, 30]);
  const [insight, setInsight] = useState<any>(null);
  const [insightLoading, setInsightLoading] = useState(false);
  const [stats, setStats] = useState({ liveOffers: 0, redemptions: 0, recoveredPence: 0 });
  const [previewOffer, setPreviewOffer] = useState<OfferCardData | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [hasRule, setHasRule] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [aiPicking, setAiPicking] = useState(false);

  function toggleItem(id: string) {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function aiSuggestItems() {
    setAiPicking(true);
    setSelectedItems([]);
    // Spoof: stagger-pick low-stock + perishables
    const ranked = [...INVENTORY].sort((a, b) => a.stock - b.stock).slice(0, 3);
    ranked.forEach((item, i) => {
      setTimeout(() => {
        setSelectedItems((prev) => [...prev, item.id]);
        if (i === ranked.length - 1) {
          setAiPicking(false);
          const names = ranked.map((r) => r.name).join(", ");
          setGoalText(`Move ${names} before close — they're running low and won't survive tomorrow`);
        }
      }, 350 * (i + 1));
    });
  }

  useEffect(() => {
    (async () => {
      const m = await resolveMerchant(id);
      setMerchant(m);
    })();
  }, [id]);

  // Stats + realtime
  useEffect(() => {
    if (!merchant?.id) return;
    let cancelled = false;
    const refresh = async () => {
      const since = new Date();
      since.setHours(0, 0, 0, 0);
      const [{ data: offers }, { data: reds }] = await Promise.all([
        supabase.from("offers").select("id, status, expires_at").eq("merchant_id", merchant.id),
        supabase.from("redemptions").select("id, simulated_amount_pence, offer_id, redeemed_at, offers!inner(merchant_id)").eq("offers.merchant_id", merchant.id).gte("redeemed_at", since.toISOString()),
      ]);
      if (cancelled) return;
      const live = (offers || []).filter((o: any) => o.status === "active" && new Date(o.expires_at).getTime() > Date.now()).length;
      const recovered = (reds || []).reduce((s: number, r: any) => s + (r.simulated_amount_pence || 0), 0);
      setStats({ liveOffers: live, redemptions: (reds || []).length, recoveredPence: recovered });
    };
    refresh();
    const ch = supabase
      .channel(`merchant-${merchant.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "offers" }, refresh)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "redemptions" }, refresh)
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [merchant?.id]);

  // Insights
  useEffect(() => {
    if (!merchant?.id) return;
    refreshInsight();
    const t = setInterval(refreshInsight, 10 * 60 * 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchant?.id]);

  async function refreshInsight() {
    if (!merchant?.id) return;
    setInsightLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("merchant-insights", {
        body: { merchant_id: merchant.id },
      });
      if (!handleAiResponse(data, error)) return;
      if (data?.insight) setInsight(data.insight);
    } catch (e) {
      console.error("insight", e);
    } finally {
      setInsightLoading(false);
    }
  }

  async function translateGoal() {
    if (!goalText.trim() || !merchant?.id) return;
    setParsing(true);
    setParsed(null);
    try {
      const { data, error } = await supabase.functions.invoke("parse-merchant-goal", {
        body: { goal_text: goalText, merchant_id: merchant.id, persist: true },
      });
      if (!handleAiResponse(data, error)) return;
      setParsed(data?.parsed);
      setHasRule(true);
      generatePreview();
    } catch (e) {
      console.error(e);
    } finally {
      setParsing(false);
    }
  }

  async function generatePreview() {
    if (!merchant?.id) return;
    setPreviewLoading(true);
    try {
      const itemNames = INVENTORY.filter((i) => selectedItems.includes(i.id)).map((i) => i.name);
      const { data, error } = await supabase.functions.invoke("generate-offer", {
        body: {
          user_session_id: `merchant-preview-${merchant.id}`,
          lat: merchant.lat,
          lng: merchant.lng,
          force_merchant_id: merchant.id,
          discount_min: discountRange[0],
          discount_max: discountRange[1],
          inventory_items: itemNames,
        },
      });
      if (!handleAiResponse(data, error, { silent: true })) return;
      const first = data?.offers?.[0];
      if (first) setPreviewOffer({ ...first, merchant });
    } catch (e) {
      console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  }

  // Auto-regenerate preview when discount or selected items change (after initial rule exists)
  useEffect(() => {
    if (!hasRule || !merchant?.id) return;
    const t = setTimeout(() => generatePreview(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [discountRange[0], discountRange[1], selectedItems.join(","), hasRule]);

  async function fireSuggested() {
    if (!insight || !merchant?.id) return;
    // Use suggested_action as a goal
    setGoalText(insight.suggested_action);
    setTimeout(translateGoal, 50);
  }

  if (!merchant) {
    return (
      <div className="dark min-h-screen bg-ink text-cream flex items-center justify-center font-mono text-xs">
        Loading command deck…
      </div>
    );
  }

  return (
    <div className="dark min-h-screen bg-ink text-cream">
      <div className="mx-auto max-w-md min-h-screen p-4 pt-safe pb-28 relative">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Stamp icon={merchant.icon_name || categoryIcon(merchant.category)} tone="bg-lime text-ink" />
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">{merchant.category}</div>
              <h1 className="font-display text-2xl leading-none">{merchant.name}</h1>
            </div>
          </div>
          <LiveDot label="LIVE" />
        </header>

        {/* Goal input — hero */}
        <section className="mt-7">
          <label className="font-mono text-[11px] tracking-widest uppercase opacity-70">The ask</label>
          <textarea
            value={goalText}
            onChange={(e) => setGoalText(e.target.value)}
            placeholder="Tell me what you want to sell more of…"
            rows={3}
            className="w-full mt-2 bg-transparent border-b border-cream/20 focus:border-lime outline-none font-display italic text-3xl leading-tight resize-none placeholder:opacity-40"
          />
          <div className="mt-3 flex items-center justify-between">
            <span className="font-mono text-[11px] opacity-50">Plain English. We handle the rest.</span>
            <PillButton variant="lime" onClick={translateGoal} disabled={parsing || !goalText.trim()}>
              <i className="ph-fill ph-arrow-right" /> {parsing ? "Translating…" : "Translate"}
            </PillButton>
          </div>
        </section>

        {/* Translation panel */}
        {(parsing || parsed) && (
          <section className="mt-6 grid grid-cols-1 gap-3 animate-fade-up">
            <div className="rounded-[20px] bg-cream-warm text-ink p-4">
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">We heard you</div>
              <p className="font-display italic text-xl mt-2 leading-snug">
                {parsing ? "Listening…" : parsed?.human_summary || "—"}
              </p>
            </div>
            <div className="rounded-[20px] bg-ink-2 border border-cream/10 p-4 font-mono text-[12px] leading-relaxed text-cream/80">
              <div className="text-[11px] tracking-widest uppercase opacity-60 mb-2">Parsed rule</div>
              {parsing ? (
                <span className="opacity-60">Compiling JSON…</span>
              ) : parsed ? (
                <JsonReveal obj={parsed} />
              ) : null}
            </div>
          </section>
        )}

        {/* Live preview — promoted to hero, sits right under the translation */}
        <section className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">What customers see</div>
            {hasRule && (
              <button
                onClick={generatePreview}
                disabled={previewLoading}
                className="font-mono text-[11px] tracking-widest uppercase text-lime hover:underline disabled:opacity-50 flex items-center gap-1"
              >
                <i className={`ph-fill ph-arrows-clockwise ${previewLoading ? "animate-spin" : ""}`} />
                {previewLoading ? "Regenerating…" : "Regenerate"}
              </button>
            )}
          </div>
          {previewLoading && !previewOffer ? (
            <OfferCardSkeleton hero />
          ) : previewOffer ? (
            <div className={previewLoading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <OfferCard offer={previewOffer} hero />
            </div>
          ) : (
            <div className="rounded-[24px] bg-ink-2 border border-dashed border-cream/15 p-6 min-h-[280px] flex items-center justify-center text-center">
              <div>
                <i className="ph ph-eye text-3xl opacity-50" />
                <p className="font-mono text-[11px] uppercase tracking-widest mt-2 opacity-60">
                  Translate a goal to see the live offer
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Tuning controls — Inventory + Discount sit right under the preview so changes feel immediate */}
        <section className="mt-7">
          <div className="flex items-center justify-between mb-2">
            <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">Inventory · pick what to push</div>
            <button
              onClick={aiSuggestItems}
              disabled={aiPicking}
              className="font-mono text-[11px] tracking-widest uppercase text-lime hover:underline disabled:opacity-50 flex items-center gap-1"
            >
              <i className={`ph-fill ph-sparkle ${aiPicking ? "animate-pulse" : ""}`} />
              {aiPicking ? "AI picking…" : "AI suggest"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {INVENTORY.map((item) => {
              const selected = selectedItems.includes(item.id);
              const low = item.stock <= 8;
              return (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative rounded-2xl border p-3 text-left transition-all ${
                    selected
                      ? "bg-lime text-ink border-lime"
                      : "bg-ink-2 border-cream/10 text-cream hover:border-cream/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <i className={`ph-fill ${item.icon} text-lg`} aria-hidden />
                    {low && (
                      <span className={`font-mono text-[9px] tracking-widest uppercase px-1.5 py-0.5 rounded ${selected ? "bg-ink/10 text-ink" : "bg-tomato/20 text-tomato"}`}>
                        {item.stock} left
                      </span>
                    )}
                  </div>
                  <div className="font-display text-base mt-1.5 leading-tight">{item.name}</div>
                  {selected && (
                    <i className="ph-fill ph-check-circle absolute top-2 right-2 text-ink" aria-hidden />
                  )}
                </button>
              );
            })}
          </div>
          {selectedItems.length > 0 && (
            <div className="font-mono text-[11px] opacity-60 mt-2">
              {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} folded into the offer
            </div>
          )}
        </section>

        {/* Discount slider */}
        <section className="mt-7">
          <div className="flex items-center justify-between">
            <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">Discount range</div>
            <div className="font-mono text-[12px] text-lime">{discountRange[0]}–{discountRange[1]}%</div>
          </div>
          <DualRange value={discountRange} onChange={setDiscountRange} min={5} max={40} />
        </section>

        {/* Presets — moved below as quick-fill helpers */}
        <section className="mt-7">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-70 mb-2">Or pick a preset</div>
          <div className="grid grid-cols-2 gap-3">
            {PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setGoalText(p.text)}
                className="rounded-2xl bg-ink-2 border border-cream/10 p-4 text-left hover:border-lime transition-colors"
              >
                <i className={`ph-fill ${p.icon} text-xl text-lime`} aria-hidden />
                <div className="font-display text-xl mt-2 leading-tight">{p.label}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Live stats */}
        <section className="mt-8 grid grid-cols-3 gap-3">
          <Stat label="Live" value={stats.liveOffers} />
          <Stat label="Redeemed" value={stats.redemptions} />
          <Stat label="Recovered" value={`£${(stats.recoveredPence / 100).toFixed(0)}`} />
        </section>

        {/* Insight card */}
        <section className="mt-8">
          <div
            className="rounded-[24px] bg-cream-warm text-ink p-5 rotate-tilt grain relative"
          >
            <div className="flex items-center justify-between">
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">Why it's quiet right now</div>
              <button onClick={refreshInsight} className="text-[11px] font-mono underline opacity-70">refresh</button>
            </div>
            {insightLoading && !insight ? (
              <p className="font-display italic text-2xl mt-2">Diagnosing your block…</p>
            ) : insight ? (
              <>
                <p className="font-display italic text-2xl mt-2 leading-snug">{insight.diagnosis}</p>
                <div className="divider-dashed-ink my-4" />
                <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">Suggested move</div>
                <p className="text-[15px] mt-1">{insight.suggested_action}</p>
                <div className="mt-4 flex items-center justify-between gap-3">
                  <img src={illusAvatars} alt="" className="h-10 mix-blend-multiply opacity-90" />
                  <PillButton variant="ink" size="sm" onClick={fireSuggested}>
                    <i className="ph-fill ph-paper-plane-tilt" /> Fire this offer
                  </PillButton>
                </div>
              </>
            ) : (
              <p className="text-sm mt-2 opacity-70">Click refresh to ask the analyst.</p>
            )}
          </div>
        </section>

        {/* Crew strip */}
        <section className="mt-8 rounded-[24px] overflow-hidden bg-ink-2 border border-cream/10 p-5">
          <div className="flex items-center gap-3">
            <img src={illusCityLife} alt="" className="h-16 w-16 rounded-xl object-cover invert opacity-80" />
            <div>
              <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">The shift</div>
              <p className="font-display italic text-xl leading-tight">Your crew, your city, in sync.</p>
            </div>
          </div>
        </section>

        <div className="mt-10 text-center">
          <Link to="/wallet" className="font-mono text-[11px] tracking-widest uppercase opacity-60 underline">
            Switch to customer wallet →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl bg-ink-2 border border-cream/10 p-4">
      <div className="font-mono text-[10px] tracking-widest uppercase opacity-60">{label}</div>
      <div className="font-display text-5xl text-lime leading-none mt-1">{value}</div>
    </div>
  );
}

function DualRange({ value, onChange, min, max }: { value: [number, number]; onChange: (v: [number, number]) => void; min: number; max: number }) {
  const [lo, hi] = value;
  return (
    <div className="mt-3">
      <div className="relative h-2 rounded-full bg-cream/15">
        <div
          className="absolute h-2 rounded-full bg-lime"
          style={{ left: `${((lo - min) / (max - min)) * 100}%`, right: `${100 - ((hi - min) / (max - min)) * 100}%` }}
        />
      </div>
      <div className="flex gap-3 mt-3">
        <label className="flex-1 text-xs font-mono opacity-70">
          min
          <input
            type="range"
            min={min}
            max={max}
            value={lo}
            onChange={(e) => onChange([Math.min(Number(e.target.value), hi - 1), hi])}
            className="w-full accent-lime"
          />
        </label>
        <label className="flex-1 text-xs font-mono opacity-70">
          max
          <input
            type="range"
            min={min}
            max={max}
            value={hi}
            onChange={(e) => onChange([lo, Math.max(Number(e.target.value), lo + 1)])}
            className="w-full accent-lime"
          />
        </label>
      </div>
    </div>
  );
}

function JsonReveal({ obj }: { obj: any }) {
  const lines = useMemo(() => JSON.stringify(obj, null, 2).split("\n"), [obj]);
  return (
    <pre className="whitespace-pre-wrap break-words">
      {lines.map((line, i) => (
        <span
          key={i}
          className="block animate-fade-up"
          style={{ animationDelay: `${i * 40}ms` }}
        >
          {colorize(line)}
        </span>
      ))}
    </pre>
  );
}

function colorize(line: string) {
  // Naive token coloring
  const m = line.match(/^(\s*)("[^"]+")\s*:\s*(.*)$/);
  if (!m) return <span className="text-cream/60">{line}</span>;
  const [, indent, key, rest] = m;
  return (
    <>
      <span>{indent}</span>
      <span className="text-lime">{key}</span>
      <span className="text-cream/60">: </span>
      <span className="text-cream">{rest}</span>
    </>
  );
}
