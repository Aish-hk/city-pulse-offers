import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className }: { className?: string }) {
  const { isDark, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full",
        "bg-foreground/5 hover:bg-foreground/10 text-foreground transition-colors",
        className
      )}
    >
      <i className={cn("ph-fill", isDark ? "ph-sun" : "ph-moon")} />
    </button>
  );
}
