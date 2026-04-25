import type { RuleChip } from "@/lib/ruleFormat";

interface Props {
  chips: RuleChip[];
}

export function RuleChipStrip({ chips }: Props) {
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((c, i) => (
        <span
          key={`${c.icon}-${i}`}
          className="inline-flex items-center gap-1.5 rounded-full bg-ink/5 border border-ink/10 px-3 py-1.5 text-[13px] text-ink animate-fade-up"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <i className={`ph-fill ${c.icon} text-sm opacity-70`} aria-hidden />
          {c.label}
        </span>
      ))}
    </div>
  );
}
