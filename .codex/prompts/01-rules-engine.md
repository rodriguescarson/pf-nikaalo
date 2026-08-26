# Implement the PF Nikaalo rules engine so that `pnpm test` passes

You are working in a Next.js 16 / TypeScript (strict) repo. Read `AGENTS.md` first.

## Task
Implement `src/lib/rules/` so that every test in `src/lib/rules/__tests__/*.test.ts` passes. The contract is
fixed in `src/lib/rules/types.ts` and the constants in `src/lib/rules/constants.ts` — do NOT edit those two
files or any test file or `src/mock/members.ts`. Create these files:

- `src/lib/rules/normalize.ts` — `normalizeName`, `nameDiff`, `serviceSummary`, plus date helpers
  (`addMonths`, `addDays`, `monthsBetween`, `endOfMonth`) — pure string arithmetic on ISO dates, no `Date.now()`.
- `src/lib/rules/preflight.ts` — `runPreflight(member, intent, asOf)` and `applyFix(member, action, asOf)`.
- `src/lib/rules/formSelector.ts` — `selectForms(member, intent, svc, asOf)`.
- `src/lib/rules/amount.ts` — `computeAmount(member, sel, svc)`.
- `src/lib/rules/tds.ts` — `computeTds(input)`.
- `src/lib/rules/rejection.ts` — `explainRejection(code, member)` and a shared `fixFor(code|action, member, asOf)` table.
- `src/lib/rules/status.ts` — `deriveStatus(claim, now)`.
- `src/lib/rules/index.ts` — re-export everything (`export * from "./types"` too).

All functions are PURE and never mutate their inputs (use `structuredClone`).

## Definitions (must match the tests)
- `normalizeName`: lowercase, remove dots, collapse whitespace, trim.
- `nameDiff(a,b)`: `exact` if normalised equal; `minor` if one token list is a subset of the other, OR every
  token of the shorter name matches either a full token or the first letter of a token in the longer name
  (initials, e.g. "S. Pillai" ~ "Suresh Pillai"); otherwise `major`.
- `serviceSummary`: `totalMonths` = sum over employments of contribution months counted INCLUSIVELY from the
  month of `doj` to the month of `doe` (or `lastContributionMonth` when `doe` is missing).
  `continuousYears = round(totalMonths/12, 2)`. `hasTransfers = employments.length > 1`.
  `lastWage` = `wageBasicDA` of the employment with the latest `doj`.
- Check order is fixed: UAN_ACTIVE, AADHAAR_SEEDED, NAME_MATCH, DOB_MATCH, DOE_PRESENT, TWO_MONTH_WAIT,
  BANK_KYC, BANK_NAME_MATCH, PAN_SEEDED, NO_DUPLICATE_CLAIM, SERVICE_OVERLAP, EPS_ELIGIBLE, E_NOMINATION.
- Check semantics:
  - NAME_MATCH compares EPFO `member.name` vs `aadhaar.name`: exact→pass; minor or major→fail (blocking,
    NAME_MISMATCH). Fix: UPDATE_PROFILE by member (selfServe) when `uanIssuedOn >= SELF_SERVICE_UAN_SINCE`,
    else actor employer (joint declaration), selfServe=false. Evidence: `{ "EPFO record": name, "Aadhaar": aadhaar.name }`.
  - DOB_MATCH: same fix logic as NAME_MATCH with code DOB_MISMATCH.
  - DOE_PRESENT: latest employment (by doj) must have `doe`. Fail (blocking, DOE_NOT_AVAILABLE). Fix:
    MARK_EXIT by member (selfServe) if `asOf >= endOfMonth(lastContributionMonth) + WAIT_MONTHS_FINAL months`,
    else actor employer, selfServe=false, etaDays [3,15].
  - TWO_MONTH_WAIT: exit date = latest `doe` (or endOfMonth(lastContributionMonth) if missing). Required wait =
    WAIT_MONTHS_ADVANCE for `advance_unemployment`, else WAIT_MONTHS_FINAL. Pass if `asOf >= exit + wait months`.
    Fail is blocking (code WRONG_FORM) with fix actor member, selfServe=false, etaDays = days remaining (min=max).
  - BANK_KYC: `verified`→pass. `pending_employer`→fail (BANK_KYC_NOT_VERIFIED, actor employer, selfServe false).
    `unverified`/`npci_failed`→fail (BANK_KYC_NOT_VERIFIED, fix RESEED_BANK by member, selfServe true, etaDays [1,3]).
  - BANK_NAME_MATCH compares `bank.nameOnAccount` vs `aadhaar.name`: exact→pass; minor→warn (non-blocking,
    code BANK_NAME_DIFFERS, fix RESEED_BANK); major→fail blocking (BANK_NAME_DIFFERS, fix RESEED_BANK).
  - PAN_SEEDED: seeded&&verified→pass; else warn (non-blocking, PAN_NOT_VERIFIED, fix SEED_PAN selfServe, etaDays [0,1]).
  - NO_DUPLICATE_CLAIM: any prior claim with status `pending` → fail (PENDING_WITH_EMPLOYER, actor epfo,
    selfServe false). Prior `settled` FORM_19 while intent is full_withdrawal/both → fail (CLAIM_ALREADY_SETTLED,
    actor epfo). Rejected prior claims do not block.
  - SERVICE_OVERLAP: two employments whose [doj, doe-or-lastContributionMonth] ranges overlap → fail
    (SERVICE_OVERLAP, actor employer, selfServe false, etaDays [7,30]).
  - EPS_ELIGIBLE: only meaningful for intents that include pension (`pension_withdrawal`, `both`); pass
    otherwise. totalMonths < EPS_MIN_MONTHS → warn (EPS_NOT_ELIGIBLE); totalMonths >= 120 → warn (scheme
    certificate instead of withdrawal benefit, no reasonCode needed); else pass. Never blocking.
  - E_NOMINATION: false → warn (non-blocking, actor member, selfServe true, etaDays [0,0]); true → pass.
  - UAN_ACTIVE / AADHAAR_SEEDED: fail blocking (codes PENDING_WITH_EMPLOYER / NAME_MISMATCH respectively is
    wrong — use `reasonCode: undefined` for UAN_ACTIVE and `PAN_NOT_VERIFIED`-style is also wrong; simply
    omit reasonCode for these two) with actor epfo / member.
  - `canSubmit` = no blocking fail. `rejectionRisk`: high if any blocking fail; medium if any warn; else low.
    `blockingCodes` = reasonCodes of blocking fails in check order (dedupe). `warnings` = ids with status warn.
  - `messageKey` = `check.<ID>.<status>`.
- `applyFix`: UPDATE_PROFILE → member.name = aadhaar.name, member.dob = aadhaar.dob. MARK_EXIT → set `doe` on the
  latest employment to `endOfMonth(lastContributionMonth)`. RESEED_BANK → kycStatus `verified`, nameOnAccount =
  aadhaar.name. SEED_PAN → pan `{seeded:true, verified:true, name: aadhaar.name}`.
- `selectForms`: completed years = totalMonths/12. `full_withdrawal` → [FORM_19]; `both` → [FORM_19, FORM_10C] when
  totalMonths < 120, else [FORM_19, SCHEME_CERTIFICATE] with FORM_10C in notAllowed (reasonKey
  `forms.notAllowed.tenYears`); `pension_withdrawal` → [FORM_10C] or [SCHEME_CERTIFICATE] by the same rule;
  `advance_unemployment` → [FORM_31]. If intent is full_withdrawal/both/pension_withdrawal and the
  TWO_MONTH_WAIT rule would fail at `asOf`, return [FORM_31] with the intended forms in notAllowed
  (reasonKey `forms.notAllowed.wait`). `primary` = first form. `rationaleKey` = `forms.rationale.<primary>`.
- `computeAmount`: pfGross = employeeShare + employerShare + interest. If FORM_10C selected:
  epsWithdrawalBenefit = round(EPS_TABLE_D[min(9, floor(totalMonths/12))] × min(lastWage, EPS_WAGE_CEILING)).
  If FORM_31: advanceCap = round(ADVANCE_UNEMPLOYMENT_PCT × pfGross) and total = advanceCap; else
  total = pfGross + (epsWithdrawalBenefit ?? 0).
- `computeTds`: applicable iff continuousYears < TDS_EXEMPT_YEARS && pfGross > TDS_THRESHOLD && !exemptReason
  && !form121Declared. rate = panVerified ? TDS_RATE_PAN : TDS_RATE_NO_PAN (0 when not applicable).
  amount = round(rate × pfGross); net = pfGross − amount. form121Eligible = continuousYears < TDS_EXEMPT_YEARS &&
  pfGross > TDS_THRESHOLD && !exemptReason (independent of the declaration). reasonKey one of
  `tds.exempt.fiveYears`, `tds.exempt.threshold`, `tds.exempt.reason`, `tds.exempt.form121`, `tds.under5yrs.pan`,
  `tds.under5yrs.noPan`.
- `deriveStatus(claim, now)`: schedule = fastTrack ? FAST_TRACK_SCHEDULE : STANDARD_SCHEDULE; events for the
  five stages with `at = submittedAt + days`; `done = at <= now`; `current` = last done event; `expectedBy` on
  the current event = `at` of the next not-done event. `current` stage id = that event. If `forcedOutcome` and
  `now >= submittedAt + REJECTION_DAY` → events = the stages with day < REJECTION_DAY (done) plus a REJECTED
  event at day REJECTION_DAY (done, current); `rejection = explainRejection(code, …)` (member-independent
  fields are fine — use `fixFor(code)` with a null member meaning selfServe rules default to true).
  `expectedCreditDate` = SETTLED date + CREDIT_LAG_DAYS[0] only when SETTLED is done.
  actorKey = `status.<STAGE>.actor`, nextKey = `status.<STAGE>.next`.
- `explainRejection(code, member)`: plainKey `rejection.<CODE>.plain`; fix from the shared table:
  NAME_MISMATCH/DOB_MISMATCH → UPDATE_PROFILE (selfServe by UAN age rule, actor member/employer);
  DOE_NOT_AVAILABLE → MARK_EXIT (member, selfServe true, [0,1]); BANK_KYC_NOT_VERIFIED, BANK_NAME_DIFFERS,
  UNCLEAR_CHEQUE, PAYMENT_RETURNED → RESEED_BANK (member, selfServe true, [1,3]); PAN_NOT_VERIFIED → SEED_PAN;
  SERVICE_OVERLAP, PENDING_WITH_EMPLOYER → employer, selfServe false, [7,30]; CLAIM_ALREADY_SETTLED → epfo,
  selfServe false, [0,0], refileAllowed=false; WRONG_FORM → member selfServe true [0,0]; EPS_NOT_ELIGIBLE →
  epfo selfServe false [0,0]; SIGNATURE_DIFFERS → member selfServe true [1,3]. stepsKey = `fix.<SIMULATED_ACTION
  or CODE>.steps` (use the action name when there is one, else the code). refileAllowed=true except
  CLAIM_ALREADY_SETTLED.

## Done when
`pnpm test` is green and `pnpm typecheck` passes for the rules files. Do not run `pnpm install`. Do not touch
files outside `src/lib/rules/` (except reading). Summarise what you implemented in ≤ 10 lines as your final message.
