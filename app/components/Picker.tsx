"use client";

// First-launch / change-system dialog. Owns only its own UI state (search
// text, custom-scale form); the chosen system goes up through onChoose.

import { useState } from "react";
import { SYSTEMS, type GradingSystem } from "@/lib/systems";
import { customFromForm, type CustomForm } from "@/lib/model";
import { field } from "./ui";

export function Picker({
  open,
  mustChoose,
  onChoose,
  onClose,
}: {
  open: boolean;
  mustChoose: boolean;
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
      style={{ background: "rgba(28,26,23,0.45)" }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && !mustChoose) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl border bg-paper p-5 shadow-xl" style={{ borderColor: "var(--line)" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold">Choose your grading system</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
              Pick the scale your school uses. You can change it later, and build a custom one if yours isn&apos;t here.
            </p>
          </div>
          {!mustChoose && (
            <button onClick={onClose} aria-label="Close" className="text-2xl leading-none" style={{ color: "var(--muted)" }}>×</button>
          )}
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

        <div className="mt-3 max-h-[44vh] space-y-1 overflow-y-auto pr-1">
          {list.map((s) => (
            <button
              key={s.id}
              onClick={() => onChoose(s)}
              className="flex w-full items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-[var(--line)] hover:bg-card"
            >
              <span className="text-xl" aria-hidden>{s.flag}</span>
              <span className="min-w-0 flex-1">
                <span className="block font-medium">{s.name}</span>
                <span className="block text-xs" style={{ color: "var(--muted)" }}>{s.country} · {s.note}</span>
              </span>
              <span className="tnum rounded-full border px-2 py-0.5 text-xs" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>{s.short}</span>
            </button>
          ))}
          {list.length === 0 && (
            <p className="px-3 py-6 text-center text-sm" style={{ color: "var(--muted)" }}>
              No preset for that. Build a custom scale below — it covers any system.
            </p>
          )}
        </div>

        <div className="mt-4 border-t pt-4" style={{ borderColor: "var(--line)" }}>
          <button onClick={() => setShowCustom((v) => !v)} className="text-sm font-medium" style={{ color: "var(--forge)" }}>
            {showCustom ? "− Hide custom scale" : "+ Build a custom scale"}
          </button>

          {showCustom && (
            <div className="mt-3 space-y-3">
              <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="Name (e.g. My uni's scale)" className={"w-full " + field()} style={{ borderColor: "var(--line)" }} />
              <div className="flex flex-wrap items-end gap-3 text-xs" style={{ color: "var(--muted)" }}>
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
                    className="rounded-md border px-2.5 py-1 font-medium"
                    style={{
                      borderColor: "var(--line)",
                      background: c.direction === d ? "var(--forge)" : "transparent",
                      color: c.direction === d ? "#fff" : "var(--ink)",
                    }}
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
                className="rounded-md px-3 py-1.5 text-sm font-medium text-white"
                style={{ background: "var(--forge)" }}
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
