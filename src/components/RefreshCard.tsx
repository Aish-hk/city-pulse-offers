import { cn } from "@/lib/utils";

interface Props {
  onRefresh: () => void;
  loading?: boolean;
  className?: string;
}

/**
 * Editorial refresh tile — invites the user to ask the city for a fresh batch of offers.
 */
export function RefreshCard({ onRefresh, loading, className }: Props) {
  return (
    <section
      className={cn(
        "rounded-[28px] bg-ink text-cream p-7 grain overflow-hidden relative",
        className
      )}
    >
      <div className="font-mono text-[11px] tracking-widest uppercase opacity-60">
        Fresh batch
      </div>
      <h3 className="font-display text-3xl leading-[1.05] mt-3 max-w-[18ch]">
        Want a new read on the city?
      </h3>
      <p className="mt-4 text-[14px] leading-relaxed opacity-75 max-w-[34ch]">
        Pull again and we'll fetch a fresh set, tuned to right now.
      </p>

      <button
        onClick={onRefresh}
        disabled={loading}
        className="mt-6 inline-flex items-center gap-2 bg-lime text-ink rounded-full px-5 py-3 font-mono text-[12px] uppercase tracking-widest disabled:opacity-60 hover:translate-y-[-1px] transition-transform"
      >
        <i
          className={cn(
            "ph-fill",
            loading ? "ph-circle-notch animate-spin" : "ph-arrows-clockwise"
          )}
        />
        {loading ? "Reading the city…" : "Refresh offers"}
      </button>
    </section>
  );
}
