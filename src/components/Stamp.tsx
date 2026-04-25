import { cn } from "@/lib/utils";

interface StampProps {
  icon: string; // phosphor class, e.g. "ph-coffee" or "ph-fill ph-coffee"
  size?: "sm" | "md" | "lg";
  tone?: string; // tailwind classes for bg + text, e.g. "bg-ink text-lime"
  className?: string;
  rotate?: number; // override rotation
}

/**
 * Phosphor icon inside a rotated -6deg square stamp with rounded corners.
 * Per spec: merchant logos always render this way.
 */
export function Stamp({ icon, size = "md", tone = "bg-ink text-lime", className, rotate = -6 }: StampProps) {
  const sizeClass = size === "sm" ? "stamp-sm" : size === "lg" ? "stamp-lg" : "";
  // Ensure ph- class is included
  const iconClass = icon.startsWith("ph") ? icon : `ph ${icon}`;
  return (
    <span
      className={cn("stamp", sizeClass, tone, className)}
      style={{ transform: `rotate(${rotate}deg)` }}
      aria-hidden
    >
      <i className={iconClass} />
    </span>
  );
}
