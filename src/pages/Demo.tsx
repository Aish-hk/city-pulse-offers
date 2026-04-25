import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PillButton } from "@/components/PillButton";
import { getSessionId } from "@/lib/session";
import illusRoseCity from "@/assets/illus-rose-city.png";

const WEATHER_OPTS = ["sunny", "cloudy", "rain", "drizzle", "snow"] as const;

export default function Demo() {
  const sessionId = getSessionId();
  const [weather, setWeather] = useState<string>("");
  const [time, setTime] = useState<string>("");
  const [log, setLog] = useState<string[]>([]);
  const [working, setWorking] = useState(false);

  function logLine(s: string) {
    setLog((p) => [`${new Date().toLocaleTimeString()} · ${s}`, ...p].slice(0, 30));
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("demo_overrides").select("*").eq("id", "global").maybeSingle();
      if (data?.weather_override) setWeather(data.weather_override);
      if (data?.time_override) setTime(new Date(data.time_override).toISOString().slice(0, 16));
    })();
  }, []);

  async function applyOverride() {
    setWorking(true);
    const payload: any = { id: "global" };
    payload.weather_override = weather || null;
    payload.time_override = time ? new Date(time).toISOString() : null;
    const { error } = await supabase.from("demo_overrides").upsert(payload, { onConflict: "id" });
    if (error) logLine(`override fail: ${error.message}`);
    else logLine(`override saved: weather=${weather || "—"} time=${time || "—"}`);
    setWorking(false);
  }

  async function clearOverride() {
    setWeather("");
    setTime("");
    const { error } = await supabase
      .from("demo_overrides")
      .upsert({ id: "global", weather_override: null, time_override: null }, { onConflict: "id" });
    if (error) logLine(`clear fail: ${error.message}`);
    else logLine("overrides cleared");
  }

  async function triggerGen() {
    setWorking(true);
    logLine("generate-offer firing…");
    const { data, error } = await supabase.functions.invoke("generate-offer", {
      body: { user_session_id: sessionId, lat: 51.5246, lng: -0.0784 },
    });
    if (error) logLine(`gen err: ${error.message}`);
    else logLine(`gen ok: ${data?.offers?.length ?? 0} offers, weather=${data?.context?.weather}`);
    setWorking(false);
  }

  async function refreshInsights() {
    setWorking(true);
    const { data: ms } = await supabase.from("merchants").select("id, name");
    for (const m of ms || []) {
      const { error } = await supabase.functions.invoke("merchant-insights", { body: { merchant_id: m.id } });
      logLine(error ? `insight ${m.name} err` : `insight ${m.name} ok`);
    }
    setWorking(false);
  }

  return (
    <div className="dark min-h-screen bg-ink text-cream">
      <div className="mx-auto max-w-md p-4 pt-safe pb-16">
        <div className="flex items-center justify-between">
          <Link to="/wallet" className="font-mono text-[11px] tracking-widest uppercase opacity-70">← back</Link>
          <span className="font-mono text-[11px] tracking-widest uppercase opacity-70">DEMO CONTROL</span>
        </div>

        <h1 className="font-display text-5xl mt-4 leading-[0.95]">The director's chair.</h1>
        <p className="font-mono text-[11px] uppercase tracking-widest opacity-60 mt-2">Override reality. Watch the wallet react.</p>

        <div className="mt-6 rounded-[24px] overflow-hidden">
          <img src={illusRoseCity} alt="" className="w-full" />
        </div>

        {/* Weather */}
        <section className="mt-7">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">Weather</div>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              onClick={() => setWeather("")}
              className={`pill pill-sm ${!weather ? "bg-lime text-ink" : "bg-ink-2 text-cream border border-cream/10"}`}
            >
              live
            </button>
            {WEATHER_OPTS.map((w) => (
              <button
                key={w}
                onClick={() => setWeather(w)}
                className={`pill pill-sm ${weather === w ? "bg-lime text-ink" : "bg-ink-2 text-cream border border-cream/10"}`}
              >
                {w}
              </button>
            ))}
          </div>
        </section>

        {/* Time */}
        <section className="mt-6">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-70">Time override</div>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-2 w-full bg-ink-2 border border-cream/10 rounded-2xl px-4 py-3 font-mono text-sm text-cream"
          />
        </section>

        {/* Actions */}
        <section className="mt-7 grid grid-cols-2 gap-3">
          <PillButton variant="lime" onClick={applyOverride} disabled={working}>
            <i className="ph-fill ph-floppy-disk" /> Apply
          </PillButton>
          <PillButton variant="ghost" className="text-cream" onClick={clearOverride} disabled={working}>
            <i className="ph ph-eraser" /> Clear
          </PillButton>
          <PillButton variant="cream" onClick={triggerGen} disabled={working}>
            <i className="ph-fill ph-sparkle" /> Generate offers
          </PillButton>
          <PillButton variant="tomato" onClick={refreshInsights} disabled={working}>
            <i className="ph-fill ph-magnifying-glass" /> Refresh insights
          </PillButton>
        </section>

        {/* Log */}
        <section className="mt-8">
          <div className="font-mono text-[11px] tracking-widest uppercase opacity-70 mb-2">Log</div>
          <div className="rounded-2xl bg-ink-2 border border-cream/10 p-3 font-mono text-[11px] leading-relaxed max-h-72 overflow-auto">
            {log.length === 0 ? <span className="opacity-50">no events yet</span> : log.map((l, i) => <div key={i} className="opacity-90">{l}</div>)}
          </div>
        </section>
      </div>
    </div>
  );
}
