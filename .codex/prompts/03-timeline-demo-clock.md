# Build the claim-status Timeline and DemoClock components from the StatusView contract
PATHS: src/components/Timeline.tsx src/components/DemoClock.tsx src/components/SmsPreview.tsx

Read `AGENTS.md`, `src/lib/rules/types.ts` (StatusView, StageEvent, RejectionExplanation), `src/i18n/en.json`
(keys under `status.*`, `common.*`), `src/i18n/useT.tsx`, `src/i18n/index.ts` (`formatDate`, `formatINR`),
`src/components/Icon.tsx`, `src/app/globals.css` (classes `.sheet`, `.ledger`, `.ledger-row`, `.t-label`, `.t-num`,
`.mark-tick`, `.mark-x`, `.write-in`, colours `ink`, `ink-2`, `ink-3`, `cloth`, `tick`, `pencil`, `ochre`, `rule`) and
`src/app/(journey)/check/AgentRun.tsx` for the visual vocabulary (ledger rows: left mark column 3.25rem, red margin
rule, hairline rows, tabular numerals). Do NOT edit any existing file. Create exactly the three files in PATHS.

## `Timeline.tsx` (client component)
`export function Timeline({ status, claimId, amount, last4 }: { status: StatusView; claimId: string; amount: number; last4: string })`
- Renders `status.events` as a vertical transit line inside a `.sheet.ledger`: one `.ledger-row` per event. The
  left column holds the station marker on a continuous vertical line (draw the line with an absolutely positioned
  1px element in the ink colour between markers; done segments solid, future segments dashed). Marker: done =
  filled ink circle with a white tick (Icon "check"), current = ring in cloth red with a pulsing inner dot
  (respect `prefers-reduced-motion` by not animating), future = hollow ring in `rule`, REJECTED = red-pencil circled
  cross (`.mark-x`).
- Middle column: `t(\`status.${stage}.title\`)` as `.t-label`, then a second line with `t("status.actor")`:
  `t(event.actorKey)`, then for the current event `t("common.whatNext")`: `t(event.nextKey)`, and for done events
  `t("status.doneAt", { date: formatDate(at, lang) })`; for the current event with `expectedBy`,
  `t("status.expectedBy", { date })`. Use `useLang()` for the lang.
- Right column: the date (`formatDate`) in `.t-num text-sm`, muted for future.
- Below the sheet, when `status.expectedCreditDate`, a line `t("status.expectedCredit", { date })` in `.t-label` with Icon "landmark".
- Accessible: `<ol>` with `aria-current="step"` on the current item; no information by colour alone (the tick/ring/cross shapes carry it).

## `DemoClock.tsx` (client component)
`export function DemoClock({ today }: { today: string })` — a small `.sheet` control labelled
`t("status.demoTitle")` with `t("status.demoBody")`, showing `t("status.today", { date: formatDate(today, lang) })` and
three buttons: `t("status.plusOne")`, `t("status.plusFive")`, `t("status.reset")`. Each POSTs
`/api/mock/demo/clock` with `{ days }` (cumulative: keep the current offset in component state initialised from a
`offsetDays` prop, default 0; reset sends 0) then calls `router.refresh()` from `next/navigation`. Buttons are
`.tap` sized, border `ink/30`, disabled while pending. Mark the whole control with a `SimulatedTag`
(`src/components/SimulatedTag.tsx`, prop `provider="Demo clock"`).

## `SmsPreview.tsx` (client component)
`export function SmsPreview({ status, claimId, amount, last4, reason }: { status: StatusView; claimId: string; amount: number; last4: string; reason?: string })`
- Renders `t("status.smsTitle")` as `.t-label`, then a phone-message bubble (rounded, `bg-paper-2`, max-w 22rem) with
  sender `t("status.smsFrom")` in `.t-label text-2xs text-ink-3` and the body
  `t(\`status.${status.current}.sms\`, { id: claimId, last4, amount: formatINR(amount, lang).replace("₹", ""), reason: reason ?? "" })`.

All strings via `useT()`. No new i18n keys (every key you need already exists; if one is missing, use the closest
existing key and list it in your final message). Run `pnpm typecheck`. Final message ≤ 8 lines.
