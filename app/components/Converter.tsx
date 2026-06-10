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
    <section className="mt-12 border-y border-[var(--rule)] bg-[var(--paper-2)] px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Converter</p>
          <h2 className="mt-2 text-2xl leading-tight">Points → grade</h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>Turn a score into a grade on the {sys.short} scale.</p>
        </div>
        <div className="flex border border-[var(--rule-strong)] text-sm" role="group" aria-label="Conversion formula">
          {([["proportional", "proportional"], ["linear", "pass at X%"]] as [Conv["variant"], string][]).map(([id, label]) => {
            const active = conv.variant === id;
            return (
              <button
                key={id}
                onClick={() => onChange({ variant: id })}
                className="mono border-r border-[var(--rule-strong)] px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.08em] transition-colors last:border-r-0"
                style={{ background: active ? "var(--red)" : "transparent", color: active ? "var(--paper)" : "var(--ink)" }}
                type="button"
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="mono text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: "var(--meta)" }}>
          <span className="mb-1 block">points</span>
          <input value={conv.points} onChange={(e) => onChange({ points: e.target.value })} inputMode="decimal" placeholder="0" className={"tnum w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} />
        </label>
        <span className="pb-1.5 text-lg" style={{ color: "var(--muted)" }}>/</span>
        <label className="mono text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: "var(--meta)" }}>
          <span className="mb-1 block">max</span>
          <input value={conv.max} onChange={(e) => onChange({ max: e.target.value })} inputMode="decimal" className={"tnum w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} />
        </label>
        {conv.variant === "linear" && (
          <label className="mono text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: "var(--meta)" }}>
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
