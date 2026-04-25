import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const items = [
  { to: "/wallet", icon: "ph-wallet", label: "Wallet" },
  { to: "/wallet/discover", icon: "ph-compass", label: "Discover" },
  { to: "/merchant/watch-house", icon: "ph-storefront", label: "Merchant" },
  { to: "/demo", icon: "ph-sliders", label: "Demo" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-safe bg-ink/90 backdrop-blur-xl border-t border-cream/10">
      <ul className="mx-auto max-w-md grid grid-cols-4 px-2 pt-2">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.to === "/wallet"}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-1 py-2 rounded-2xl transition-colors",
                  isActive ? "text-lime" : "text-cream/60 hover:text-cream"
                )
              }
            >
              <i className={cn("ph-fill text-xl", it.icon)} aria-hidden />
              <span className="font-mono text-[10px] tracking-widest uppercase">{it.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
