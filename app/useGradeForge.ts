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
  currentSystem,
  derive,
  blankGrade,
  blankSubject,
  type State,
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
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<State>;
        setState({
          ...initialState,
          ...parsed,
          conv: { ...initialState.conv, ...parsed.conv },
        });
      }
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

    return {
      chooseSystem(next: GradingSystem) {
        setState((s) => {
          const nextMax = next.kind === "numeric" ? Math.round(next.max) : 30;
          return {
            ...s,
            systemId: next.id,
            custom: next.id === CUSTOM_ID ? next : null,
            rounding: next.rounding,
            conv: { ...s.conv, max: String(nextMax) },
          };
        });
        setPickerOpen(false);
      },
      openPicker: () => setPickerOpen(true),
      closePicker: () => setPickerOpen(false),

      setRounding: (rounding: Rounding) => patch({ rounding }),
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

      reset: () => {
        setState(initialState);
        setPickerOpen(false);
      },
    };
  }, []);

  return {
    sys,
    dp: sys.decimals,
    rounding: state.rounding,
    subjects: state.subjects,
    conv: state.conv,
    ...results,
    picker: {
      open: pickerOpen,
    },
    actions,
  };
}

export type ViewModel = ReturnType<typeof useGradeForge>;
export type Actions = ViewModel["actions"];
