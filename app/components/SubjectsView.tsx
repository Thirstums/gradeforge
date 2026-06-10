"use client";

// The subjects view: the overall average card plus one card per subject.
// Results arrive precomputed; this file only lays them out.

import type { Reckoning } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import type { Subject } from "@/lib/model";
import type { Actions } from "../useGradeForge";
import { field, GradeRow, Receipt, ResultFigure } from "./ui";

export function SubjectsView({
  sys,
  dp,
  showWork,
  subjects,
  results,
  overall,
  actions,
}: {
  sys: GradingSystem;
  dp: number;
  showWork: boolean;
  subjects: Subject[];
  results: Reckoning[];
  overall: Reckoning;
  actions: Pick<Actions, "addSubject" | "removeSubject" | "editSubject" | "addGrade" | "editGrade" | "removeGrade">;
}) {
  return (
    <>
      <section className="mb-8 border-y border-[var(--rule)] bg-[var(--paper-2)] px-4 py-5 sm:px-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="kicker">Overall average</p>
            <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
              weighted mean of the {subjects.length} subject grade{subjects.length === 1 ? "" : "s"}
            </p>
          </div>
          <ResultFigure r={overall} sys={sys} dp={dp} />
        </div>
        <Receipt r={overall} show={showWork} dp={dp} />
      </section>

      <div className="border-y border-[var(--rule)]">
        {subjects.map((sub, i) => {
          const res = results[i];
          return (
            <section key={sub.id} className="group relative border-t border-[var(--rule)] px-1 py-6 transition first:border-t-0 hover:bg-[var(--red-tint)] sm:px-3">
              <div
                aria-hidden="true"
                className="absolute bottom-[-1px] left-0 top-[-1px] w-0 bg-[var(--red)] transition-all group-hover:w-[3px]"
              />

              <div className="relative min-w-0 space-y-4">
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_12rem] lg:items-start">
                  <div className="flex min-w-0 gap-4">
                    <p className="slab shrink-0 text-[1.7rem] font-bold leading-none text-[var(--red)]">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <div className="min-w-0 flex-1">
                      <input
                        value={sub.name}
                        onChange={(e) => actions.editSubject(sub.id, { name: e.target.value })}
                        placeholder="Subject"
                        aria-label="Subject name"
                        className="slab w-full border-b border-transparent bg-transparent pb-1 text-[clamp(1.45rem,3vw,2rem)] font-bold leading-tight text-[var(--ink)] outline-none transition placeholder:text-[var(--meta)] focus:border-[var(--red)]"
                      />
                      <label className="mono mt-3 flex w-fit items-center gap-2 text-[0.66rem] uppercase tracking-[0.14em]" style={{ color: "var(--meta)" }}>
                        weight
                        <input value={sub.weight} onChange={(e) => actions.editSubject(sub.id, { weight: e.target.value })} inputMode="decimal" aria-label="Subject weight" className={"tnum w-14 text-center " + field()} style={{ borderColor: "var(--line)" }} />
                      </label>
                    </div>
                  </div>

                  <div className="border-l-2 border-[var(--red)] pl-3 lg:text-right">
                    <p className="mono text-[0.64rem] uppercase tracking-[0.14em] text-[var(--meta)]">
                      Average
                    </p>
                    <div className="mt-1 flex lg:justify-end">
                      <ResultFigure r={res} sys={sys} dp={dp} size="text-3xl" />
                    </div>
                    <button onClick={() => actions.removeSubject(sub.id)} aria-label="Remove subject" className="mono mt-2 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--muted)] transition hover:text-[var(--red)]" type="button">Remove</button>
                  </div>
                </div>

                <div className="space-y-2">
                  {sub.grades.map((g) => (
                    <GradeRow
                      key={g.id}
                      sys={sys}
                      grade={g}
                      onEdit={(p) => actions.editGrade(sub.id, g.id, p)}
                      onRemove={() => actions.removeGrade(sub.id, g.id)}
                    />
                  ))}
                </div>

                <button onClick={() => actions.addGrade(sub.id)} className="mono text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[var(--red)]" type="button">+ exam</button>
                <Receipt r={res} show={showWork} dp={dp} />
              </div>
            </section>
          );
        })}
      </div>

      <button
        onClick={actions.addSubject}
        className="mono mt-5 w-full border border-dashed border-[var(--rule-strong)] py-3 text-[0.74rem] font-medium uppercase tracking-[0.08em] text-[var(--red)] transition hover:border-[var(--red)] hover:bg-[var(--red-tint)]"
        type="button"
      >
        + subject
      </button>
    </>
  );
}
