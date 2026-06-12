# GradeForge

GradeForge is a local-only grade calculator. Pick a grading scale, enter
subjects and grades, and get the weighted average. Calculation details are
available when you want to check the math, but they stay out of the way by
default.

## Run Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## What It Does

- Saves state in the browser only.
- Supports preset grading systems in `lib/systems.ts`.
- Supports custom numeric scales from the scale picker.
- Handles count-up and count-down systems correctly.
- Averages letter/GPA-style scales by their numeric values.
- Includes an optional points-to-grade converter.

## Project Shape

- `lib/grades.ts` is the tested math engine.
- `lib/systems.ts` lists the grading systems.
- `lib/model.ts` turns app state into computed results.
- `app/useGradeForge.ts` owns browser state and persistence.
- `app/components/Calculator.tsx` renders the main workflow.
- `app/components/Picker.tsx` renders the scale picker.

## Scripts

```bash
npm run lint
npm run test
npm run build
```

The app has no backend, accounts, telemetry, or upload path.
