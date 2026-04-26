import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";

interface Props {
  className?: string;
}

/**
 * The illustration / "join the city" card that used to live above the concierge.
 * Uses the cartoon avatar set as a friendly visual anchor.
 */
export function CityCrowdCard({ className }: Props) {
  const sample = AVATARS.slice(0, 7);
  return (
    <section
      className={cn(
        "rounded-[28px] bg-butter text-ink p-7 grain overflow-hidden relative",
        className
      )}
    >
      <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">
        The locals
      </div>
      <h3 className="font-display text-3xl leading-[1.05] mt-3 max-w-[18ch]">
        2,431 Londoners are eating better today.
      </h3>
      <p className="mt-4 text-[14px] leading-relaxed opacity-75 max-w-[34ch]">
        Independent kitchens, picked by people who actually live here.
      </p>

      <div className="mt-6 flex items-center -space-x-3">
        {sample.map((src, i) => (
          <span
            key={i}
            className="h-11 w-11 rounded-full bg-cream ring-2 ring-butter overflow-hidden inline-block"
            style={{ transform: `translateY(${i % 2 ? 4 : 0}px)` }}
          >
            <img src={src} alt="" className="h-full w-full object-cover" />
          </span>
        ))}
        <Link
          to="/profile"
          className="ml-4 inline-flex items-center gap-1 text-[12px] font-mono uppercase tracking-widest underline-offset-4 hover:underline"
        >
          Join → <i className="ph ph-arrow-up-right" />
        </Link>
      </div>
    </section>
  );
}
