"use client";

// The settings bar: system, view, rounding rule, show-work toggle.

import type { Rounding } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import type { View } from "@/lib/model";

const roundingChoices: { id: Rounding; label: string; hint: string }[] = [
  { id: "hundredth", label: "0.01", hint: "nearest hundredth" },
  { id: "tenth", label: "0.1", hint: "nearest tenth" },
  { id: "half", label: "0.5", hint: "nearest half" },
  { id: "whole", label: "1", hint: "nearest whole" },
  { id: "none", label: "exact", hint: "no rounding" },
];

export function Controls({
  sys,
  view,
  rounding,
  showWork,
  onChangeSystem,
  onView,
  onRounding,
  onShowWork,
}: {
  sys: GradingSystem;
  view: View;
  rounding: Rounding;
  showWork: boolean;
  onChangeSystem: () => void;
  onView: (v: View) => void;
  onRounding: (r: Rounding) => void;
  onShowWork: (v: boolean) => void;
}) {
  return (
    <section className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 border-y border-[var(--rule)] bg-[var(--paper-2)] px-4 py-4 sm:px-5">
      <button
        onClick={onChangeSystem}
        className="mono flex items-center gap-2 border border-[var(--ink)] bg-[var(--ink)] px-3 py-2 text-[0.74rem] uppercase tracking-[0.08em] text-[var(--paper)] transition hover:border-[var(--red)] hover:bg-[var(--red)]"
        title="Change grading system"
        type="button"
      >
        <span aria-hidden>{sys.flag}</span>
        <span>{sys.name}</span>
      </button>

      <div className="flex border border-[var(--rule-strong)]" role="group" aria-label="View">
        {(["subjects", "quick"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => onView(v)}
              className="mono border-r border-[var(--rule-strong)] px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.08em] transition-colors last:border-r-0"
              style={{ background: active ? "var(--red)" : "transparent", color: active ? "var(--paper)" : "var(--ink)" }}
              type="button"
            >
              {v === "quick" ? "quick average" : "subjects"}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="mono text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: "var(--meta)" }}>round</span>
        <div className="flex flex-wrap border border-[var(--rule-strong)]" role="group" aria-label="Rounding rule">
          {roundingChoices.map((r) => {
            const active = rounding === r.id;
            return (
              <button
                key={r.id}
                onClick={() => onRounding(r.id)}
                title={r.hint}
                className="mono tnum border-r border-[var(--rule-strong)] px-2.5 py-2 text-[0.7rem] font-medium uppercase tracking-[0.06em] transition-colors last:border-r-0"
                style={{ background: active ? "var(--red)" : "transparent", color: active ? "var(--paper)" : "var(--ink)" }}
                type="button"
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="mono flex cursor-pointer items-center gap-2 text-[0.7rem] uppercase tracking-[0.08em]">
        <input type="checkbox" checked={showWork} onChange={(e) => onShowWork(e.target.checked)} className="h-4 w-4 accent-[var(--forge)]" />
        <span style={{ color: "var(--muted)" }}>show work</span>
      </label>
    </section>
  );
}
