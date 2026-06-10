"use client";

// The page's job is to render the ViewModel, not to think. State,
// persistence, and the math live in useGradeForge (and lib/model behind
// it); every component here receives finished values and callbacks.

import { useGradeForge } from "./useGradeForge";
import { Picker } from "./components/Picker";
import { Controls } from "./components/Controls";
import { SubjectsView } from "./components/SubjectsView";
import { QuickView } from "./components/QuickView";
import { Converter } from "./components/Converter";

export default function Home() {
  const vm = useGradeForge();
  const { sys, actions } = vm;

  return (
    <div className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-14">
      <Picker
        open={vm.picker.open}
        mustChoose={vm.picker.mustChoose}
        onChoose={actions.chooseSystem}
        onClose={actions.closePicker}
      />

      <header className="mb-9">
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-xs" style={{ color: "var(--forge)" }}>λ</span>
          <h1 className="font-display text-2xl font-bold tracking-tight">GradeForge</h1>
        </div>
        <p className="mt-1 text-[0.95rem]" style={{ color: "var(--muted)" }}>
          A grade calculator that shows its work. Every average prints the formula, the numbers, and the rounding rule that produced it.
        </p>
      </header>

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

      <Converter
        sys={sys}
        dp={vm.dp}
        showWork={vm.showWork}
        conv={vm.conv}
        result={vm.convResult}
        onChange={actions.setConv}
      />

      <footer className="mt-12 border-t pt-5 text-[0.8rem] leading-relaxed" style={{ borderColor: "var(--line)", color: "var(--muted)" }}>
        <p>
          Everything stays in your browser&apos;s local storage — no accounts, no upload. The current scale is{" "}
          <span style={{ color: "var(--ink)" }}>{sys.name}</span> ({sys.note}); rounding is set above and applied half-up. Check your school&apos;s Reglement for the exact rule.
        </p>
        <p className="mt-2">
          A <a href="https://lambdaf.org/" className="underline underline-offset-2" style={{ color: "var(--forge)" }}>Lambdaforge</a> tool · open source
        </p>
        <button
          onClick={() => {
            if (confirm("Reset everything, including the chosen system?")) actions.reset();
          }}
          className="mt-3 underline underline-offset-2"
          style={{ color: "var(--muted)" }}
        >
          Reset everything
        </button>
      </footer>
    </div>
  );
}
