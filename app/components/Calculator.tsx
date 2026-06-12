"use client";

import type { Rounding, Reckoning } from "@/lib/grades";
import type { Conv, Subject } from "@/lib/model";
import type { GradingSystem } from "@/lib/systems";
import type { Actions } from "../useGradeForge";
import { field, GradeRow, Receipt, ResultFigure } from "./ui";

const ROUNDING: { id: Rounding; label: string }[] = [
  { id: "hundredth", label: "0.01" },
  { id: "tenth", label: "0.1" },
  { id: "half", label: "0.5" },
  { id: "whole", label: "1" },
  { id: "none", label: "Exact" },
];

export function Calculator({
  sys,
  dp,
  rounding,
  subjects,
  subjectResults,
  overall,
  conv,
  convResult,
  actions,
}: {
  sys: GradingSystem;
  dp: number;
  rounding: Rounding;
  subjects: Subject[];
  subjectResults: Reckoning[];
  overall: Reckoning;
  conv: Conv;
  convResult: Reckoning;
  actions: Actions;
}) {
  return (
    <div className="space-y-5">
      <section className="border-y border-[var(--rule)] bg-[var(--paper-2)] p-4 sm:p-5">
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,26rem)] lg:items-start">
          <div>
            <p className="label">Average</p>
            <div className="mt-2">
              <ResultFigure r={overall} sys={sys} dp={dp} />
            </div>
            <p className="mt-2 text-sm text-[var(--muted)]">
              {subjects.length} subject{subjects.length === 1 ? "" : "s"}.
              Empty grades are ignored.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <p className="label">Scale</p>
              <button
                onClick={actions.openPicker}
                className="flex w-full items-center justify-between gap-3 border border-[var(--ink)] bg-[var(--paper)] px-3 py-2 text-left transition hover:border-[var(--red)] hover:text-[var(--red)]"
                type="button"
              >
                <span className="min-w-0 font-semibold">
                  <span aria-hidden>{sys.flag}</span> {sys.name}
                </span>
                <span className="text-sm text-[var(--muted)]">Change</span>
              </button>
            </div>

            <div>
              <p className="label">Round to</p>
              <div
                className="grid grid-cols-5 overflow-hidden border border-[var(--rule-strong)]"
                role="group"
                aria-label="Rounding"
              >
                {ROUNDING.map((option) => {
                  const active = option.id === rounding;
                  return (
                    <button
                      key={option.id}
                      onClick={() => actions.setRounding(option.id)}
                      className="mono tnum border-r border-[var(--rule-strong)] px-2 py-2 text-sm font-semibold uppercase transition last:border-r-0"
                      style={{
                        background: active ? "var(--red)" : "var(--paper)",
                        color: active ? "var(--paper)" : "var(--ink)",
                      }}
                      type="button"
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <Receipt r={overall} dp={dp} label="Show overall calculation" />
      </section>

      <section className="space-y-4" aria-label="Subjects">
        {subjects.map((subject, index) => (
          <SubjectCard
            key={subject.id}
            index={index}
            subject={subject}
            result={subjectResults[index]}
            sys={sys}
            dp={dp}
            actions={actions}
          />
        ))}

        <button
          onClick={actions.addSubject}
          className="mono w-full border border-dashed border-[var(--rule-strong)] bg-[var(--paper)] py-3 text-[0.78rem] font-semibold uppercase text-[var(--red)] transition hover:border-[var(--red)] hover:bg-[var(--red-tint)]"
          type="button"
        >
          Add subject
        </button>
      </section>

      <ConverterDetails
        sys={sys}
        dp={dp}
        conv={conv}
        result={convResult}
        onChange={actions.setConv}
      />
    </div>
  );
}

function SubjectCard({
  index,
  subject,
  result,
  sys,
  dp,
  actions,
}: {
  index: number;
  subject: Subject;
  result: Reckoning;
  sys: GradingSystem;
  dp: number;
  actions: Actions;
}) {
  return (
    <article className="border border-[var(--rule)] bg-[var(--paper)] p-4 transition hover:border-[var(--rule-strong)] sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_13rem] lg:items-start">
        <div className="grid gap-3 sm:grid-cols-[2.5rem_minmax(0,1fr)_7rem] sm:items-end">
          <div className="mono hidden h-10 w-10 items-center justify-center text-[1.1rem] font-bold text-[var(--red)] sm:flex">
            {String(index + 1).padStart(2, "0")}
          </div>
          <label className="block min-w-0">
            <span className="label">Subject</span>
            <input
              value={subject.name}
              onChange={(event) =>
                actions.editSubject(subject.id, { name: event.target.value })
              }
              placeholder={`Subject ${index + 1}`}
              className={"w-full font-semibold " + field()}
            />
          </label>
          <label className="block">
            <span className="label">Weight</span>
            <input
              value={subject.weight}
              onChange={(event) =>
                actions.editSubject(subject.id, { weight: event.target.value })
              }
              inputMode="decimal"
              className={"tnum w-full text-center " + field()}
            />
          </label>
        </div>

        <div className="border-t border-[var(--rule)] pt-4 lg:border-l lg:border-t-0 lg:pl-4">
          <p className="label">Subject average</p>
          <ResultFigure r={result} sys={sys} dp={dp} size="text-4xl" />
          <button
            onClick={() => actions.removeSubject(subject.id)}
            className="mono mt-2 text-[0.72rem] font-semibold uppercase text-[var(--muted)] transition hover:text-[var(--red)]"
            type="button"
          >
            Remove subject
          </button>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        {subject.grades.map((grade) => (
          <GradeRow
            key={grade.id}
            sys={sys}
            grade={grade}
            onEdit={(patch) => actions.editGrade(subject.id, grade.id, patch)}
            onRemove={() => actions.removeGrade(subject.id, grade.id)}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          onClick={() => actions.addGrade(subject.id)}
          className="mono border border-[var(--rule-strong)] px-3 py-2 text-[0.72rem] font-semibold uppercase transition hover:border-[var(--red)] hover:text-[var(--red)]"
          type="button"
        >
          Add grade
        </button>
        <Receipt r={result} dp={dp} label="Show subject calculation" />
      </div>
    </article>
  );
}

function ConverterDetails({
  sys,
  dp,
  conv,
  result,
  onChange,
}: {
  sys: GradingSystem;
  dp: number;
  conv: Conv;
  result: Reckoning;
  onChange: (patch: Partial<Conv>) => void;
}) {
  return (
    <details className="border-y border-[var(--rule)] bg-[var(--paper-2)] p-4 sm:p-5">
      <summary className="mono cursor-pointer text-[0.78rem] font-semibold uppercase text-[var(--red)]">
        Point converter
      </summary>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_14rem] lg:items-end">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="block">
            <span className="label">Points</span>
            <input
              value={conv.points}
              onChange={(event) => onChange({ points: event.target.value })}
              inputMode="decimal"
              placeholder="0"
              className={"tnum w-full text-center " + field()}
            />
          </label>
          <label className="block">
            <span className="label">Max</span>
            <input
              value={conv.max}
              onChange={(event) => onChange({ max: event.target.value })}
              inputMode="decimal"
              className={"tnum w-full text-center " + field()}
            />
          </label>
          <label className="block">
            <span className="label">Pass at %</span>
            <input
              value={conv.passPct}
              onChange={(event) => onChange({ passPct: event.target.value })}
              disabled={conv.variant === "proportional"}
              inputMode="decimal"
              className={"tnum w-full text-center disabled:opacity-45 " + field()}
            />
          </label>
        </div>

        <div>
          <p className="label">Grade</p>
          <ResultFigure r={result} sys={sys} dp={dp} size="text-4xl" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {(["proportional", "linear"] as const).map((variant) => {
          const active = conv.variant === variant;
          return (
            <button
              key={variant}
              onClick={() => onChange({ variant })}
              className="mono border border-[var(--rule-strong)] px-3 py-2 text-[0.72rem] font-semibold uppercase transition"
              style={{
                background: active ? "var(--red)" : "var(--paper)",
                color: active ? "var(--paper)" : "var(--ink)",
              }}
              type="button"
            >
              {variant === "proportional" ? "Proportional" : "Pass mark"}
            </button>
          );
        })}
      </div>

      <Receipt r={result} dp={dp} label="Show converter calculation" />
    </details>
  );
}
