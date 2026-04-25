import { cn } from "@/lib/utils";

interface LiveDotProps {
  label?: string;
  className?: string;
  tone?: "lime" | "tomato";
}

export function LiveDot({ label = "LIVE", className, tone = "lime" }: LiveDotProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className="live-dot"
        style={tone === "tomato" ? { background: "hsl(var(--tomato))" } : undefined}
      />
      <span className="font-mono text-[11px] tracking-widest opacity-80">{label}</span>
    </span>
  );
}
