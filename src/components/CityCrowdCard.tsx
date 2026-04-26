import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { AVATARS } from "@/lib/avatars";

interface Props {
  className?: string;
}

/**
 * "The locals" card — reuses the merchant dashboard's tilted cream-warm
 * editorial tile (rotate-tilt + grain + dashed divider).
 */
export function CityCrowdCard({ className }: Props) {
  const sample = AVATARS.slice(0, 7);
  return (
    <section className={cn("mt-2", className)}>
      <div className="rounded-[24px] bg-cream-warm text-ink p-5 rotate-tilt grain relative">
        <div className="flex items-center justify-between">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">
            The locals
          </div>
          <Link
            to="/profile"
            className="text-[11px] font-mono underline opacity-70 hover:opacity-100"
          >
            join →
          </Link>
        </div>

        <p className="font-display italic text-2xl mt-2 leading-snug">
          2,431 Londoners are eating better today.
        </p>

        <div className="divider-dashed-ink my-4" />

        <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">
          Why it matters
        </div>
        <p className="text-[15px] mt-1 leading-relaxed">
          Independent kitchens, picked by people who actually live here.
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="flex items-center -space-x-2">
            {sample.map((src, i) => (
              <span
                key={i}
                className="h-9 w-9 rounded-full bg-cream ring-2 ring-cream-warm overflow-hidden inline-block"
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
