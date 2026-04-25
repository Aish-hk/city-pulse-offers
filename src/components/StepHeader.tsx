import { cn } from "@/lib/utils";

type State = "idle" | "active" | "done";

interface StepHeaderProps {
  number: number;
  label: string;
  state?: State;
  hint?: string;
}

export function StepHeader({ number, label, state = "active", hint }: StepHeaderProps) {
  const done = state === "done";
  return (
    <div className="flex items-center gap-3">
      <span
        className={cn(
          "inline-flex items-center justify-center h-7 w-7 rounded-full font-mono text-[11px] tracking-wider",
          done ? "bg-lime text-ink" : "bg-cream/10 text-cream/80 border border-cream/20"
        )}
        aria-hidden
      >
        {done ? <i className="ph-fill ph-check text-sm" /> : String(number).padStart(2, "0")}
      </span>
      <div className="flex-1">
        <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">{label}</div>
        {hint && <div className="font-mono text-[10px] opacity-40 mt-0.5">{hint}</div>}
      </div>
    </div>
  );
}
