Implemented all requested simulated backend routes, cookie-backed store, and simulation helpers.

Created:

- `src/lib/simulate.ts`
- `src/mock/store.ts`
- `src/app/api/mock/demo/clock/route.ts`
- `src/app/api/mock/employer/doe/route.ts`
- `src/app/api/mock/epfo/claims/route.ts`
- `src/app/api/mock/epfo/fix/route.ts`
- `src/app/api/mock/epfo/mark-exit/route.ts`
- `src/app/api/mock/epfo/member/[uan]/route.ts`
- `src/app/api/mock/epfo/otp/route.ts`
- `src/app/api/mock/epfo/preflight/route.ts`
- `src/app/api/mock/npci/bank-verify/route.ts`
- `src/app/api/mock/session/route.ts`
- `src/app/api/mock/uidai/ekyc/route.ts`

Validation: `pnpm test` passes (52 tests). `pnpm typecheck` is blocked only by the pre-existing missing `src/app/(journey)/check/AgentRun` module; no errors were reported from the created files.

Deviation: none in implementation scope.