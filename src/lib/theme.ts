// Lightweight theme controller. Light is the default for /wallet (EatClub-cream feel).
// Persisted in localStorage as "wallet_theme" = "light" | "dark".
import { useEffect, useState } from "react";

const KEY = "wallet_theme";
type Theme = "light" | "dark";

function read(): Theme {
  if (typeof window === "undefined") return "light";
  return (localStorage.getItem(KEY) as Theme) || "light";
}

function apply(t: Theme) {
  const root = document.documentElement;
  if (t === "dark") root.classList.add("dark");
  else root.classList.remove("dark");
}

export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(read);
  useEffect(() => {
    apply(theme);
    localStorage.setItem(KEY, theme);
  }, [theme]);
  return {
    theme,
    setTheme: setThemeState,
    toggle: () => setThemeState((t) => (t === "light" ? "dark" : "light")),
    isDark: theme === "dark",
  };
}

// Call once on app boot to avoid flash.
export function bootTheme() {
  if (typeof window === "undefined") return;
  apply(read());
}
