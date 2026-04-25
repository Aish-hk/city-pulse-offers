// Brand-aware helpers for picking colors, icons, and copy in one place.

export type CardTone = "lime" | "tomato" | "cream" | "grape" | "ink" | "butter" | "sky";

export const TONE_BG: Record<CardTone, string> = {
  lime: "bg-lime text-ink",
  tomato: "bg-tomato text-cream",
  cream: "bg-cream-warm text-ink",
  grape: "bg-grape text-cream",
  ink: "bg-ink-2 text-cream",
  butter: "bg-butter text-ink",
  sky: "bg-sky text-ink",
};

export const TONE_STAMP: Record<CardTone, string> = {
  lime: "bg-ink text-lime",
  tomato: "bg-cream text-tomato",
  cream: "bg-ink text-cream",
  grape: "bg-cream text-grape",
  ink: "bg-lime text-ink",
  butter: "bg-ink text-butter",
  sky: "bg-ink text-sky",
};

export const TONE_BECAUSE: Record<CardTone, string> = {
  lime: "bg-ink/10 text-ink",
  tomato: "bg-cream/15 text-cream",
  cream: "bg-ink/8 text-ink",
  grape: "bg-cream/15 text-cream",
  ink: "bg-cream/10 text-cream",
  butter: "bg-ink/10 text-ink",
  sky: "bg-ink/10 text-ink",
};

// Map merchant category -> Phosphor icon name
export function categoryIcon(category?: string | null): string {
  switch ((category || "").toLowerCase()) {
    case "cafe": return "ph-coffee";
    case "restaurant": return "ph-bowl-food";
    case "bar": return "ph-beer-bottle";
    case "bakery": return "ph-bread";
    case "retail": return "ph-shopping-bag";
    default: return "ph-storefront";
  }
}

// Tone rotation for a stack of cards
export const STACK_TONES: CardTone[] = ["tomato", "cream", "grape", "ink", "butter", "sky"];

export function toneFor(index: number, hero = false): CardTone {
  if (hero) return "lime";
  return STACK_TONES[index % STACK_TONES.length];
}

// Map weather to ambient header gradient (uses semantic tokens via inline gradient classes)
export function weatherGradient(weather?: string | null): string {
  switch ((weather || "").toLowerCase()) {
    case "rain":
    case "drizzle":
      return "from-ink-2 via-ink to-grape/40";
    case "cloudy":
      return "from-ink-2 via-ink to-sky/30";
    case "sunny":
    case "clear":
      return "from-ink-2 via-ink to-butter/30";
    case "snow":
      return "from-ink-2 via-ink to-cream/30";
    default:
      return "from-ink-2 via-ink to-lime/20";
  }
}

export function weatherIcon(weather?: string | null): string {
  switch ((weather || "").toLowerCase()) {
    case "rain":
    case "drizzle": return "ph-cloud-rain";
    case "cloudy": return "ph-cloud";
    case "sunny":
    case "clear": return "ph-sun";
    case "snow": return "ph-snowflake";
    default: return "ph-cloud-sun";
  }
}
