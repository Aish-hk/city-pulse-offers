import tapHand from "@/assets/illus-tap-hand.png";
import cardMachine from "@/assets/illus-card-machine.png";
import { Heart, Search, MapPin } from "lucide-react";

/**
 * "How it works" three-step section for the Profile page.
 * Layout inspired by EatClub onboarding screens, but rendered with
 * our City Wallet design system (cream cards, blob accents, mono labels,
 * editorial display type). The hand and card-machine illustrations are
 * the only borrowed motifs.
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
        screen={<DiscoverMock />}
        overlay={
          <img
            src={tapHand}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute -bottom-2 -right-4 h-24 w-24 object-contain rotate-[12deg] drop-shadow-md pointer-events-none"
          />
        }
      />

      {/* STEP 02 — Redeem */}
      <Step
        number="02"
        title="Tap an offer to add it to your wallet — instantly."
        blobColor="hsl(var(--butter))"
        screen={<OfferMock />}
      />

      {/* STEP 03 — Pay */}
      <Step
        number="03"
        title="Show your pass at the till. Discount handled, no awkward chat."
        blobColor="hsl(var(--lime))"
        screen={<PassMock />}
        overlay={
          <img
            src={cardMachine}
            alt=""
            loading="lazy"
            width={512}
            height={512}
            className="absolute -bottom-3 -right-3 h-24 w-24 object-contain pointer-events-none drop-shadow-md"
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
        {/* Organic blob accent behind the phone */}
        <div
          aria-hidden
          className="absolute inset-0 flex items-center justify-center"
        >
          <div
            className="h-[78%] w-[78%] rotate-[14deg] opacity-90"
            style={{
              background: blobColor,
              borderRadius: "62% 38% 55% 45% / 48% 52% 48% 52%",
            }}
          />
        </div>

        {/* Phone mock */}
        <div className="relative mx-auto w-[170px]">
          <PhoneFrame>{screen}</PhoneFrame>
        </div>

        {overlay}
      </div>
    </div>
  );
}

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[26px] bg-foreground p-[5px] shadow-xl">
      <div className="rounded-[22px] bg-background overflow-hidden h-[300px] relative">
        {/* notch */}
        <div className="absolute top-1.5 left-1/2 -translate-x-1/2 h-3.5 w-16 rounded-full bg-foreground z-10" />
        {children}
      </div>
    </div>
  );
}

/* ---- Tiny in-app screen mocks built from our own UI primitives ---- */

function DiscoverMock() {
  return (
    <div className="h-full pt-6 px-2.5 flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <Search className="h-3 w-3 opacity-60" />
        <span className="font-mono text-[8px] tracking-widest uppercase opacity-60">
          tonight · soho
        </span>
        <MapPin className="h-3 w-3 opacity-60" />
      </div>
      <div className="rounded-xl bg-foreground text-background p-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-widest uppercase opacity-70">
            ramen · live
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--lime))] animate-pulse" />
        </div>
        <div>
          <div className="font-display text-lg leading-none">−30%</div>
          <div className="font-mono text-[8px] opacity-70 mt-1">until 9pm</div>
        </div>
      </div>
      <div className="rounded-xl bg-secondary p-2">
        <div className="font-mono text-[8px] tracking-widest uppercase opacity-60">
          natural wine
        </div>
        <div className="font-display text-sm leading-tight">2-for-1 carafe</div>
      </div>
    </div>
  );
}

function OfferMock() {
  return (
    <div className="h-full pt-6 px-2.5 flex flex-col gap-2">
      <div className="rounded-xl bg-secondary h-16 relative overflow-hidden">
        <div className="absolute top-1 left-1 font-mono text-[7px] tracking-widest uppercase bg-foreground text-background px-1.5 py-0.5 rounded-full">
          dine-in
        </div>
        <Heart className="absolute top-1 right-1 h-3 w-3" />
      </div>
      <div>
        <div className="font-display text-base leading-none">Lucy Wong</div>
        <div className="font-mono text-[8px] opacity-60 mt-0.5">Soho · Dim sum</div>
      </div>
      <button className="mt-auto rounded-full bg-foreground text-background font-mono text-[9px] tracking-widest uppercase py-2">
        Save to wallet
      </button>
    </div>
  );
}

function PassMock() {
  return (
    <div className="h-full pt-6 px-2.5 flex flex-col gap-2">
      <div className="rounded-xl bg-foreground text-background p-2 flex-1 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[8px] tracking-widest uppercase opacity-70">
            wallet pass
          </span>
          <span className="font-mono text-[8px]">#0700</span>
        </div>
        <div>
          <div className="font-display text-lg leading-none">−30%</div>
          <div className="font-mono text-[7px] opacity-70 mt-1">Lucy Wong · tonight</div>
        </div>
      </div>
      <div className="rounded-xl bg-[hsl(var(--lime))] text-foreground py-2 text-center font-mono text-[9px] tracking-widest uppercase">
        show at till
      </div>
    </div>
  );
}
