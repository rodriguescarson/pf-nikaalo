---
name: PF Nikaalo
description: A kirana bahi-khata for your PF claim — red cloth cover, ruled white sheets, ink and pencil marks.
colors:
  paper: "#fcfbf8"
  paper-2: "#f4f2ec"
  paper-3: "#ebe8e0"
  sheet: "#ffffff"
  rule: "#d6dae5"
  rule-red: "#e5b3b3"
  cloth: "#8e1a21"
  cloth-deep: "#6e1218"
  cloth-tint: "#f6e4e5"
  ink: "#1b2140"
  ink-2: "#4f5772"
  ink-3: "#6d7590"
  tick: "#1f6b45"
  tick-fill: "#e4f3ea"
  pencil: "#b42318"
  pencil-fill: "#fde8e6"
  ochre: "#8a5a00"
  ochre-fill: "#fff1d6"
  focus: "#2f5bea"
typography:
  display:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "2.375rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.15
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Noto Sans Devanagari, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "0.01em"
  figure:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontWeight: 700
    fontVariation: "tabular-nums lining-nums"
    letterSpacing: "-0.01em"
  lead:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Noto Sans Devanagari, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  brand:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.01em"
  display-lg:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "2.875rem"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  stat:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "3.5rem"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "tabular-nums lining-nums"
  stat-lg:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "4.25rem"
    fontWeight: 700
    lineHeight: 1
    fontVariation: "tabular-nums lining-nums"
  figure-lg:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 700
    fontVariation: "tabular-nums lining-nums"
  figure-xl:
    fontFamily: "Anek Devanagari, Noto Sans Devanagari, Hind, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    fontVariation: "tabular-nums lining-nums"
  base:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Noto Sans Devanagari, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Noto Sans, Noto Sans Devanagari, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 400
    lineHeight: 1.35
rounded:
  xs: "0.25rem"
  sheet: "0.375rem"
  cloth: "0.75rem"
  pill: "9999px"
spacing:
  row: "3rem"
  margin-col: "3.25rem"
  gutter: "1rem"
  column: "34rem"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.cloth-deep}"
    typography: "{typography.label}"
    rounded: "{rounded.cloth}"
    padding: "0.75rem 1rem"
    height: "3rem"
  button-primary-hover:
    backgroundColor: "{colors.sheet}"
  button-cloth:
    backgroundColor: "{colors.cloth}"
    textColor: "{colors.sheet}"
    typography: "{typography.label}"
    rounded: "{rounded.cloth}"
    padding: "0.625rem 1rem"
    height: "3rem"
  button-cloth-hover:
    backgroundColor: "{colors.cloth-deep}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.cloth}"
    padding: "0.625rem 1rem"
    height: "3rem"
  sheet:
    backgroundColor: "{colors.sheet}"
    rounded: "{rounded.sheet}"
  ledger-row:
    height: "{spacing.row}"
  input:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "0.75rem"
    height: "3rem"
  tag-simulated:
    backgroundColor: "transparent"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.pill}"
    padding: "0.125rem 0.5rem"
  banner:
    backgroundColor: "{colors.ochre-fill}"
    textColor: "{colors.ochre}"
  segmented-on:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sheet}"
    height: "2.5rem"
---

# Design System: PF Nikaalo

## Overview

**Creative North Star: "The Bahi-Khata"**

The kirana shopkeeper's red cloth-bound ledger, the account book half of India has seen on a counter: a claim is a
line the shopkeeper checks before he writes it. The cover is lac-red cloth and carries the name, the primary action
and the running totals; the pages inside are white ruled sheets with a red margin rule, hairline rows and figures
right-aligned in tabular numerals. Everything is written in blue-black ink. State is a mark before it is a colour:
a green-pen tick means clear, a red-pencil circle means a problem, an ochre pencil note means caution.

The surface is Operate first: a citizen completing a task on a phone in daylight, so it is light-only, dense
enough to read as a record and calm enough to trust. The one authored motion is a ledger line being written and,
on a fix, struck through and rewritten. Nothing looks official on purpose: no emblem, no tricolour, no navy.

**Key Characteristics:**
- Committed colour: the cloth red owns the header band, the sticky action bar and every total strip (about a third of a screen); the sheets stay white.
- The ledger row is the unit of layout: a 3.25 rem mark column, the entry, a right-aligned figure or index.
- One expressive face (Anek Devanagari, Latin + Devanagari in one file) for heads, labels and figures; the system sans for prose.
- Marks over hues: tick / circled cross / triangle note carry state; colour only reinforces.
- Honesty is a component: the ochre banner on every page and the dashed "Simulated" pill beside every dependency.

## Colors

A restrained neutral ground with one committed material colour and three ink-and-pencil semantic marks.

- **Cloth** `#8e1a21` (lac red) — the cover: header band, sticky action bar, total strips, primary cloth buttons. Text on cloth is white. `cloth-deep` `#6e1218` for pressed/hover; `cloth-tint` `#f6e4e5` for selected rows and the visitor's own chat bubble.
- **Paper** `#fcfbf8` — page ground (barely warm white, not cream). `paper-2` `#f4f2ec` for subtotal bands, hover rows, skeletons (`paper-3` `#ebe8e0` is the shimmer highlight only). `sheet` `#ffffff` — the ruled page.
- **Rule** `#d6dae5` — every hairline: row borders, sheet borders, input borders. `rule-red` `#e5b3b3` — the single vertical margin rule inside a ledger.
- **Ink** `#1b2140` (blue-black) — text and done markers. `ink-2` `#4f5772` secondary prose (5.5:1 on paper). `ink-3` `#6d7590` captions, indices, placeholders (4.6:1 on paper; never below 0.6875 rem on tinted grounds).
- **Tick** `#1f6b45` (green pen) — clear/done; `tick-fill` `#e4f3ea`.
- **Pencil** `#b42318` (red pencil) — blocking problem, negative money lines; `pencil-fill` `#fde8e6`. Distinct from cloth by material: cloth is a band, pencil is a mark.
- **Ochre** `#8a5a00` — caution and the honesty banner; `ochre-fill` `#fff1d6`.
- **Focus** `#2f5bea` — the 3 px focus ring, offset 2 px, everywhere.

Contrast: all text pairs meet WCAG AA (ink-3 on paper 4.6:1 is the floor; white on cloth 9:1; ochre on ochre-fill 6.1:1; pencil on white 5.9:1; tick on white 6.2:1).

## Typography

Two families with a clear split of duties. **Anek Devanagari** (Ek Type, OFL; loaded via `next/font/google`, weights 500 and 700, Latin + Devanagari subsets) is the ledger hand: display, headline, title, labels, and every figure. **The system sans stack** carries body prose in both languages (Devanagari ships on every phone).

- Display `2.375rem` (`display-lg` 2.875 rem ≥ sm) / 1.05 / 700 / −0.01 em, balanced — the cover title only. `stat` 3.5 rem (4.25 rem ≥ sm) for the single cover statistic; `brand` 1.375 rem for the header wordmark.
- Headline `1.75rem` / 1.15 / 700 — page titles (`PageTitle`).
- Title `1.25rem` / 1.15 / 700 — result headings ("1 thing would get this claim rejected").
- Body `0.9375rem` / 1.5 (1.65 in Hindi) — prose, check messages, explanations. `base` 1 rem is the html default and the review sheet; `lead` 1.0625 rem for the cover lead, the tax explanation and EPFO's quoted phrase.
- Label `0.8125rem` / 1.2 / 500 / +0.01 em — row titles, buttons, section heads, toolbar controls.
- Figure — Anek 700 with `tabular-nums lining-nums` for every rupee amount, date, UAN, row index; `figure-lg` 1.375 rem for the total strip and the UAN field, `figure-xl` 1.5 rem for OTP boxes and the passbook balance. Amounts are right-aligned; indices (`01`…`13`) are ink-3.
- Caption `0.6875rem` (`text-2xs`) — banner, simulated tags, evidence keys, source lines.

Scale ratio ≈ 1.2, fixed rem steps (no fluid type). Headings use `text-wrap: balance`. No serif, no monospace anywhere.

## Layout

- One column, `max-width: 34rem`, `1rem` gutters, centred on desktop; the phone is the design width and desktop simply centres it.
- Header band (cloth, 3.5 rem) → ochre honesty banner → optional offline bar → page. Journey pages open with the 6-step `Stepper` (segments: done ink, current cloth, future rule).
- Page padding: `pt-6`, `pb-32` so the sticky action bar never covers content; sections separated by `mt-7`, a label above each sheet with `mb-2`.
- **Ledger row**: grid `3.25rem 1fr auto`, `min-height 3rem`, `border-bottom 1px rule`; the `.ledger` container draws the red margin rule at `left: 3.25rem`. Rows are `align-items: start` by default; money rows use `items-center` and `min-h-[2.75rem]`.
- **Action bar**: fixed to the bottom, cloth, one primary button (paper on cloth) full width, an optional note line above it, `env(safe-area-inset-bottom)` padded.
- Lists: toolbar row (search, filters, sort) wraps and never hides; 12 rows per page; a short "Showing x–y of n" line in caption size above the sheet.
- Responsive: header nav labels hide below `md` (icon + `aria-label`), running totals and long "Simulated: provider" pills hide below `sm`.

## Elevation & Depth

Depth is paper on a counter: quiet, offset, blurred.

- `shadow-sheet`: `0 1px 2px rgb(27 33 64 / .08), 0 10px 28px -14px rgb(27 33 64 / .28)` — every sheet.
- `shadow-cloth`: `0 2px 4px rgb(60 10 14 / .25), 0 14px 34px -14px rgb(60 10 14 / .5)` — the action bar, the cover CTA, the Sahayak sheet.
- The cloth itself has a faint diagonal weave (`repeating-linear-gradient` at 135°, 2.5 % white) and a soft top highlight; nothing else uses gradients.
- No glass, no zero-offset halos, no hard offset shadows. Hover on rows = `paper-2`; hover on cloth = `cloth-deep` or `white/10`.

## Shapes

- Focus rings and skeleton bars: `0.25rem`. Sheets, inputs, segmented controls: `0.375rem` (a page corner).
- Cloth objects (buttons, action bar container, passbook balance strip, Sahayak header): `0.75rem` (a bound cover).
- Pills only for the "Simulated" tag, suggestion chips and the floating "Ask Sahayak" button.
- Borders are 1 px `rule`; selected/emphasised borders switch to `cloth` with `cloth-tint` fill. No thick side stripes: state lives in the mark column, never in a coloured border.
- Marks: tick 20 px / 2.5 stroke; problem = 28 px circle path (drawn with `circle-in`) around a 16 px cross; caution = triangle 20 px. Icons are Lucide, one stroke weight (2), never emoji.

## Components

- **Header**: cloth band; brand in Anek 1.375 rem; nav links 48 px tall with icon + label (label ≥ md); language toggle shows the *other* language's abbreviation.
- **Banner**: ochre-fill strip under the header on every page; caption size; `role="note"`.
- **Stepper**: six segments + "Step n of 6" and an estimated minutes chip.
- **Sheet / ledger row**: see Layout. Row index in the right column as a figure; the mark column holds the state glyph or the index on neutral rows.
- **CheckCard (a ledger row)**: label, message, evidence `dl` (key in ink-3, value in figure style), "Who fixes it / Usually", a `details` disclosure for steps, then the action: cloth button "Fix it now · <action>" or outline button "Ask my employer · <name>". A fixed line keeps the struck old message (line-through in pencil, 2 px) above the rewritten one.
- **Amount ledger**: labelled rows, a `paper-2` subtotal band, the TDS row in pencil with a triangle, and the total as a cloth strip with the figure at 1.375 rem.
- **Inputs**: 48 px tall, `rule` border, sheet background, figure typography for numbers (UAN 1.375 rem tracked 0.08 em; OTP boxes 56 px, one digit each, auto-advance, paste-aware).
- **Buttons**: primary = paper on cloth (inside the action bar); cloth = cloth on white pages; outline = 1 px `ink/30`; all 48 px min-height, label typography, icon 16–20 px after the text. Disabled = 50 % opacity, never a colour change.
- **Segmented / Select / Search**: 40–48 px, sheet background, `rule` border; the active segment inverts to ink on paper.
- **Timeline**: vertical transit line in the mark column; done = filled ink circle with white tick, current = cloth ring with dot, future = hollow `rule` ring, rejected = pencil circled cross; date as a figure on the right.
- **DemoClock**: a small sheet with three outline buttons and a "Simulated" tag; never styled as part of the product.
- **SMS preview**: `paper-2` bubble, max 22 rem, sender in caption label.
- **Sahayak**: floating ink pill bottom-right; bottom sheet on phones / centred dialog ≥ sm; cloth header; a provider line (scripted vs model) under it; suggestion chips; mic + text + send.
- **Skeleton**: `paper-2` shimmer bars inside the same ledger rows the content will occupy.

## Do's and Don'ts

- Do put state in the mark column first (tick / circled cross / triangle) and let colour follow; never carry meaning by colour alone.
- Do right-align every rupee figure and date in tabular numerals; do use Indian grouping (`₹3,20,000`).
- Do keep the cloth for bands and totals; a cloth button on a white page is the only other use.
- Do keep the honesty banner and a "Simulated" tag beside every dependency, in both languages.
- Do write copy as a competent friend: plain, specific, no exclamation marks, Hindi as everyday Hindi.
- Don't use cream, parchment or serif display — the paper is white, the hand is Anek.
- Don't add government emblems, tricolour, navy "portal" blue, or anything that reads as official.
- Don't introduce cards inside sheets, coloured side borders, gradient text, glass, or decorative motion; the only authored motion is the ledger write-in and the strike/rewrite.
- Don't drop below 48 px tap targets or 4.5:1 text contrast; don't put ink-3 on `paper-2` below caption size.
- Don't hide list controls behind menus on phones; wrap them.

<!-- Not canonized: the cover's "KHATA · PF withdrawal · pre-checked" rule line above the display title reads as a ledger heading but sits where a kicker would; it is kept on the cover only and is not a pattern for other surfaces. The Next.js dev indicator visible in review captures is tooling, not design. -->
