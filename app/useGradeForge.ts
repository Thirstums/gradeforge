/* eslint-disable react-hooks/set-state-in-effect */
"use client";

// The ViewModel. The page renders what this hook returns and nothing else:
// state, persistence, and the wiring into the engine all live here, so the
// components only ever see finished values and callbacks.

import { useEffect, useMemo, useState } from "react";
import type { Rounding } from "@/lib/grades";
import type { GradingSystem } from "@/lib/systems";
import { CUSTOM_ID } from "@/lib/systems";
import {
  STORAGE_KEY,
  initialState,
  freshState,
  currentSystem,
  derive,
  blankGrade,
  blankSubject,
  type State,
  type View,
  type Grade,
  type Subject,
  type Conv,
} from "@/lib/model";

export function useGradeForge() {
  const [state, setState] = useState<State>(initialState);
  const [loaded, setLoaded] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
    } catch {
      /* keep the seed if storage is unavailable or corrupt */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage blocked — still works this session */
    }
  }, [state, loaded]);

  const sys = useMemo(() => currentSystem(state), [state]);
  const results = useMemo(() => derive(state, sys), [state, sys]);

  const actions = useMemo(() => {
    const patch = (p: Partial<State>) => setState((s) => ({ ...s, ...p }));
    const mapSubjects = (fn: (subs: Subject[]) => Subject[]) =>
      setState((s) => ({ ...s, subjects: fn(s.subjects) }));
    const mapQuick = (fn: (g: Grade[]) => Grade[]) =>
      setState((s) => ({ ...s, quick: fn(s.quick) }));

    return {
      chooseSystem(next: GradingSystem) {
        setState((s) => {
          const base = { ...s, systemId: next.id, custom: next.id === CUSTOM_ID ? next : null, chosen: true };
          // First choice replaces the seed data; later changes keep the user's grades.
          return s.chosen ? { ...base, rounding: next.rounding } : { ...base, ...freshState(next) };
        });
        setPickerOpen(false);
      },
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),

      setView: (view: View) => patch({ view }),
      setRounding: (rounding: Rounding) => patch({ rounding }),
      setShowWork: (showWork: boolean) => patch({ showWork }),
      setConv: (p: Partial<Conv>) => setState((s) => ({ ...s, conv: { ...s.conv, ...p } })),

      addSubject: () => mapSubjects((subs) => [...subs, blankSubject()]),
      removeSubject: (id: string) => mapSubjects((subs) => subs.filter((x) => x.id !== id)),
      editSubject: (id: string, p: Partial<Subject>) =>
        mapSubjects((subs) => subs.map((x) => (x.id === id ? { ...x, ...p } : x))),
      addGrade: (sid: string) =>
        mapSubjects((subs) => subs.map((s) => (s.id === sid ? { ...s, grades: [...s.grades, blankGrade()] } : s))),
      editGrade: (sid: string, gid: string, p: Partial<Grade>) =>
        mapSubjects((subs) =>
          subs.map((s) =>
            s.id === sid ? { ...s, grades: s.grades.map((g) => (g.id === gid ? { ...g, ...p } : g)) } : s
          )
        ),
      removeGrade: (sid: string, gid: string) =>
        mapSubjects((subs) =>
          subs.map((s) => (s.id === sid ? { ...s, grades: s.grades.filter((g) => g.id !== gid) } : s))
        ),

      addQuick: () => mapQuick((q) => [...q, blankGrade()]),
      editQuick: (id: string, p: Partial<Grade>) =>
        mapQuick((q) => q.map((g) => (g.id === id ? { ...g, ...p } : g))),
      removeQuick: (id: string) => mapQuick((q) => q.filter((g) => g.id !== id)),

      reset: () => {
        setState(initialState);
        setPickerOpen(false);
      },
    };
  }, []);

  return {
    sys,
    dp: sys.decimals,
    view: state.view,
    rounding: state.rounding,
    showWork: state.showWork,
    subjects: state.subjects,
    quick: state.quick,
    conv: state.conv,
    ...results,
    picker: {
      open: pickerOpen || (loaded && !state.chosen),
      mustChoose: loaded && !state.chosen,
    },
    actions,
  };
}

export type ViewModel = ReturnType<typeof useGradeForge>;
export type Actions = ViewModel["actions"];
