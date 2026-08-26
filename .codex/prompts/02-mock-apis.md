# Implement the simulated backend (mock EPFO / UIDAI / NPCI / employer route handlers) and the session store

Read `AGENTS.md`, `src/lib/rules/types.ts`, `src/lib/rules/index.ts`, `src/mock/members.ts`, `src/lib/session.ts`
and `src/i18n/index.ts` first. Do NOT edit any of those, nor anything under `src/lib/rules/`, `src/i18n/`,
`src/components/` or `src/app/(journey)`. Create only the files listed below.

## Files to create

### `src/lib/simulate.ts`
- `export async function sleep(minMs = 400, maxMs = 900)`: deterministic-ish delay (use a simple LCG seeded from
  `Date.now()` is fine here — this is NOT the rules engine).
- `export function simulatedHeaders(provider: string): HeadersInit` → `{ "x-simulated": "true", "x-provider": provider, "cache-control": "no-store" }`.
- `export function simulated<T>(provider: string, body: T, init?: ResponseInit): Response` → JSON response
  `{ simulated: true, provider: \`${provider} (mock)\`, ...body }` with those headers.

### `src/mock/store.ts` (server-only; import `"server-only"`)
State must survive Vercel cold starts, so everything is reconstructable from cookies:
- `export async function loadMember(uan: string): Promise<Member | undefined>` → `getSeedMember(uan)` then apply
  every `SimulatedAction` listed in the `pfn_fixes` cookie (via `applyFix` from the rules engine) in order,
  using `todayISO(demoOffset)` as `asOf`.
- `export async function recordFix(action: SimulatedAction)` → appends to the `pfn_fixes` cookie (dedupe).
- `export type StoredClaim = { id: string; uan: string; forms: ClaimForm[]; submittedAt: ISODate; fastTrack: boolean; form121: boolean; intent: Intent }`.
- `export async function saveClaim(c: StoredClaim)` → JSON in `pfn_claim` cookie (must stay < 1 KB).
- `export async function loadClaim(): Promise<StoredClaim | undefined>`.
- `export async function clearClaim()`.
- `export function claimId(uan: string, submittedAt: ISODate): string` → e.g. `PFN-260826-0001`-style, derived
  deterministically from the inputs (no randomness).
- `export async function buildClaim(stored: StoredClaim): Promise<Claim | undefined>` → loads the member, recomputes
  `serviceSummary`, `selectForms`, `computeAmount`, `computeTds` (with `form121Declared: stored.form121`) and returns
  the full `Claim` object the rules engine needs for `deriveStatus`. For UAN `100000000004` with a prior rejected
  claim, ALSO expose `export function seededPriorClaims(member: Member): Claim[]` that turns each `PriorClaim` into a
  `Claim` (rejected ones get `forcedOutcome: { stage: "REJECTED", code: reasonCode }` and `submittedAt` = the prior
  claim date minus REJECTION_DAY days).
Use `cookies()` from `next/headers` (async). Cookie options from `COOKIE_OPTS` in `src/lib/session.ts`.

### Route handlers — all under `src/app/api/mock/`, all `export const dynamic = "force-dynamic"`, all `await sleep()`
first, all respond through `simulated(provider, body)`. Validate inputs; on bad input return status 400 with
`{ simulated: true, provider, error: "<short code>" }`.
1. `epfo/otp/route.ts` — `POST { uan }`: 400 `invalid_uan` unless 12 digits; 404 `unknown_uan` unless in `MEMBERS`;
   else set cookie `pfn_uan` = uan (COOKIE_OPTS) and return `{ ok: true, sentToLast2: "<last 2 digits of a fake mobile derived from uan>" }`.
   `PUT { otp }`: 400 unless exactly 6 digits; else `{ ok: true }`. Provider `"EPFO OTP"`.
2. `epfo/member/[uan]/route.ts` — `GET`: returns `{ member }` via `loadMember` (404 if unknown). Provider `"EPFO member record"`.
3. `uidai/ekyc/route.ts` — `POST { uan }`: returns `{ aadhaar: member.aadhaar }`. Provider `"UIDAI e-KYC"`.
4. `npci/bank-verify/route.ts` — `POST { uan }`: returns `{ bank: member.bank, nameMatch: nameDiff(member.bank.nameOnAccount, member.aadhaar.name) }`. Provider `"NPCI account validation"`.
5. `employer/doe/route.ts` — `POST { uan }`: returns `{ requested: true, employer: <latest employer name>, etaDays: [3, 15] }`. Provider `"Employer ECR request"`.
6. `epfo/mark-exit/route.ts` — `POST { uan }`: if `asOf >= endOfMonth(lastContributionMonth) + 2 months` → `recordFix("MARK_EXIT")` and return `{ ok: true, doe }`; else 409 `too_early`. Provider `"EPFO Mark Exit"`.
7. `epfo/fix/route.ts` — `POST { uan, action }` for `UPDATE_PROFILE | RESEED_BANK | SEED_PAN | MARK_EXIT`: `recordFix(action)`,
   return `{ ok: true, member: await loadMember(uan) }`. Provider `"EPFO KYC update"`.
8. `epfo/preflight/route.ts` — `POST { uan, intent }`: returns `{ preflight: runPreflight(member, intent, asOf), asOf }`. Provider `"EPFO claim pre-validation"`.
9. `epfo/claims/route.ts` — `POST { uan, intent, form121 }`: re-run `runPreflight`; if `!canSubmit` → 422
   `{ error: "blocked", blockingCodes }`; else build `StoredClaim` (fastTrack = every check status === "pass"),
   `saveClaim`, return `{ claim: <full Claim>, status: deriveStatus(claim, asOf) }`. `GET` → the stored claim + its
   `deriveStatus(claim, asOf)` (404 if none). Provider `"EPFO claim intake"`.
10. `demo/clock/route.ts` — `POST { days }` (integer −365..365; `0` resets): sets `pfn_demo_days` cookie, returns
    `{ today: todayISO(days) }`. Provider `"Demo clock"`.
11. `session/route.ts` — `DELETE`: clears all `pfn_*` cookies except `pfn_lang`. Provider `"Session"`.

`asOf` everywhere = `todayISO(await getDemoOffsetDays())`.

## Done when
`pnpm typecheck` passes (ignore pre-existing errors in files you did not create, but there should be none),
`pnpm test` still passes, and `curl`-style usage is documented in ≤ 15 lines at the top of `src/mock/store.ts`.
Do not install packages. Final message: list the files created and any deviation from this spec.
