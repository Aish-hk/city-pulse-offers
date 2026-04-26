import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import illustration from "@/assets/concierge-illustration.webp";

interface Pick {
  offer_id: string;
  reason: string;
}

interface Props {
  className?: string;
}

const SUGGESTIONS = [
  "something cosy for the rain",
  "lunch under £10 nearby",
  "a quiet coffee right now",
  "date-night in Bermondsey",
];

/**
 * The "Ask the city" concierge card — bold tomato-red editorial block.
 * Illustration sits at the top as a hero band, prompt + AI picks below.
 */
export function ConciergeCard({ className }: Props) {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [picks, setPicks] = useState<Pick[]>([]);

  async function ask(query: string) {
    if (!query.trim()) return;
    setLoading(true);
    setAnswer(null);
    setPicks([]);
    try {
      const { data, error } = await supabase.functions.invoke("ask-the-city", { body: { query } });
      if (error) throw error;
      setAnswer(data?.answer || "Here's what fits.");
      setPicks(data?.picks || []);
    } catch (e) {
      setAnswer("The city's a bit quiet — try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="px-1 py-3">
      <section
        className={cn(
          "relative rounded-[28px] bg-tomato text-cream grain overflow-hidden shadow-2xl ring-1 ring-ink/10 transition-transform",
          "rotate-[-2deg] hover:rotate-0",
          className
        )}
      >
      {/* Illustration band */}
      <div className="relative bg-cream-warm">
        <img
          src={illustration}
          alt="Person at a café laptop while the city moves around them"
          className="w-full h-56 object-cover object-center"
        />
        <div className="absolute top-4 left-5 inline-flex items-center gap-2 bg-ink text-cream px-3 py-1.5 rounded-full">
          <i className="ph-fill ph-sparkle text-lime text-sm" />
          <span className="font-mono text-[10px] tracking-widest uppercase">
            Ask the city
          </span>
        </div>
      </div>

      {/* Editorial body */}
      <div className="p-7">
        <h3 className="font-display text-[34px] leading-[1.0] text-balance">
          Tell me what you're after.
        </h3>
        <p className="mt-3 text-[14px] leading-relaxed text-cream/85 max-w-[34ch]">
          A plugged-in local friend. Brief, confident, zero fluff.
        </p>

        <form
          className="mt-6 flex items-center gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            ask(q);
          }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="something warm under £8…"
            className="flex-1 bg-cream/10 border border-cream/20 rounded-full px-4 py-3 text-sm placeholder:text-cream/50 focus:outline-none focus:border-cream/60 text-cream"
          />
          <button
            type="submit"
            className="h-11 w-11 rounded-full bg-cream text-tomato inline-flex items-center justify-center disabled:opacity-50 shrink-0"
            disabled={loading}
            aria-label="Ask"
          >
            <i className={cn("ph-fill", loading ? "ph-circle-notch animate-spin" : "ph-arrow-right")} />
          </button>
        </form>

        {!answer && !loading && (
          <div className="mt-5 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQ(s);
                  ask(s);
                }}
                className="text-[12px] px-3 py-1.5 rounded-full bg-cream/15 hover:bg-cream/25 text-cream"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {answer && (
          <div className="mt-7">
            <p className="text-[15px] leading-relaxed text-cream">{answer}</p>
            {picks.length > 0 && (
              <ul className="mt-5 space-y-2">
                {picks.map((p) => (
                  <li key={p.offer_id}>
                    <Link
                      to={`/wallet/offer/${p.offer_id}`}
                      className="flex items-start gap-3 rounded-2xl bg-ink/25 hover:bg-ink/40 px-4 py-3 transition-colors"
                    >
                      <i className="ph ph-arrow-up-right text-cream mt-0.5" />
                      <span className="text-[13px] leading-relaxed text-cream">{p.reason}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
