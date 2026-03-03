# Repository Guidelines

## Project Structure & Module Organization
This project is a Vite + React + TypeScript life-plan simulator.

- `src/components/`: UI modules (`dashboard/`, `editor/`, `charts/`, `table/`)
- `src/logic/`: simulation engine (`engine.ts`)
- `src/store/`: Zustand state and seed data (`initialData.ts`, `index.ts`)
- `src/rules/`: policy rule definitions and adapters (tax, pension, social insurance, investment)
- `src/lib/`: shared utilities and persistence adapters
- `src/types/`: domain and simulation type definitions
- `public/`: static assets served as-is
- `skills/`: local agent skill docs/templates (not app runtime)

## Build, Test, and Development Commands
- `npm install`: install dependencies
- `npm run dev`: start local dev server
- `npm run build`: type-check (`tsc -b`) and production build (`vite build`)
- `npm run preview`: preview built output locally
- `npm run lint`: run ESLint

Example:
```bash
npm run lint && npm run build
```

## Coding Style & Naming Conventions
- TypeScript strict mode is enabled; keep types explicit on domain boundaries.
- Use 4-space indentation and keep code ASCII unless file already requires Unicode.
- React components: `PascalCase` filenames and exports (e.g., `SummaryCards.tsx`).
- Utilities/hooks: `camelCase` (e.g., `withPolicyDefaults`).
- Prefer small pure functions in `src/logic`/`src/lib` over large inline blocks.
- Keep rule data separated from UI concerns.

## Testing Guidelines
There is currently no dedicated test framework configured. Minimum validation before PR:
- `npm run lint`
- `npm run build`
- manual smoke test of:
  - Data editing/import/export in `DataEditor`
  - Simulation output changes in charts/table
  - Policy toggle behavior (`settings.policy`)

If adding tests, place them near source as `*.test.ts` / `*.test.tsx` and prefer deterministic engine tests first.

## Commit & Pull Request Guidelines
Recent history uses Conventional Commit style, especially `feat:`. Follow:
- `feat: ...`, `fix: ...`, `refactor: ...`, `docs: ...`

PRs should include:
- concise summary and scope
- rationale for simulation/rule changes
- screenshots or before/after table values for UI/logic-impacting changes
- linked issue (if available)
- verification steps run locally

## Security & Configuration Tips
- Do not commit secrets; use `.env` files locally.
- Supabase and user settings flows are in `src/lib/`; verify auth/sync behavior when touching them.
- Rule updates should include effective dates and official source URLs in `src/rules/` or skill references.
