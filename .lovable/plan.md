# Merchant Dashboard — Clarity Pass

## What's broken right now

1. **Parsed rule shown as raw JSON.** A café owner sees `"trigger_conditions": {"weather": ["rain"]}` and panics. The JsonReveal animation looks technical, not magical.
2. **No clear flow.** Goal, translation, preview, inventory, discount, presets, stats, insight all stack at equal weight. The merchant doesn't know what to do first or whether they're "done."
3. **Controls feel disconnected from the preview.** Inventory + discount sliders sit below the preview with no visual link — changes happen but feel invisible.
4. **Two ways to do the same thing.** Presets and free-text goal compete; presets are buried at the bottom now.

## The fix — 4 numbered steps with a single hero

Replace the current stacked sections with a numbered, narrative flow. Every step has one job. The preview is the protagonist; everything else serves it.

```text
┌─────────────────────────────────────┐
│  Watch House Coffee     ● LIVE       │
├─────────────────────────────────────┤
│  STEP 1 — TELL US YOUR GOAL          │
│  ┌───────────────────────────────┐   │
│  │ Big italic textarea           │   │
│  │ + 4 preset chips inline below │   │
│  └──────────────────[ Translate ]┘   │
├─────────────────────────────────────┤
│  STEP 2 — WE HEARD YOU               │
│  Cream card · plain-English readback │
│  ┌─ Rule chips (no JSON) ─────────┐  │
│  │ ⏱ 2pm–5pm  📅 Weekdays         │  │
│  │ 🌧 When it rains               │  │
│  │ 🥐 Pastries  💸 12–25% off     │  │
│  └────────────────────────────────┘  │
├─────────────────────────────────────┤
│  STEP 3 — TUNE THE OFFER             │
│  Inventory chips (with AI suggest)   │
│  Discount slider                     │
│  → "Changes apply live ↓"            │
├─────────────────────────────────────┤
│  STEP 4 — WHAT CUSTOMERS SEE         │
│  HERO offer card (lime)              │
│  [ Regenerate ] [ Push to wallet ]   │
├─────────────────────────────────────┤
│  Live stats · Insight · Crew strip   │
└─────────────────────────────────────┘
```

## Key design moves

**1. Kill the JSON. Replace with a "Rule chip strip."**
The parsed rule becomes a horizontal row of human chips with icons:
- `⏱ Weekday afternoons (2–5pm)` — from `active_window_*` + `active_days`
- `🌧 When it rains` — from `trigger_conditions.weather`
- `🥐 Featuring pastries` — from `inventory_tag`
- `💸 12–25% off` — from `min/max_discount_pct`

Each chip is editable with a tap (opens a tiny inline editor — for hackathon scope, just visual). The "We heard you" italic sentence sits above the chips. **No JSON, no monospace block.**

**2. Numbered step headers with progress.**
Each section gets a small badge: `STEP 01 · GOAL`, `STEP 02 · RULE`, `STEP 03 · TUNE`, `STEP 04 · PREVIEW`. Steps 2–4 stay visually muted (50% opacity) until step 1 completes, then fade in. This creates obvious forward motion.

**3. Presets fold INTO the goal input, not below.**
Move the 4 preset chips directly under the textarea as one-tap fillers. Removes the dead "Or pick a preset" section entirely.

**4. Tuning section gets a visual tether to the preview.**
- Add an arrow caption below tune controls: `↓ Updating the card below…` (with subtle pulse when regenerating).
- When discount/inventory changes, briefly flash the preview card border lime so the cause-effect lands.

**5. Preview gets a real CTA.**
Add a `Push to wallet` primary button on the preview card. It's already pushed (it's saved to `offers`), but the button confirms the action and takes them to `/wallet` to see it as a customer would. This is the "demo moment."

**6. Stats, Insight, Crew strip move into a collapsed footer area.**
Still visible on scroll, but no longer compete with the main flow. Insight stays as the tilted cream card — it's a great editorial moment, just not at step priority.

## Technical notes

- New component `src/components/RuleChipStrip.tsx` — takes the parsed rule object, formats human strings, renders chip row with phosphor icons.
- New component `src/components/StepHeader.tsx` — number badge + label + optional state (idle/active/done).
- Helper `src/lib/ruleFormat.ts` — pure functions: `formatWindow(start, end, days)`, `formatWeather(triggers)`, `formatInventory(tag, items)`, `formatDiscount(min, max)`. UK English, friendly tone.
- Delete `JsonReveal` + `colorize` from `MerchantDashboard.tsx` (no longer used).
- Restructure `MerchantDashboard.tsx` body into the 4 stepped sections. Reuse existing state — no schema or edge-function changes needed.
- Add a `pushed` toast on `Push to wallet` click (sonner) and a `Link` to `/wallet`.
- Step opacity gating: track `step` derived state (`1` until parsed, `2` until first regen, etc.) and apply `opacity-40 pointer-events-none` to future steps.

## Out of scope (for this pass)

- Editing rule chips inline (visual affordance only).
- Backend/edge function changes — the JSON the AI returns stays the same; we just stop showing it raw.
- Dark/light theming changes.
