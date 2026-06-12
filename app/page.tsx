"use client";

import { useState } from "react";
import { Calculator } from "./components/Calculator";
import { Picker } from "./components/Picker";
import { useGradeForge } from "./useGradeForge";

export default function Home() {
  const vm = useGradeForge();
  const { actions, sys } = vm;
  const [resetOpen, setResetOpen] = useState(false);
  const gradeCount = vm.subjects.reduce(
    (sum, subject) => sum + subject.grades.length,
    0
  );

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Picker
        open={vm.picker.open}
        onChoose={actions.chooseSystem}
        onClose={actions.closePicker}
      />

      <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[rgba(250,246,238,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="https://lambdaf.org/" className="slab text-[1.05rem] font-bold uppercase">
            Lambdaforge
          </a>
          <nav className="mono flex items-center gap-3 text-[0.72rem] uppercase text-[var(--muted)]">
            <button
              onClick={actions.openPicker}
              className="font-semibold transition hover:text-[var(--red)]"
              type="button"
            >
              {sys.short}
            </button>
            <a
              className="border border-[var(--ink)] px-3 py-1.5 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)]"
              href="https://github.com/lambdaf-org/GradeForge"
            >
              GitHub
            </a>
          </nav>
        </div>
      </header>

      <section className="mx-auto w-full max-w-[1080px] px-4 py-7 sm:px-6 sm:py-10">
        <div className="mb-6 border-b-2 border-[var(--ink)] pb-5">
          <p className="kicker">GradeForge</p>
          <h1 className="mt-2 text-[clamp(2.3rem,5vw,4rem)] leading-none">
            Grade calculator
          </h1>
          <p className="mt-3 max-w-[52ch] text-lg leading-relaxed text-[var(--muted)]">
            Enter subjects and grades. The result updates immediately, and the
            math is available when you need it.
          </p>
        </div>

        <Calculator
          sys={sys}
          dp={vm.dp}
          rounding={vm.rounding}
          subjects={vm.subjects}
          subjectResults={vm.subjectResults}
          overall={vm.overall}
          conv={vm.conv}
          convResult={vm.convResult}
          actions={actions}
        />

        <footer className="mt-10 border-t border-[var(--rule)] pt-5 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Data stays in this browser. Current scale:{" "}
            <span className="font-semibold text-[var(--ink)]">{sys.name}</span>
            {sys.note ? ` (${sys.note})` : ""}.
          </p>
          <button
            onClick={() => setResetOpen(true)}
            className="mono mt-3 text-[0.72rem] font-semibold uppercase underline underline-offset-2 transition hover:text-[var(--red)]"
            type="button"
          >
            Reset everything
          </button>
        </footer>
      </section>

      <ResetDialog
        open={resetOpen}
        subjectCount={vm.subjects.length}
        gradeCount={gradeCount}
        onCancel={() => setResetOpen(false)}
        onReset={() => {
          actions.reset();
          setResetOpen(false);
        }}
      />
    </main>
  );
}

function ResetDialog({
  open,
  subjectCount,
  gradeCount,
  onCancel,
  onReset,
}: {
  open: boolean;
  subjectCount: number;
  gradeCount: number;
  onCancel: () => void;
  onReset: () => void;
}) {
  if (!open) return null;

  return (
    <div
      aria-labelledby="reset-heading"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(28,28,28,0.35)] px-4 py-6"
      onKeyDown={(event) => {
        if (event.key === "Escape") onCancel();
      }}
      role="dialog"
    >
      <div className="w-full max-w-[460px] border-2 border-[var(--ink)] bg-[var(--paper)] p-5 shadow-[8px_8px_0_var(--ink)]">
        <h2 id="reset-heading" className="text-2xl leading-tight">
          Clear all grades?
        </h2>
        <p className="mt-3 text-[var(--muted)]">
          This removes {subjectCount} subject{subjectCount === 1 ? "" : "s"} and{" "}
          {gradeCount} grade{gradeCount === 1 ? "" : "s"} from this browser.
        </p>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            autoFocus
            className="mono border border-[var(--rule-strong)] px-4 py-2 text-[0.74rem] font-semibold uppercase transition hover:border-[var(--ink)]"
            onClick={onCancel}
            type="button"
          >
            Keep grades
          </button>
          <button
            className="mono border border-[var(--red)] bg-[var(--red)] px-4 py-2 text-[0.74rem] font-semibold uppercase text-white transition hover:bg-[var(--red-deep)]"
            onClick={onReset}
            type="button"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
