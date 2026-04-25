import { cn } from "@/lib/utils";

interface BecausePillProps {
  children: React.ReactNode;
  className?: string;
  glyph?: "arrow" | "spark";
}

/**
 * Always shown on offer cards. Mono 12px, rounded-full, prefixed with → or ✦.
 */
export function BecausePill({ children, className, glyph = "arrow" }: BecausePillProps) {
  return (
    <span className={cn("because-pill", className)}>
      <span aria-hidden className="opacity-80">
        {glyph === "arrow" ? "→" : "✦"}
      </span>
      <span>{children}</span>
    </span>
  );
}
