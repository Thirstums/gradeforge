// GradeForge — the view-model logic.
//
// Everything the page knows that isn't pixels: the state shape, the seed
// data, and the derivation from raw input strings to finished Reckonings.
// No React in here, so it can be tested the same way as the engine.

import {
  average,
  pointsProportional,
  pointsLinear,
  type Rounding,
  type Direction,
  type Reckoning,
  type GradeItem,
  type Bounds,
} from "./grades";
import {
  SYSTEMS,
  CUSTOM_ID,
  systemById,
  makeCustom,
  exampleValue,
  labelForValue,
  type GradingSystem,
} from "./systems";

export type Grade = { id: string; label: string; value: string; weight: string };
export type Subject = { id: string; name: string; weight: string; grades: Grade[] };
export type View = "subjects" | "quick";
export type Conv = { variant: "proportional" | "linear"; points: string; max: string; passPct: string };

export interface State {
  systemId: string;
  custom: GradingSystem | null;
  chosen: boolean;
  view: View;
  rounding: Rounding;
  showWork: boolean;
  subjects: Subject[];
  quick: Grade[];
  conv: Conv;
}

export const STORAGE_KEY = "gradeforge-v1";

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

export const blankGrade = (): Grade => ({ id: uid(), label: "", value: "", weight: "1" });
export const blankSubject = (): Subject => ({ id: uid(), name: "", weight: "1", grades: [blankGrade()] });

// ---- systems ------------------------------------------------------------------

export function currentSystem(s: State): GradingSystem {
  if (s.systemId === CUSTOM_ID && s.custom) return s.custom;
  return systemById(s.systemId) ?? SYSTEMS[0];
}

function boundsOf(s: GradingSystem): Bounds {
  return { min: s.min, max: s.max, direction: s.direction, pass: s.pass };
}

function entryToNumber(s: GradingSystem, raw: string): number {
  if (s.kind === "scale") {
    const o = s.options?.find((o) => o.label === raw);
    return o ? o.value : NaN;
  }
  return parseFloat(raw);
}

// The custom-scale form as the user types it; null when it doesn't parse.
export interface CustomForm {
  name: string;
  min: string;
  max: string;
  direction: Direction;
  pass: string;
  rounding: Rounding;
}

export function customFromForm(c: CustomForm): GradingSystem | null {
  const min = parseFloat(c.min), max = parseFloat(c.max), pass = parseFloat(c.pass);
  if (!isFinite(min) || !isFinite(max) || min === max) return null;
  return makeCustom({
    name: c.name,
    min: Math.min(min, max),
    max: Math.max(min, max),
    direction: c.direction,
    pass: isFinite(pass) ? pass : undefined,
    rounding: c.rounding,
  });
}

// ---- seed data ------------------------------------------------------------------

function exampleEntry(s: GradingSystem, frac: number): string {
  if (s.kind === "scale") return labelForValue(s, exampleValue(s, frac)) ?? "";
  return String(exampleValue(s, frac));
}

function seedSubjects(s: GradingSystem): Subject[] {
  const g = (label: string, frac: number): Grade => ({ id: uid(), label, value: exampleEntry(s, frac), weight: "1" });
  return [
    { id: uid(), name: "Subject A", weight: "1", grades: [g("Test 1", 0.85), g("Test 2", 0.7)] },
    { id: uid(), name: "Subject B", weight: "1", grades: [g("Test 1", 0.6)] },
  ];
}

function seedQuick(s: GradingSystem): Grade[] {
  return [0.85, 0.7, 0.6].map((f, i) => ({ id: uid(), label: `Grade ${i + 1}`, value: exampleEntry(s, f), weight: "1" }));
}

// What changes when the user picks a system for the first time.
export function freshState(s: GradingSystem): Pick<State, "rounding" | "subjects" | "quick" | "conv"> {
  return {
    rounding: s.rounding,
    subjects: seedSubjects(s),
    quick: seedQuick(s),
    conv: { variant: "proportional", points: "", max: String(s.kind === "numeric" ? Math.round(s.max) : 30), passPct: "60" },
  };
}

const initialSystem = SYSTEMS[0];
export const initialState: State = {
  systemId: initialSystem.id,
  custom: null,
  chosen: false,
  view: "subjects",
  rounding: initialSystem.rounding,
  showWork: true,
  subjects: seedSubjects(initialSystem),
  quick: seedQuick(initialSystem),
  conv: { variant: "proportional", points: "", max: "6", passPct: "60" },
};

// ---- derivation ------------------------------------------------------------------

function itemsFrom(sys: GradingSystem, rows: Grade[]): GradeItem[] {
  return rows
    .map((g) => ({
      value: entryToNumber(sys, g.value),
      weight: g.weight.trim() === "" ? 1 : parseFloat(g.weight),
      display: sys.kind === "scale" ? g.value || undefined : undefined,
    }))
    .filter((i) => isFinite(i.value) && isFinite(i.weight) && i.weight > 0);
}

export interface Results {
  subjectResults: Reckoning[];
  overall: Reckoning;
  quickResult: Reckoning;
  convResult: Reckoning;
}

export function derive(state: State, sys: GradingSystem): Results {
  const b = boundsOf(sys);
  const { rounding } = state;

  const subjectResults = state.subjects.map((sub) => average(itemsFrom(sys, sub.grades), rounding, b));

  const overallItems: GradeItem[] = state.subjects
    .map((sub, i) => ({
      value: subjectResults[i].value,
      weight: sub.weight.trim() === "" ? 1 : parseFloat(sub.weight),
      display: sub.name.trim() || undefined,
    }))
    .filter((i) => isFinite(i.value) && isFinite(i.weight) && i.weight > 0);
  const overall = average(overallItems, rounding, b);

  const quickResult = average(itemsFrom(sys, state.quick), rounding, b);

  const p = parseFloat(state.conv.points), m = parseFloat(state.conv.max), x = parseFloat(state.conv.passPct);
  const convResult =
    state.conv.variant === "proportional"
      ? pointsProportional(p, m, rounding, b)
      : pointsLinear(p, m, x, rounding, b);

  return { subjectResults, overall, quickResult, convResult };
}
