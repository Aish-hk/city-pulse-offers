import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LONDON_NEIGHBORHOODS, CUISINES } from "@/lib/london";
import { cn } from "@/lib/utils";

export interface Filters {
  neighborhood: string;
  cuisine: string;
  query: string;
  nearbyOnly: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  neighborhood: "All cities",
  cuisine: "All cuisines",
  query: "",
  nearbyOnly: false,
};

interface FilterBarProps {
  value: Filters;
  onChange: (f: Filters) => void;
  totalCount: number;
}

export function FilterBar({ value, onChange, totalCount }: FilterBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="mt-6 rounded-[24px] bg-card border border-border/50 overflow-hidden">
      {/* Search */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left"
      >
        <i className="ph ph-magnifying-glass text-xl text-foreground/70" />
        <span className="font-mono text-[12px] tracking-widest uppercase text-foreground/80">
          Search
        </span>
        <span className="ml-auto font-mono text-[11px] text-foreground/50">
          {totalCount} venues
        </span>
      </button>

      {open && (
        <div className="px-5 pb-4 -mt-1">
          <input
            type="text"
            value={value.query}
            onChange={(e) => onChange({ ...value, query: e.target.value })}
            placeholder="venue or dish…"
            className="w-full bg-background/60 border border-border/60 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-foreground/40"
          />
        </div>
      )}

      <div className="border-t border-border/50">
        <Select
          value={value.neighborhood}
          onValueChange={(v) => onChange({ ...value, neighborhood: v })}
        >
          <SelectTrigger className="w-full h-14 rounded-none border-0 px-5 bg-transparent text-foreground font-medium">
            <div className="flex items-center gap-3">
              <i className="ph ph-map-pin text-lg text-foreground/70" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {LONDON_NEIGHBORHOODS.map((n) => (
              <SelectItem key={n} value={n}>{n}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="border-t border-border/50">
        <Select
          value={value.cuisine}
          onValueChange={(v) => onChange({ ...value, cuisine: v })}
        >
          <SelectTrigger className="w-full h-14 rounded-none border-0 px-5 bg-transparent text-foreground font-medium">
            <div className="flex items-center gap-3">
              <i className="ph ph-fork-knife text-lg text-foreground/70" />
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {CUISINES.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Nearby + filter row */}
      <div className="border-t border-border/50 grid grid-cols-2">
        <button
          type="button"
          onClick={() => onChange({ ...value, nearbyOnly: !value.nearbyOnly })}
          className={cn(
            "flex items-center justify-center gap-2 h-14 font-mono text-[12px] tracking-widest uppercase transition-colors",
            value.nearbyOnly ? "bg-foreground text-background" : "text-foreground/80 hover:bg-foreground/5"
          )}
        >
          <i className="ph ph-crosshair-simple text-base" />
          Nearby: {value.nearbyOnly ? "On" : "Off"}
        </button>
        <button
          type="button"
          onClick={() => onChange(DEFAULT_FILTERS)}
          className="flex items-center justify-center gap-2 h-14 font-mono text-[12px] tracking-widest uppercase text-foreground/80 border-l border-border/50 hover:bg-foreground/5"
        >
          <i className="ph ph-sliders-horizontal text-base" />
          Reset
        </button>
      </div>
    </section>
  );
}
