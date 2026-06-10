"use client";

// The page's job is to render the ViewModel, not to think. State,
// persistence, and the math live in useGradeForge (and lib/model behind
// it); every component here receives finished values and callbacks.

import { useState } from "react";
import { useGradeForge } from "./useGradeForge";
import { Picker } from "./components/Picker";
import { Controls } from "./components/Controls";
import { SubjectsView } from "./components/SubjectsView";
import { QuickView } from "./components/QuickView";
import { Converter } from "./components/Converter";

export default function Home() {
  const vm = useGradeForge();
  const { sys, actions } = vm;
  const [resetOpen, setResetOpen] = useState(false);
  const subjectGradeCount = vm.subjects.reduce(
    (sum, subject) => sum + subject.grades.length,
    0
  );

  return (
    <main className="min-h-screen bg-[var(--paper)] text-[var(--ink)]">
      <Picker
        open={vm.picker.open}
        mustChoose={vm.picker.mustChoose}
        onChoose={actions.chooseSystem}
        onClose={actions.closePicker}
      />

      <header className="sticky top-0 z-40 border-b border-[var(--rule)] bg-[rgba(250,246,238,0.92)] backdrop-blur">
        <div className="mx-auto flex max-w-[1080px] items-center justify-between gap-3 px-4 py-3 sm:px-[1.6rem]">
          <a
            href="https://lambdaf.org/"
            className="slab text-[1.05rem] font-bold tracking-[0.06em]"
          >
            LAMBDAFORGE
          </a>

          <nav
            aria-label="Primary"
            className="mono flex items-center gap-2 text-[0.66rem] uppercase tracking-[0.08em] text-[var(--muted)] sm:gap-6 sm:text-[0.72rem]"
          >
            <a
              className="whitespace-nowrap transition hover:text-[var(--red)]"
              href="#calculator"
            >
              {sys.short}
            </a>
            <a
              className="whitespace-nowrap border border-[var(--ink)] px-2.5 py-1.5 text-[var(--ink)] transition hover:bg-[var(--ink)] hover:text-[var(--paper)] sm:px-3"
              href="#https://github.com/lambdaf-org/GradeForge"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      </header>

      <section
        id="calculator"
        className="mx-auto w-full max-w-[1080px] px-[1.6rem] py-6 sm:py-8"
      >
        <div className="mb-5 grid gap-4 border-b-2 border-[var(--ink)] pb-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <p className="kicker">GradeForge</p>
            <h1 className="mt-2 text-[clamp(2rem,5vw,3.4rem)] leading-[1] tracking-[-0.02em]">
              Grade Calculator
            </h1>
            <p className="mt-3 max-w-[62ch] text-[1rem] leading-[1.45] text-[var(--muted)]">
              A grade calculator that shows its work. Every average prints the
              formula, the numbers, and the rounding rule that produced it.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            <span className="mono border border-[var(--rule)] px-1.5 py-0.5 text-[0.68rem] leading-tight text-[var(--meta)]">
              {sys.name}
            </span>
            <span className="mono border border-[var(--rule)] px-1.5 py-0.5 text-[0.68rem] leading-tight text-[var(--meta)]">
              {vm.view === "quick" ? "QUICK" : "SUBJECTS"}
            </span>
          </div>
        </div>

        <Controls
          sys={sys}
          view={vm.view}
          rounding={vm.rounding}
          showWork={vm.showWork}
          onChangeSystem={actions.openPicker}
          onView={actions.setView}
          onRounding={actions.setRounding}
          onShowWork={actions.setShowWork}
        />

        {vm.view === "subjects" ? (
          <SubjectsView
            sys={sys}
            dp={vm.dp}
            showWork={vm.showWork}
            subjects={vm.subjects}
            results={vm.subjectResults}
            overall={vm.overall}
            actions={actions}
          />
        ) : (
          <QuickView
            sys={sys}
            dp={vm.dp}
            showWork={vm.showWork}
            grades={vm.quick}
            result={vm.quickResult}
            actions={actions}
          />
        )}

        <div id="converter">
          <Converter
            sys={sys}
            dp={vm.dp}
            showWork={vm.showWork}
            conv={vm.conv}
            result={vm.convResult}
            onChange={actions.setConv}
          />
        </div>

        <footer className="mt-12 border-t border-[var(--rule)] pt-5 text-[0.8rem] leading-relaxed text-[var(--muted)]">
          <p>
            Everything stays in your browser&apos;s local storage — no accounts,
            no upload. The current scale is{" "}
            <span className="text-[var(--ink)]">{sys.name}</span> ({sys.note});
            rounding is set above and applied half-up. Check your school&apos;s
            Reglement for the exact rule.
          </p>
          <p className="mt-2">
            A{" "}
            <a
              href="https://lambdaf.org/"
              className="underline underline-offset-2 text-[var(--red)]"
            >
              Lambdaforge
            </a>{" "}
            tool · open source
          </p>
          <button
            onClick={() => setResetOpen(true)}
            className="mono mt-3 text-[0.68rem] uppercase tracking-[0.14em] text-[var(--muted)] underline underline-offset-2 transition hover:text-[var(--red)]"
            type="button"
          >
            Reset everything
          </button>
        </footer>
      </section>

      <ResetDialog
        open={resetOpen}
        quickGradeCount={vm.quick.length}
        subjectCount={vm.subjects.length}
        subjectGradeCount={subjectGradeCount}
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
  quickGradeCount,
  subjectCount,
  subjectGradeCount,
  onCancel,
  onReset,
}: {
  open: boolean;
  quickGradeCount: number;
  subjectCount: number;
  subjectGradeCount: number;
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
      <div className="w-full max-w-[520px] border-2 border-[var(--ink)] bg-[var(--paper)] shadow-[8px_8px_0_var(--ink)]">
        <div className="px-5 pb-4 pt-5">
          <p className="kicker">Reset</p>
          <h2
            id="reset-heading"
            className="mt-2 text-[clamp(1.8rem,5vw,2.35rem)] leading-none"
          >
            Clear all grades?
          </h2>
        </div>

        <div className="border-y border-[var(--rule)] px-5 py-5">
          <p className="max-w-[42ch] leading-snug text-[var(--ink)]">
            This removes {subjectCount} subject
            {subjectCount === 1 ? "" : "s"}, {subjectGradeCount} subject grade
            {subjectGradeCount === 1 ? "" : "s"}, {quickGradeCount} quick grade
            {quickGradeCount === 1 ? "" : "s"}, converter inputs, and the saved
            grading system from this browser.
          </p>
          <p className="mono mt-5 border-l-2 border-[var(--red)] pl-3 text-[0.68rem] uppercase tracking-[0.18em] text-[var(--ink-2)]">
            The action cannot be undone.
          </p>
        </div>

        <div className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            autoFocus
            className="mono border border-[var(--rule-strong)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.12em] text-[var(--ink)] transition hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
            onClick={onCancel}
            type="button"
          >
            Keep grades
          </button>
          <button
            className="mono border border-[var(--red)] bg-[var(--red)] px-4 py-3 text-[0.74rem] uppercase tracking-[0.12em] text-[var(--paper)] transition hover:border-[var(--red-deep)] hover:bg-[var(--red-deep)]"
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
