Added the three requested test files:

- [intents.test.ts](/Users/carson/Projects/pf-nikaalo/src/lib/assistant/__tests__/intents.test.ts)
- [scripted.test.ts](/Users/carson/Projects/pf-nikaalo/src/lib/assistant/__tests__/scripted.test.ts)
- [passbook.test.ts](/Users/carson/Projects/pf-nikaalo/src/lib/__tests__/passbook.test.ts)

`pnpm test` passes: 92 tests, 2 todos. `pnpm typecheck` passes.

Todos document source bugs: Devanagari `नमस्ते` greeting detection, and passbook reconciliation exceeding ±3 rupees due to accumulated per-entry rounding.