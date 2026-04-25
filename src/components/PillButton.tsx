import * as React from "react";
import { cn } from "@/lib/utils";

interface PillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "lime" | "ink" | "ghost" | "cream" | "tomato";
  size?: "md" | "sm";
}

export const PillButton = React.forwardRef<HTMLButtonElement, PillButtonProps>(
  ({ className, variant = "lime", size = "md", children, ...props }, ref) => {
    const variants: Record<string, string> = {
      lime: "bg-lime text-ink hover:bg-lime-bright",
      ink: "bg-ink text-cream hover:bg-ink-2",
      ghost: "bg-transparent text-current border border-current/20 hover:border-current/40",
      cream: "bg-cream text-ink hover:bg-cream-2",
      tomato: "bg-tomato text-cream hover:opacity-90",
    };
    return (
      <button
        ref={ref}
        className={cn("pill", size === "sm" && "pill-sm", variants[variant], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);
PillButton.displayName = "PillButton";
