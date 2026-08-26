# Accessibility pass (WCAG 2.2 AA) over the screens and components
PATHS: src/components src/app/login src/app/(journey) src/app/how-it-works src/app/page.tsx

Read `AGENTS.md` and `DESIGN.md` first (tokens, the 48 px tap-target rule, the "state is a mark, not a hue" rule).
Then review every `.tsx` under the PATHS above and make ONLY accessibility fixes, keeping the visual design, copy
keys and behaviour unchanged. Do not touch `src/i18n`, `src/lib`, `src/mock`, `src/app/api`, `globals.css`,
`layout.tsx`, or any test. Do not add packages.

Checklist (fix what is actually wrong; leave what is right):
1. Every interactive control has an accessible name (icon-only buttons/links need `aria-label`; the copy buttons,
   language toggle, mic, close, pagination arrows, the floating "Ask Sahayak" button).
2. Form fields: `<label htmlFor>` or `aria-label`; error messages linked with `aria-describedby` and announced via
   `role="alert"` or `aria-live`; `aria-invalid` on invalid inputs; OTP boxes have distinct labels ("digit 1 of 6").
3. Live regions: the pre-flight results heading and the risk meter are announced when they appear (`aria-live="polite"`
   on a wrapper that exists from first render — not on an element that mounts later); the passbook "Showing x–y" line
   already has one.
4. Semantics: lists are `<ol>/<ul>` with `<li>` children (the check ledger and the tool list are; verify the landing
   pillars, claims list and passbook rows use list or table semantics, not bare divs — for the passbook use
   `role="table"`/`row`/`cell` or a real `<table>` if it keeps the ledger grid intact).
5. Dialog: the Sahayak sheet traps focus while open (simple loop on Tab/Shift+Tab within the dialog), returns focus to
   the opener on close, closes on Escape; `aria-modal` is set.
6. Keyboard: every clickable card/label is reachable (radio labels are fine); `details/summary` stays native; the
   `Segmented` group uses `aria-pressed` (it does) — verify arrow-key handling is not required (buttons, not tabs).
7. Colour is never the only carrier: the Stepper segments need an accessible text alternative (they have
   `aria-valuenow`; ensure `aria-valuetext` says "Step n of 6"); the risk meter has text (it does).
8. Images/icons: decorative SVGs are `aria-hidden` (the `Icon` component does this when no title) — check any inline
   SVG outside it (the circled cross in `AgentRun`) is `aria-hidden`.
9. `lang` attributes: the Hindi/English toggle sets `lang` on the label it shows (it does); Hindi strings rendered
   inside an English page (none expected) would need `lang="hi"`.
10. Print: nothing required.

Run `pnpm typecheck`. Do not run the dev server. Final message: a bullet list of the files changed and the specific
fixes (≤ 15 lines). If something on the checklist is already correct, say so in one line rather than changing it.
