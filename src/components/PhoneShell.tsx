import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile-first shell. Caps app width to a phone-like column.
 * Uses semantic tokens so it adapts to light/dark theme.
 */
export function PhoneShell({ children, hideNav = false }: { children: ReactNode; hideNav?: boolean }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-md min-h-screen relative">
        <div className="px-4 pb-28">{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
