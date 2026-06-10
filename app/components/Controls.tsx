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
    <section className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3 rounded-lg border bg-card px-4 py-3" style={{ borderColor: "var(--line)" }}>
      <button
        onClick={onChangeSystem}
        className="flex items-center gap-2 rounded-md border px-2.5 py-1 text-sm transition-colors hover:bg-paper"
        style={{ borderColor: "var(--line)" }}
        title="Change grading system"
      >
        <span aria-hidden>{sys.flag}</span>
        <span className="font-medium">{sys.name}</span>
        <span style={{ color: "var(--muted)" }}>change</span>
      </button>

      <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "var(--line)" }} role="group" aria-label="View">
        {(["subjects", "quick"] as const).map((v) => {
          const active = view === v;
          return (
            <button
              key={v}
              onClick={() => onView(v)}
              className="px-3 py-1 text-sm font-medium transition-colors"
              style={{ background: active ? "var(--forge)" : "transparent", color: active ? "#fff" : "var(--ink)" }}
            >
              {v === "quick" ? "quick average" : "subjects"}
            </button>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: "var(--muted)" }}>round</span>
        <div className="flex overflow-hidden rounded-md border" style={{ borderColor: "var(--line)" }} role="group" aria-label="Rounding rule">
          {roundingChoices.map((r) => {
            const active = rounding === r.id;
            return (
              <button key={r.id} onClick={() => onRounding(r.id)} title={r.hint} className="tnum px-2 py-1 text-sm font-medium transition-colors" style={{ background: active ? "var(--forge)" : "transparent", color: active ? "#fff" : "var(--ink)" }}>
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      <label className="flex cursor-pointer items-center gap-2 text-sm">
        <input type="checkbox" checked={showWork} onChange={(e) => onShowWork(e.target.checked)} className="h-4 w-4 accent-[var(--forge)]" />
        <span style={{ color: "var(--muted)" }}>show work</span>
      </label>
    </section>
  );
}
