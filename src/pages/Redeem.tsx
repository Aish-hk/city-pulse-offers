import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Stamp } from "@/components/Stamp";
import { PillButton } from "@/components/PillButton";
import { categoryIcon } from "@/lib/brand";

const CONFETTI_COLORS = ["#D9FF3C", "#FF5938", "#7B5BFF", "#FFD93D", "#5BC8FF"];

export default function Redeem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const sessionId = getSessionId();
  const [offer, setOffer] = useState<any>(null);
  const [paid, setPaid] = useState(false);
  const [amount, setAmount] = useState<number | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("offers").select("*, merchants(*)").eq("id", id).maybeSingle();
      setOffer(data);
    })();
  }, [id]);

  const qrSvg = useMemo(() => {
    // Simple stylized QR — block grid, deterministic from id. Visual prop only.
    const n = 21;
    const seed = (id || "").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const rng = (i: number) => ((Math.sin(seed + i * 7.7) + 1) / 2);
    const cells: string[] = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        // corner finder squares
        const corner = (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
        const filled = corner ? cornerCell(x, y, n) : rng(x * n + y) > 0.55;
        if (filled) cells.push(`<rect x='${x}' y='${y}' width='1' height='1' />`);
      }
    }
    return `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${n} ${n}' shape-rendering='crispEdges'>${cells.join("")}</svg>`;
  }, [id]);

  async function handlePaid() {
    try {
      const { data } = await supabase.functions.invoke("redeem-offer", {
        body: { offer_id: id, session_id: sessionId },
      });
      setAmount(data?.simulated_amount_pence ?? null);
    } catch (e) {
      console.error(e);
    }
    setPaid(true);
    setTimeout(() => navigate("/wallet"), 3200);
  }

  if (!offer) return <div className="min-h-screen bg-cream flex items-center justify-center font-mono text-xs">Loading…</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-lime via-lime/80 to-cream-warm text-ink">
      <div className="mx-auto max-w-md min-h-screen flex flex-col p-5 pt-safe relative overflow-hidden">
        {paid && <Confetti />}
        <div className="flex items-center justify-between">
          <Link to="/wallet" className="h-10 w-10 rounded-full bg-ink/10 flex items-center justify-center">
            <i className="ph ph-arrow-left text-lg" />
          </Link>
          <span className="font-mono text-[11px] tracking-widest uppercase opacity-70">Redeem at counter</span>
          <span className="w-10" />
        </div>

        {/* Merchant photo (tilted) + headline */}
        <div className="mt-8 flex items-center gap-4">
          {offer.merchants?.photo_url ? (
            <span
              className="inline-block h-16 w-16 overflow-hidden rounded-2xl shadow-lg ring-1 ring-ink/15 shrink-0"
              style={{ transform: "rotate(-8deg)" }}
              aria-hidden
            >
              <img
                src={offer.merchants.photo_url}
                alt={offer.merchants?.name}
                className="h-full w-full object-cover"
              />
            </span>
          ) : (
            <Stamp icon={offer.merchants?.icon_name || categoryIcon(offer.merchants?.category)} tone="bg-ink text-lime" size="lg" />
          )}
          <div className="min-w-0">
            <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 truncate">{offer.merchants?.name}</div>
            <h1 className="font-display text-3xl leading-[0.95] mt-1">{offer.headline}</h1>
          </div>
        </div>

        {/* QR card */}
        <div className="mt-8 mx-auto bg-ink rounded-[28px] p-6 text-cream w-full max-w-[320px] grain relative">
          <div className="flex items-center justify-between mb-4">
            <div className="discount-display text-lime" style={{ fontSize: 56 }}>−{offer.discount_pct}%</div>
            <div className="font-mono text-[10px] tracking-widest uppercase opacity-70 text-right leading-tight">
              CITY<br/>WALLET
            </div>
          </div>
          <div
            className="bg-cream rounded-2xl p-3"
            dangerouslySetInnerHTML={{ __html: qrSvg.replace("<svg ", "<svg fill='hsl(130 16% 5%)' style='width:100%;height:auto;display:block;' ") }}
          />
          <div className="mt-4 flex items-center justify-between text-[11px] font-mono opacity-80">
            <span>ID · {(id || "").slice(0, 8)}</span>
            <span>Single use</span>
          </div>
        </div>

        <div className="flex-1" />

        {paid ? (
          <div className="text-center py-6 animate-fade-up">
            <i className="ph-fill ph-check-circle text-5xl text-ink" />
            <h2 className="font-display text-4xl mt-2">Boom. You're paid.</h2>
            {amount != null && (
              <p className="font-mono text-xs mt-2 opacity-70">+£{(amount / 100).toFixed(2)} added to merchant ledger</p>
            )}
          </div>
        ) : (
          <PillButton variant="ink" onClick={handlePaid} className="w-full">
            <i className="ph-fill ph-check-circle" /> I've paid
          </PillButton>
        )}
      </div>
    </div>
  );
}

function cornerCell(x: number, y: number, n: number) {
  const local = (cx: number, cy: number) => {
    const inOuter = (cx === 0 || cx === 6 || cy === 0 || cy === 6);
    const inInner = cx >= 2 && cx <= 4 && cy >= 2 && cy <= 4;
    return inOuter || inInner;
  };
  if (x < 7 && y < 7) return local(x, y);
  if (x >= n - 7 && y < 7) return local(x - (n - 7), y);
  if (x < 7 && y >= n - 7) return local(x, y - (n - 7));
  return false;
}

function Confetti() {
  const pieces = Array.from({ length: 80 });
  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const dur = 1.6 + Math.random() * 1.4;
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const size = 6 + Math.random() * 8;
        return (
          <span
            key={i}
            style={{
              left: `${left}%`,
              top: "-40px",
              width: size,
              height: size * 1.6,
              background: color,
              position: "absolute",
              borderRadius: 2,
              transform: `rotate(${Math.random() * 360}deg)`,
              animation: `confetti-fall ${dur}s ${delay}s linear forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
