import { ReactNode } from "react";
import { BottomNav } from "./BottomNav";

/**
 * Mobile-first shell. Caps app width to a phone-like column.
 */
export function PhoneShell({ children, hideNav = false, dark = true }: { children: ReactNode; hideNav?: boolean; dark?: boolean }) {
  return (
    <div className={dark ? "dark min-h-screen bg-ink" : "min-h-screen bg-cream"}>
      <div className="mx-auto max-w-md min-h-screen relative">
        <div className="px-4 pb-28">{children}</div>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
