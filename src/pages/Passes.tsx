import { useEffect, useState } from "react";
import { PhoneShell } from "@/components/PhoneShell";
import { listPasses } from "@/lib/wallet-pass";
import { Link } from "react-router-dom";

export default function Passes() {
  const [passes, setPasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const data = await listPasses();
      setPasses(data);
      setLoading(false);
    })();
  }, []);

  return (
    <PhoneShell>
      <header className="pt-safe pb-4 flex items-center justify-between">
        <div className="font-mono text-[11px] tracking-widest uppercase text-foreground/60">
          Apple Wallet
        </div>
      </header>

      <h1 className="font-display text-[40px] leading-[0.95]">Your passes.</h1>
      <p className="text-foreground/60 text-sm mt-2">
        Tap and pay — offers are magically deducted from the bill.
      </p>

      {loading ? (
        <div className="mt-8 font-mono text-xs opacity-60">Loading…</div>
      ) : passes.length === 0 ? (
        <div className="mt-8 rounded-[28px] bg-card border border-border/50 p-8 text-center">
          <i className="ph ph-credit-card text-4xl opacity-40" />
          <p className="mt-3 text-sm opacity-70">No passes yet. Add an offer from your wallet.</p>
          <Link to="/wallet" className="mt-4 inline-block font-mono text-[11px] tracking-widest uppercase text-foreground">
            → Browse offers
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {passes.map((p) => {
            const offer = p.offers;
            const merchant = offer?.merchants;
            return (
              <Link
                key={p.id}
                to={`/wallet/offer/${p.offer_id}`}
                className="block rounded-2xl bg-ink text-cream p-5 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <span className="font-display italic text-2xl">EatClub</span>
                  <span className="font-mono text-[10px] tracking-widest uppercase opacity-70">
                    {p.activated ? "Activated" : "Prepaid"} ))
                  </span>
                </div>
                <div className="mt-8 font-mono text-[13px] tracking-[0.4em] opacity-80">
                  ···· {p.pass_number}
                </div>
                <div className="mt-3 border-t border-cream/15 pt-2 flex items-center justify-between text-[11px] font-mono uppercase tracking-widest opacity-80">
                  <span className="truncate max-w-[60%]">{merchant?.name || "Venue"}</span>
                  <span>−{offer?.discount_pct ?? 0}%</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PhoneShell>
  );
}
