import tapHand from "@/assets/illus-tap-hand.png";
import offerDetailMock from "@/assets/mock-offer-detail.png";
import redeemMock from "@/assets/mock-redeem.png";
import { ArrowUpRight } from "lucide-react";

/**
 * "How it works" three-step section for the Profile page.
 * The phone mock mirrors the real OfferCard look (cream/lime/tomato card,
 * tilted photo tile, big −20%, display headline, mono "because" pill,
 * "45m left", round black CTA arrow).
 */
export function HowItWorksSteps() {
  return (
    <section className="mt-6 space-y-10">
      <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">
        How it works
      </div>

      {/* STEP 01 — Discover */}
      <Step
        number="01"
        title="Discover hand-picked offers from kitchens around you."
        blobColor="hsl(var(--tomato))"
        screen={
          <OfferMock
            tone="lime"
            merchant="BRICK & BE…"
            sub="Peckham · Sp…"
            headline="House Special: Less Waiting, More Flavour."
            because="Lunch on cloudy Tuesday — beat the queue."
          />
        }
      />

      {/* STEP 02 — Tap */}
      <Step
        number="02"
        title="Tap the offer to add it to your wallet — instantly."
        blobColor="hsl(var(--butter))"
        screen={
          <img
            src={offerDetailMock}
            alt="Offer detail screen"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        }
        overlay={
          <img
            src={tapHand}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute bottom-[18%] right-[8%] h-24 w-24 object-contain pointer-events-none drop-shadow-xl -rotate-[18deg] animate-tap-pulse"
            style={{ transformOrigin: "80% 80%" }}
          />
        }
      />

      {/* STEP 03 — Pay */}
      <Step
        number="03"
        title="Show your pass at the till. Discount handled, no awkward chat."
        blobColor="hsl(var(--lime))"
        screen={
          <img
            src={redeemMock}
            alt="Redeem at counter screen"
            className="absolute inset-0 h-full w-full object-cover object-top"
          />
        }
      />
    </section>
  );
}

function Step({
  number,
  title,
  blobColor,
  screen,
  overlay,
}: {
  number: string;
  title: string;
  blobColor: string;
  screen: React.ReactNode;
  overlay?: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex gap-3 mb-4">
        <span className="font-mono text-xs opacity-50 pt-1">{number}</span>
        <h3 className="font-display text-2xl leading-[1.15] flex-1">{title}</h3>
      </div>

      <div className="relative rounded-[28px] bg-card border border-border/50 p-6 overflow-hidden">
        <div aria-hidden className="absolute inset-0 flex items-center justify-center">
          <div
            className="h-[78%] w-[78%] rotate-[14deg] opacity-90"
            style={{
              background: blobColor,
              borderRadius: "62% 38% 55% 45% / 48% 52% 48% 52%",
            }}
          />
        </div>

        <div className="relative mx-auto w-[260px]">
          <PhoneFrame>{screen}</PhoneFrame>
        </div>

        {overlay}
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[36px] bg-foreground p-[6px] shadow-xl">
      <div className="rounded-[30px] bg-background overflow-hidden h-[540px] relative">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 h-4 w-20 rounded-full bg-foreground z-10" />
        {children}
      </div>
    </div>
  );
}

/* ---- Mini OfferCard mock that mirrors the real Discover card ---- */

const TONE_BG: Record<string, string> = {
  lime: "bg-[hsl(var(--lime))] text-foreground",
  tomato: "bg-[hsl(var(--tomato))] text-background",
  cream: "bg-[hsl(var(--butter))] text-foreground",
};

function OfferMock({
  tone,
  merchant,
  sub,
  headline,
  because,
}: {
  tone: "lime" | "tomato" | "cream";
  merchant: string;
  sub: string;
  headline: string;
  because: string;
}) {
  const isDark = tone === "tomato";
  return (
    <div className="h-full pt-5 px-2 pb-2">
      <div className={`relative h-full rounded-[18px] p-2.5 flex flex-col ${TONE_BG[tone]}`}>
        {/* Top row: tilted photo tile + merchant + −20% */}
        <div className="flex items-start justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span
              className="inline-block h-7 w-7 shrink-0 rounded-md overflow-hidden ring-1 ring-foreground/20 shadow"
              style={{
                transform: "rotate(-8deg)",
                background:
                  "linear-gradient(135deg, hsl(var(--butter)), hsl(var(--tomato)))",
              }}
              aria-hidden
            />
            <div className="min-w-0">
              <div className={`font-mono text-[6px] tracking-widest uppercase truncate ${isDark ? "opacity-80" : "opacity-70"}`}>
                {merchant}
              </div>
              <div className={`text-[6px] truncate ${isDark ? "opacity-70" : "opacity-60"}`}>
                {sub}
              </div>
            </div>
          </div>
          <div className="font-display leading-none shrink-0" style={{ fontSize: 18 }}>
            −20%
          </div>
        </div>

        {/* Headline */}
        <h4 className="font-display leading-[1.05] mt-3 text-[11px]">{headline}</h4>

        {/* Footer */}
        <div className="mt-auto flex items-end justify-between gap-1">
          <span
            className={`font-mono text-[6px] px-1.5 py-1 rounded-full leading-tight ${
              isDark ? "bg-background/20" : "bg-foreground/10"
            }`}
          >
            → {because}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            <span className={`font-mono text-[6px] ${isDark ? "opacity-80" : "opacity-70"}`}>
              45m
            </span>
            <span
              className={`inline-flex h-5 w-5 items-center justify-center rounded-full ${
                isDark ? "bg-background/20 text-background" : "bg-foreground text-background"
              }`}
              aria-hidden
            >
              <ArrowUpRight className="h-3 w-3" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
