"use client";

// Points → grade. Inputs go up as strings; the finished Reckoning comes back
// down as a prop.

import type { Reckoning } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import type { Conv } from "@/lib/model";
import { field, Receipt, ResultFigure } from "./ui";

export function Converter({
  sys,
  dp,
  showWork,
  conv,
  result,
  onChange,
}: {
  sys: GradingSystem;
  dp: number;
  showWork: boolean;
  conv: Conv;
  result: Reckoning;
  onChange: (p: Partial<Conv>) => void;
}) {
  return (
    <section className="mt-12 rounded-xl border bg-card px-5 py-5" style={{ borderColor: "var(--line)" }}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-medium">Points → grade</h2>
          <p className="mt-0.5 text-sm" style={{ color: "var(--muted)" }}>Turn a score into a grade on the {sys.short} scale.</p>
        </div>
        <div className="flex overflow-hidden rounded-md border text-sm" style={{ borderColor: "var(--line)" }} role="group" aria-label="Conversion formula">
          {([["proportional", "proportional"], ["linear", "pass at X%"]] as [Conv["variant"], string][]).map(([id, label]) => {
            const active = conv.variant === id;
            return (
              <button key={id} onClick={() => onChange({ variant: id })} className="px-3 py-1 font-medium transition-colors" style={{ background: active ? "var(--forge)" : "transparent", color: active ? "#fff" : "var(--ink)" }}>{label}</button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-xs" style={{ color: "var(--muted)" }}>
          <span className="mb-1 block">points</span>
          <input value={conv.points} onChange={(e) => onChange({ points: e.target.value })} inputMode="decimal" placeholder="0" className={"tnum w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} />
        </label>
        <span className="pb-1.5 text-lg" style={{ color: "var(--muted)" }}>/</span>
        <label className="text-xs" style={{ color: "var(--muted)" }}>
          <span className="mb-1 block">max</span>
          <input value={conv.max} onChange={(e) => onChange({ max: e.target.value })} inputMode="decimal" className={"tnum w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} />
        </label>
        {conv.variant === "linear" && (
          <label className="text-xs" style={{ color: "var(--muted)" }}>
            <span className="mb-1 block">pass at %</span>
            <input value={conv.passPct} onChange={(e) => onChange({ passPct: e.target.value })} inputMode="decimal" className={"tnum w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} />
          </label>
        )}
        <div className="ml-auto">
          <ResultFigure r={result} sys={sys} dp={dp} size="text-4xl" />
        </div>
      </div>
      <Receipt r={result} show={showWork} dp={dp} />
    </section>
  );
}
