"use client";

// The quick-average view: one flat list of grades, one result.

import type { Reckoning } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import type { Grade } from "@/lib/model";
import type { Actions } from "../useGradeForge";
import { GradeRow, Receipt, ResultFigure } from "./ui";

export function QuickView({
  sys,
  dp,
  showWork,
  grades,
  result,
  actions,
}: {
  sys: GradingSystem;
  dp: number;
  showWork: boolean;
  grades: Grade[];
  result: Reckoning;
  actions: Pick<Actions, "addQuick" | "editQuick" | "removeQuick">;
}) {
  return (
    <section className="border-y border-[var(--rule)] bg-[var(--paper-2)] px-4 py-5 sm:px-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="kicker">Average</p>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>a flat list of grades — weight any that count more</p>
        </div>
        <ResultFigure r={result} sys={sys} dp={dp} />
      </div>
      <Receipt r={result} show={showWork} dp={dp} />

      <div className="mt-5 space-y-2">
        {grades.map((g) => (
          <GradeRow
            key={g.id}
            sys={sys}
            grade={g}
            onEdit={(p) => actions.editQuick(g.id, p)}
            onRemove={() => actions.removeQuick(g.id)}
          />
        ))}
      </div>
      <button onClick={actions.addQuick} className="mono mt-3 text-[0.72rem] font-medium uppercase tracking-[0.08em] text-[var(--red)]" type="button">+ exam</button>
    </section>
  );
}
