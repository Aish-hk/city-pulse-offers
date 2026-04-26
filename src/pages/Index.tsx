import { Link } from "react-router-dom";
import { Stamp } from "@/components/Stamp";
import { PillButton } from "@/components/PillButton";
import { LiveDot } from "@/components/LiveDot";
import illusCityScene from "@/assets/illus-city-scene.webp";
import illusAvatars from "@/assets/illus-avatars.webp";

export default function Index() {
  return (
    <div className="dark min-h-screen bg-ink text-cream">
      <div className="mx-auto max-w-md min-h-screen p-5 pt-safe pb-12 relative">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stamp icon="ph-fill ph-wallet" tone="bg-lime text-ink" size="sm" />
            <span className="font-display text-2xl leading-none">City Wallet</span>
          </div>
          <LiveDot label="HACKATHON" />
        </header>

        <section className="mt-10">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">DSV Gruppe · 24h</div>
          <h1 className="font-display text-[56px] leading-[0.92] text-balance mt-2">
            The corner café gets <span className="text-lime">algorithmic</span> too.
          </h1>
          <p className="opacity-80 mt-4 max-w-[34ch]">
            A merchant types a goal in plain English. Our AI turns it into live, context aware offers that reach nearby customers in seconds.
          </p>
        </section>

        <section className="mt-8 rounded-[28px] overflow-hidden bg-cream-warm text-ink p-5 grain relative">
          <img src={illusCityScene} alt="" className="w-full mix-blend-multiply" />
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60 mt-2">Two sides, one wallet</div>
          <p className="font-display italic text-2xl mt-1 leading-tight">Built for the customers and merchant. Loved by the city.</p>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <Link to="/merchant/watch-house" className="rounded-2xl bg-lime text-ink p-5 grain relative">
            <i className="ph-fill ph-storefront text-2xl" />
            <div className="font-display text-3xl leading-none mt-3">Merchant</div>
            <div className="font-mono text-[11px] tracking-widest uppercase mt-1 opacity-70">command deck →</div>
          </Link>
          <Link to="/wallet" className="rounded-2xl bg-tomato text-cream p-5 grain relative">
            <i className="ph-fill ph-wallet text-2xl" />
            <div className="font-display text-3xl leading-none mt-3">Wallet</div>
            <div className="font-mono text-[11px] tracking-widest uppercase mt-1 opacity-80">customer feed →</div>
          </Link>
        </section>

      </div>
    </div>
  );
}
