# Add unit tests for the Sahayak intent router and the passbook builder
PATHS: src/lib/assistant/__tests__ src/lib/__tests__

Read `AGENTS.md`, `src/lib/assistant/intents.ts`, `src/lib/assistant/provider.ts` (only `scriptedAnswer` and
`computeFacts` — note the file imports `server-only`, so test `scriptedAnswer` through a small shim: in the test,
`vi.mock("server-only", () => ({}))` before importing), `src/lib/passbook.ts`, `src/mock/members.ts`,
`src/i18n/en.json` (keys under `assistant.answers.*`) and `vitest.config.ts`. Do NOT edit any existing file.
Create exactly:

1. `src/lib/assistant/__tests__/intents.test.ts`
   - `detectIntent` returns the expected id for at least 3 phrasings per intent, covering English, Hindi
     (Devanagari) and Hinglish (Latin-script Hindi), e.g. "why would my claim be rejected", "मेरा क्लेम क्यों रिजेक्ट होगा",
     "claim kyu reject hoga" → `reject_risk`; "how much tax will be cut" / "कितना टैक्स कटेगा" / "tds kitna" → `tds`;
     "when will the money come" / "पैसा कब आएगा" / "paisa kab aayega" → `timeline`; "what is form 121" → `form121`;
     "my employer is not updating my exit date" / "नियोक्ता एग्ज़िट डेट नहीं भर रहा" → `doe`; "which form" → `forms`;
     "how much will i get" / "kitna milega" → `amount`; "who will fix this" / "kaun theek karega" → `who_fixes`;
     "namaste" → `greeting`; empty string → `null`; "what is the weather" → `null`.
   - Precedence: "which form do I need to avoid tds" → `forms` (forms is tested before tds).
2. `src/lib/assistant/__tests__/scripted.test.ts`
   - For member `100000000002` (Rahul) with intent `full_withdrawal`, asOf `"2026-08-26"`, lang `en`, form121 false:
     `scriptedAnswer("why rejected", ctx)` mentions "Name matches Aadhaar" and has `provider: "scripted"`;
     after `applyFix(member, "UPDATE_PROFILE", asOf)` the same question returns the clear-to-file answer.
   - TDS answer for Priya (`100000000001`) contains "10%" and "21,000"; with `form121: true` the answer says no tax.
   - Amount answer for Priya contains "2,10,000".
   - Fallback: an unknown question returns the `assistant.fallback` text.
   - Hindi: with lang `hi`, the greeting answer equals the `hi.json` greeting.
3. `src/lib/__tests__/passbook.test.ts`
   - For each seeded member, `buildPassbook(m)` sums: employee entries == `passbook.employeeShare` (±3 rupees rounding),
     employer entries == `passbook.employerShare` (±3), pension entries == `passbook.epsContribution` (±3),
     interest entries == `passbook.interest` (±3).
   - Entries are sorted by month ascending; every entry's `establishmentId` exists in `m.employments`; pension
     entries never exceed 1250 per month before scaling is irrelevant — instead assert every `amount >= 0`.
   - Rahul has entries for both employers; Fatima's last month is `2026-04`.

Run `pnpm test`; all new tests must pass without modifying source files. If a test cannot pass because of a
genuine bug in source, do NOT edit the source: write the test to document the expected behaviour with `it.todo`
and list it in your final message. Final message ≤ 10 lines.
