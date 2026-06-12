"use client";

// Small presentational pieces. Everything in this file renders props — no
// state, no storage, no math.

import { fmt, type Reckoning } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import type { Grade } from "@/lib/model";

export function field(extra = "") {
  // text-base on small screens: inputs under 16px make iOS Safari zoom in on focus.
  return (
    "border border-[var(--rule-strong)] bg-[var(--paper)] px-3 py-2 text-base leading-tight outline-none transition-colors placeholder:text-[var(--meta)] focus:border-[var(--red)] sm:text-sm " +
    extra
  );
}

export function gradeColor(value: number, ok: boolean | null) {
  if (ok === null || !isFinite(value)) return "var(--muted)";
  return ok ? "var(--ink)" : "var(--no)";
}

export function Verdict({ r, sys }: { r: Reckoning; sys: GradingSystem }) {
  if (r.ok === null) return null;
  return (
    <span
      className="mono tnum inline-flex h-6 items-center gap-1.5 border px-2 text-[0.64rem] font-semibold uppercase leading-none"
      style={{
        color: r.ok ? "var(--ok)" : "var(--no)",
        borderColor: r.ok ? "rgba(47,125,87,0.35)" : "rgba(178,59,46,0.35)",
        background: r.ok ? "rgba(47,125,87,0.10)" : "var(--forge-soft)",
      }}
    >
      <span aria-hidden>{r.ok ? "✓" : "✕"}</span>
      {r.ok ? sys.passLabel : sys.failLabel}
    </span>
  );
}

// The big number plus its pass/fail pill.
export function ResultFigure({
  r,
  sys,
  dp,
  size = "text-5xl",
}: {
  r: Reckoning;
  sys: GradingSystem;
  dp: number;
  size?: string;
}) {
  const value = isFinite(r.value) ? fmt(r.value, dp) : "—";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <GradeNumber value={value} color={gradeColor(r.value, r.ok)} size={size} />
      <Verdict r={r} sys={sys} />
    </div>
  );
}

function GradeNumber({
  value,
  color,
  size,
}: {
  value: string;
  color: string;
  size: string;
}) {
  const parts = value.split(".");

  if (parts.length !== 2) {
    return (
      <span className={`tnum slab ${size} font-bold leading-none`} style={{ color }}>
        {value}
      </span>
    );
  }

  return (
    <span
      aria-label={value}
      className={`tnum slab inline-flex items-end ${size} font-bold leading-none`}
      style={{ color }}
    >
      <span>{parts[0]}</span>
      <span aria-hidden className="result-decimal" />
      <span>{parts[1]}</span>
    </span>
  );
}

export function Receipt({
  r,
  dp,
  label = "Show calculation",
}: {
  r: Reckoning;
  dp: number;
  label?: string;
}) {
  if (r.steps.length === 0) return null;
  return (
    <details className="mt-4 w-full border border-[var(--rule)] bg-[var(--paper-2)] p-3">
      <summary className="mono cursor-pointer text-[0.72rem] font-semibold uppercase text-[var(--muted)]">
        {label}
      </summary>

      <div className="mt-3 space-y-3 sm:hidden">
        {r.steps.map((s, i) => (
          <div key={i} className="border-b border-[var(--rule)] pb-3 last:border-b-0 last:pb-0">
            <div className="flex items-start justify-between gap-3">
              <p className="mono text-[0.72rem] font-semibold text-[var(--meta)]">
                {s.label}
              </p>
              <p className="mono tnum shrink-0 text-sm font-semibold">
                {fmt(s.result, i === r.steps.length - 1 ? dp : 4)}
              </p>
            </div>
            <p className="mono tnum mt-1 break-words text-[0.8rem] leading-relaxed">
              {s.expr}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-3 hidden overflow-x-auto sm:block">
        <table className="mono min-w-full border-collapse text-[0.82rem]">
          <thead>
            <tr className="border-b border-[var(--rule)] text-left text-[0.66rem] uppercase text-[var(--meta)]">
              <th className="pb-2 pr-4 font-semibold">Step</th>
              <th className="pb-2 pr-4 font-semibold">Formula</th>
              <th className="pb-2 font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {r.steps.map((s, i) => (
              <tr key={i} className="border-b border-[var(--rule)] align-baseline last:border-b-0">
                <td className="whitespace-nowrap py-2 pr-4 text-[var(--muted)]">
                  {s.label}
                </td>
                <td className="tnum break-words py-2 pr-4">{s.expr}</td>
                <td className="tnum whitespace-nowrap py-2 font-semibold">
                  {fmt(s.result, i === r.steps.length - 1 ? dp : 4)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {r.raw !== null && r.value !== r.raw && (
        <p className="mono tnum mt-3 text-[0.78rem] text-[var(--muted)]">
          Exact value {fmt(r.raw)} rounded to {fmt(r.value, dp)}
        </p>
      )}
    </details>
  );
}

export function GradeValue({ sys, value, onChange }: { sys: GradingSystem; value: string; onChange: (v: string) => void }) {
  if (sys.kind === "scale") {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Grade"
        className={"tnum w-full " + field()}
        style={{ borderColor: "var(--line)" }}
      >
        <option value="">—</option>
        {sys.options!.map((o) => (
          <option key={o.label} value={o.label}>{o.label}</option>
        ))}
      </select>
    );
  }
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="grade"
      inputMode="decimal"
      aria-label="Grade"
      className={"tnum w-full text-center " + field()}
      style={{ borderColor: "var(--line)" }}
    />
  );
}

// One editable grade line: label · value · weight · remove.
export function GradeRow({
  sys,
  grade,
  onEdit,
  onRemove,
}: {
  sys: GradingSystem;
  grade: Grade;
  onEdit: (p: Partial<Grade>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-[var(--rule)] py-3 first:border-t-0 sm:grid-cols-[minmax(12rem,1fr)_8rem_7rem_auto] sm:items-end">
      <label className="col-span-3 block sm:col-span-1">
        <span className="label">Exam</span>
        <input
          value={grade.label}
          onChange={(e) => onEdit({ label: e.target.value })}
          placeholder="Exam name"
          aria-label="Grade label"
          className={"w-full " + field()}
          style={{ borderColor: "var(--line)" }}
        />
      </label>

      <label className="block">
        <span className="label">Grade</span>
        <GradeValue sys={sys} value={grade.value} onChange={(v) => onEdit({ value: v })} />
      </label>

      <label className="block">
        <span className="label">Weight</span>
        <input
          value={grade.weight}
          onChange={(e) => onEdit({ weight: e.target.value })}
          placeholder="1"
          inputMode="decimal"
          aria-label="Grade weight"
          className={"tnum w-full text-center " + field()}
          style={{ borderColor: "var(--line)" }}
        />
      </label>

      <button
        onClick={onRemove}
        aria-label="Remove grade"
        className="self-end border border-transparent px-2 py-2 text-sm font-semibold text-[var(--muted)] transition hover:border-[var(--red)] hover:text-[var(--red)] sm:px-3"
        type="button"
      >
        Remove
      </button>
    </div>
  );
}
