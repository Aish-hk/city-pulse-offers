import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

interface Pick {
  offer_id: string;
  reason: string;
}

interface Props {
  className?: string;
  compact?: boolean;
}

const SUGGESTIONS = [
  "something cosy for the rain",
  "lunch under £10 nearby",
  "a quiet coffee right now",
  "date-night in Bermondsey",
];

export function ConciergeCard({ className, compact = false }: Props) {
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
    <section
      className={cn(
        "rounded-[28px] bg-ink text-cream p-6 grain border border-ink/10",
        className
      )}
    >
      <div className="flex items-center gap-2 opacity-70">
        <i className="ph-fill ph-sparkle text-lime" />
        <span className="font-mono text-[11px] tracking-widest uppercase">Ask the city</span>
      </div>

      <h3 className={cn("font-display leading-[1.05] mt-4", compact ? "text-2xl" : "text-3xl")}>
        Tell me what you're after.
      </h3>

      <form
        className="mt-5 flex items-center gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(q);
        }}
      >
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="something warm under £8…"
          className="flex-1 bg-ink-2 border border-cream/10 rounded-full px-4 py-3 text-sm placeholder:text-cream/40 focus:outline-none focus:border-lime/60 text-cream"
        />
        <button
          type="submit"
          className="h-11 w-11 rounded-full bg-lime text-ink inline-flex items-center justify-center disabled:opacity-50"
          disabled={loading}
          aria-label="Ask"
        >
          <i className={cn("ph-fill", loading ? "ph-circle-notch animate-spin" : "ph-arrow-right")} />
        </button>
      </form>

      {!answer && !loading && (
        <div className="mt-4 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => {
                setQ(s);
                ask(s);
              }}
              className="text-[12px] px-3 py-1.5 rounded-full bg-cream/10 hover:bg-cream/15 text-cream/80"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {answer && (
        <div className="mt-6">
          <p className="text-[15px] leading-relaxed text-cream/90">{answer}</p>
          {picks.length > 0 && (
            <ul className="mt-4 space-y-2">
              {picks.map((p) => (
                <li key={p.offer_id}>
                  <Link
                    to={`/wallet/offer/${p.offer_id}`}
                    className="flex items-start gap-3 rounded-2xl bg-ink-2 hover:bg-ink-3 px-4 py-3"
                  >
                    <i className="ph ph-arrow-up-right text-lime mt-0.5" />
                    <span className="text-[13px] leading-relaxed text-cream/85">{p.reason}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
