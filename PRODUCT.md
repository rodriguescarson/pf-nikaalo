# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack
Next.js 16 App Router + TypeScript + Tailwind v4 (decided by the builder in the approved sprint plan; deploy target Vercel via GitHub integration, mobile-first, must load on slow 3G).

## Users
Indian salaried workers who have left a job and need to withdraw their Employees' Provident Fund — most often within weeks of losing income, on a mid-range Android phone, on a patchy connection, with little patience for form numbers or portal jargon. Many are filing for the first time; some have already had a claim rejected and do not understand why. A secondary audience is the reviewer/judge of the Build What Moves India hackathon, who will test the citizen journey in a desktop or phone browser in under five minutes.

## Product Purpose
PF Nikaalo ("get your PF out") turns the EPFO withdrawal claim into a guided, reject-proof citizen journey. Roughly one in four EPFO claims (one in three final settlements) is rejected, almost always for data problems that were visible before submission: a name that differs from Aadhaar, a date of exit the employer never marked, an unverified bank account. The product runs those checks first, explains each failure in plain language with who fixes it and how long it takes, picks the right form for the person instead of asking them to know form numbers, shows the money and tax up front, and then tracks the claim in words a person can act on. Success = a citizen who reaches "submitted" only when the claim will actually settle, and who always knows the next step and who owns it.

## Positioning
The current portal is a form that accepts anything and rejects later; PF Nikaalo is a pre-flight that refuses to let a doomed claim be filed and turns every rejection reason into a fix. The rules are real, deterministic and testable (pure TypeScript with unit tests), not a chatbot's opinion. It composes with — never replaces — EPFO's systems; every dependency (UIDAI e-KYC, NPCI bank validation, employer date-of-exit, EPFO claim events) is simulated and labelled as such.

## Operating Context
- Built for the Build What Moves India hackathon (Varun Mayya × OpenAI), Aug 2026. Independent prototype; not EPFO or the Government of India; no government logos, no live government systems, all data synthetic.
- Reviewers open a public link, log in with a demo UAN + any 6-digit OTP, and must be able to complete the whole journey: triage → pre-flight checks (with a working "fix it" on self-service failures) → guided claim → review/submit → status timeline (with a demo clock) → rejection explainer.
- Real-world constraints being modelled: two-month wait after exit for final settlement; Form 19 / 10C / 31 / scheme certificate semantics; TDS u/s 192A (10 % with PAN, 20 % without, exempt at 5+ years or ≤ ₹50k, Form 121 replaces 15G/15H from 1 Apr 2026); 3-day fast track vs 20-day outer limit; EPFO's rejection vocabulary.
- Codex (OpenAI) is a mandatory build tool for the hackathon; its contribution is logged in CODEX_LOG.md.

## Capabilities and Constraints
- Complete citizen journey in the browser, mobile-first, English and Hindi (plain, lightly Hinglish English voice).
- Rules engine (`src/lib/rules`) is the single source of truth for eligibility, form choice, amounts, TDS, status and rejection explanations.
- Mock backend route handlers simulate EPFO/UIDAI/NPCI/employer with latency and an `x-simulated` header; state lives in a small cookie so serverless cold starts are safe.
- Side surfaces: service-history passbook (searchable, filterable, sortable, paginated), claims list, "how it works" honesty page, an assistant ("Sahayak") that answers from the rules engine with browser speech in/out; an optional OpenAI-model provider when an API key is configured.
- Must work on slow 3G: no UI library, system fonts, minimal JS, one small hero asset at most.
- Undecided: whether a custom domain is attached; whether the OpenAI provider is enabled at submission.

## Brand Commitments
- Name: PF Nikaalo. Tagline: "Reject-proof your PF claim."
- Voice: a competent friend who has done this before — plain, direct, specific, no bureaucratic phrasing, no exclamation marks; Hindi is everyday Hindi, not Sanskritised.
- Binding constraint: must never look official. No tricolour, no emblem, no "Ministry"/"Govt of India" cues, no EPFO logo. A visible "independent prototype" banner on every page.

## Evidence on Hand
- Public statistics and rules with sources (cited in README/how-it-works): rejection rates (dataful, Deccan Herald), TDS/Form 121 (Business Standard, Kustodian), fast-track settlement (PIB), rejection reason phrasing (epfo.app, Kustodian, CitizenNest).
- Four seeded synthetic members in `src/mock/members.ts` covering the clean case, name mismatch, missing date of exit, and failed bank KYC + prior rejection.
- No real users, no testimonials, no real EPFO data. Do not fabricate any.

## Product Principles
1. Refuse to file what will be rejected; explain, don't just block.
2. One decision per screen; the person never needs to know a form number.
3. Every dependency is either real code or clearly labelled as simulated — honesty is a feature.
4. Money and tax are shown before the person commits, never after.
5. Works on a cheap phone on a bad connection, in the reader's language.

## Accessibility & Inclusion
Target WCAG 2.2 AA: 4.5:1 body contrast, 48 px tap targets, full keyboard path, `aria-live` on check results, Devanagari rendering via system fonts, reduced-motion respected, no information carried by colour alone (pass/fail also iconed and worded).
