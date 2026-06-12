"use client";

// First-launch / change-system dialog. Owns only its own UI state (search
// text, custom-scale form); the chosen system goes up through onChoose.

import { useState } from "react";
import { SYSTEMS, type GradingSystem } from "@/lib/systems";
import { customFromForm, type CustomForm } from "@/lib/model";
import { field } from "./ui";

export function Picker({
  open,
  onChoose,
  onClose,
}: {
  open: boolean;
  onChoose: (s: GradingSystem) => void;
  onClose: () => void;
}) {
  const [q, setQ] = useState("");
  const [showCustom, setShowCustom] = useState(false);
  const [c, setC] = useState<CustomForm>({ name: "", min: "0", max: "100", direction: "up", pass: "60", rounding: "tenth" });

  if (!open) return null;

  const needle = q.trim().toLowerCase();
  const list = SYSTEMS.filter(
    (s) => !needle || s.country.toLowerCase().includes(needle) || s.name.toLowerCase().includes(needle)
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:p-8"
      style={{ background: "rgba(28,28,28,0.48)" }}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="w-full max-w-2xl border-2 border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[8px_8px_0_var(--ink)] sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="kicker">Scale</p>
            <h2 className="mt-2 text-2xl leading-tight">Choose your grading system</h2>
          </div>
          <button
            onClick={onClose}
            className="mono text-[0.72rem] font-semibold uppercase text-[var(--muted)] transition hover:text-[var(--red)]"
            type="button"
          >
            Close
          </button>
        </div>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search country or scale…"
          aria-label="Search grading systems"
          className={"mt-4 w-full " + field()}
          style={{ borderColor: "var(--line)" }}
          autoFocus
        />

        <div className="mt-4 max-h-[44vh] overflow-y-auto border-y border-[var(--rule)]">
          {list.map((s) => (
            <button
              key={s.id}
              onClick={() => onChoose(s)}
              className="flex w-full items-center gap-3 border-t border-[var(--rule)] px-3 py-2 text-left transition-colors first:border-t-0 hover:bg-[var(--red-tint)]"
              type="button"
            >
              <span className="text-xl" aria-hidden>{s.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.name}</span>
                <span className="block text-xs" style={{ color: "var(--muted)" }}>{s.country} · {s.note}</span>
              </span>
              <span className="mono tnum border border-[var(--rule)] px-2 py-0.5 text-[0.64rem] uppercase text-[var(--meta)]">{s.short}</span>
            </button>
          ))}
          {list.length === 0 && (
            <p className="px-3 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>
              No preset for that. Build a custom scale below — it covers any system.
            </p>
          )}
        </div>

        <div className="mt-4 border-t border-[var(--rule)] pt-4">
          <button onClick={() => setShowCustom((v) => !v)} className="mono text-[0.72rem] font-medium uppercase text-[var(--red)]" type="button">
            {showCustom ? "− Hide custom scale" : "+ Build a custom scale"}
          </button>

          {showCustom && (
            <div className="mt-3 space-y-3 border border-[var(--rule-strong)] bg-[var(--paper-2)] p-4">
              <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="Name (e.g. My uni's scale)" className={"w-full " + field()} style={{ borderColor: "var(--line)" }} />
              <div className="mono flex flex-wrap items-end gap-3 text-[0.66rem] uppercase" style={{ color: "var(--meta)" }}>
                <label>worst<input value={c.min} onChange={(e) => setC({ ...c, min: e.target.value })} inputMode="decimal" className={"tnum mt-1 block w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} /></label>
                <label>best<input value={c.max} onChange={(e) => setC({ ...c, max: e.target.value })} inputMode="decimal" className={"tnum mt-1 block w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} /></label>
                <label>pass mark<input value={c.pass} onChange={(e) => setC({ ...c, pass: e.target.value })} inputMode="decimal" className={"tnum mt-1 block w-20 text-center " + field()} style={{ borderColor: "var(--line)" }} /></label>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span style={{ color: "var(--muted)" }}>Better is</span>
                {(["up", "down"] as const).map((d) => (
                  <button
                    key={d}
                    onClick={() => setC({ ...c, direction: d })}
                    className="mono border px-2.5 py-1.5 text-[0.68rem] font-medium uppercase"
                    style={{
                      borderColor: "var(--line)",
                      background: c.direction === d ? "var(--red)" : "transparent",
                      color: c.direction === d ? "var(--paper)" : "var(--ink)",
                    }}
                    type="button"
                  >
                    {d === "up" ? "higher number" : "lower number"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => {
                  const built = customFromForm(c);
                  if (built) onChoose(built);
                }}
                className="mono border border-[var(--ink)] bg-[var(--ink)] px-4 py-2 text-[0.74rem] font-medium uppercase text-[var(--paper)] transition hover:border-[var(--red)] hover:bg-[var(--red)]"
                type="button"
              >
                Use this scale
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
