Implemented the complete pure rules engine under `src/lib/rules/`.

- Added normalization, dates, service summaries, preflight/fixes, forms, amounts, TDS, rejection mapping, status, and exports.
- `pnpm test` passes: 52/52 tests.
- `git diff --check` passes.
- `pnpm typecheck` is blocked outside scope: missing `src/i18n/en.json` and `src/i18n/hi.json` imports.