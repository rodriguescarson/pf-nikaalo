# AGENTS.md — conventions for every coding agent in this repo (Codex, Claude Code)

PF Nikaalo is an INDEPENDENT hackathon prototype (Build What Moves India, Aug 2026). It is not EPFO
or the Government of India. All data is synthetic. Never call a live government system.

## Stack
Next.js 16 App Router · TypeScript strict · Tailwind v4 · React 19 · pnpm · vitest (pure functions only).
No UI library. No i18n library (see `src/i18n`). System font stack. Server Components by default.

## Rules
- `src/lib/rules/**` is PURE: no I/O, no Date.now() (take `asOf`/`now` as ISO string args), no randomness.
  Everything the UI shows about eligibility, forms, amounts, TDS, status and rejection comes from here.
- Every user-facing string goes through `t()` with a key in BOTH `src/i18n/en.json` and `src/i18n/hi.json`.
  `pnpm i18n:check` fails the build on missing keys.
- Mock APIs live under `src/app/api/mock/**`, always `await sleep()` 400–900 ms, always return
  `{ simulated: true, provider: "<name> (mock)", ... }` and header `x-simulated: true`.
- Money is integer rupees. Dates are ISO `YYYY-MM-DD` strings.
- Do not install packages (sandbox has no network); ask by leaving a `TODO(deps):` comment.
- Run `pnpm test` before finishing any change to `src/lib/rules`. Run `pnpm typecheck` for TS changes.
- Never add government logos/emblems or copy that implies official status.
- Keep the "Independent prototype" banner on every page.

## Commands
pnpm dev · pnpm test · pnpm typecheck · pnpm i18n:check · pnpm build
