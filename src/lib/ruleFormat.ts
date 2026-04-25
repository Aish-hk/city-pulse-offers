// Pure formatters that turn a parsed merchant rule into human, UK-English strings.
// Keep zero side-effects so we can reuse on any surface (chips, copy, toasts).

const DAY_NAMES = ["", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function fmtTime(t?: string): string {
  if (!t) return "";
  const [hStr, mStr] = t.split(":");
  const h = Number(hStr);
  const m = Number(mStr || "0");
  const suffix = h >= 12 ? "pm" : "am";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, "0")}${suffix}`;
}

export function formatWindow(start?: string, end?: string, days?: number[]): string {
  const ds = (days || []).slice().sort();
  const isWeekdays = ds.length === 5 && ds.every((d, i) => d === i + 1);
  const isWeekends = ds.length === 2 && ds[0] === 6 && ds[1] === 7;
  const isAll = ds.length === 7;
  let dayLabel = "Every day";
  if (isWeekdays) dayLabel = "Weekdays";
  else if (isWeekends) dayLabel = "Weekends";
  else if (!isAll && ds.length > 0) dayLabel = ds.map((d) => DAY_NAMES[d]).join(" · ");

  const startLabel = fmtTime(start);
  const endLabel = fmtTime(end);
  const allDay = start === "00:00" && (end === "23:59" || end === "23:30");
  if (allDay) return dayLabel;
  return `${dayLabel} · ${startLabel}–${endLabel}`;
}

export function formatWeather(triggers?: any): string | null {
  const w = triggers?.weather as string[] | undefined;
  if (w && w.length) {
    if (w.includes("rain") || w.includes("drizzle")) return "When it rains";
    if (w.includes("sunny") || w.includes("clear")) return "When it's sunny";
    if (w.includes("cloudy")) return "When it's overcast";
    return `Weather: ${w.join(", ")}`;
  }
  if (typeof triggers?.temp_max_c === "number") return `When it's cold (≤${triggers.temp_max_c}°)`;
  return null;
}

export function formatInventory(tag?: string, items?: string[]): string {
  if (items && items.length) {
    if (items.length === 1) return `Featuring ${items[0]}`;
    if (items.length === 2) return `Featuring ${items[0]} & ${items[1]}`;
    return `Featuring ${items[0]} +${items.length - 1} more`;
  }
  if (!tag || tag === "general") return "Anything in the case";
  return `Featuring ${tag}`;
}

export function formatDiscount(min?: number, max?: number): string {
  if (min == null && max == null) return "Discount: auto";
  if (min === max) return `${min}% off`;
  return `${min ?? 5}–${max ?? 25}% off`;
}

export type RuleChip = { icon: string; label: string };

export function ruleToChips(parsed: any, items?: string[]): RuleChip[] {
  if (!parsed) return [];
  const chips: RuleChip[] = [];
  chips.push({
    icon: "ph-clock",
    label: formatWindow(parsed.active_window_start, parsed.active_window_end, parsed.active_days),
  });
  const weather = formatWeather(parsed.trigger_conditions);
  if (weather) chips.push({ icon: "ph-cloud-rain", label: weather });
  chips.push({
    icon: "ph-package",
    label: formatInventory(parsed.inventory_tag, items),
  });
  chips.push({
    icon: "ph-percent",
    label: formatDiscount(parsed.suggested_min_discount, parsed.suggested_max_discount),
  });
  return chips;
}
