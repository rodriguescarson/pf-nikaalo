# PF Nikaalo — reject-proof your PF claim

**Independent hackathon prototype for [Build What Moves India](https://buildwhatmovesindia.com) (Varun Mayya × OpenAI), August 2026.**
Not EPFO. Not the Government of India. Every name, number and record in it is synthetic.

Live: **https://pf-nikaalo.vercel.app** · Source: this repository (MIT)

## The problem

Roughly one in four EPFO claims is rejected; for final settlements it is closer to one in three
([Dataful](https://insights.dataful.in/articles/epfo-claim-rejection-rate-at-26-in-2023-24),
[Deccan Herald](https://www.deccanherald.com/india/one-in-three-epf-final-settlement-claims-rejected-report-2908705)).
Almost every rejection is for something that was visible *before* filing: a name that differs from Aadhaar by a
middle name, a date of exit the employer never marked, a bank account that was never verified. The portal accepts the
claim anyway and rejects it two weeks later with a phrase like “Member details mismatch”. I have been through this
myself after leaving a job; that is the problem this prototype solves.

## What it does

A complete citizen journey, in English and Hindi, that works end to end in the browser:

1. **Open your khata** — demo UAN + any 6-digit OTP.
2. **Say what you need** in plain words (four options). No form numbers.
3. **Pre-flight** — *Sahayak* runs 13 checks against the same records EPFO uses (member record, UIDAI e-KYC, NPCI
   bank validation, employer filings, claim history), written line by line into a ledger. A failing line is circled,
   with the evidence, who fixes it, how long it takes, the exact portal steps — and a working **Fix it now** for
   self-service fixes (profile correction, Mark Exit, bank re-seed, PAN link) or **Ask my employer** for the rest.
   A blocked claim cannot be filed; that is the point.
4. **Your claim** — the right form(s) chosen and explained (Form 19 / 10C / 31 / scheme certificate), the amount as a
   ledger (your share, employer share, interest, EPS benefit, TDS, what lands in the bank), the tax rule that applies,
   and a **Form 121** declaration (which replaced 15G/15H on 1 April 2026) when it would remove TDS.
5. **Review and file** — undertaking + Aadhaar OTP (simulated).
6. **Status** — a transit-line timeline: done / now / next, who is acting, expected by when, the SMS EPFO would send,
   a demo clock to move time forward, WhatsApp share and a printable receipt.
7. **Why was it rejected?** — EPFO's phrase → plain meaning → what to do → re-check and file again.

Also: a **passbook** (search, filter, sort, paginate), **my claims**, **how it works** (what is real, what is
simulated, what it would take at scale, sources), and **Sahayak**, an assistant that answers from your own record
and the rules engine — typed or spoken (browser speech in/out, Hindi or English), honestly labelled as scripted
unless an OpenAI model provider is configured.

## Demo accounts

| UAN | Name | What it shows |
|---|---|---|
| `100000000001` | Priya Sharma | Clean record; short service so TDS applies; Form 121 toggle |
| `100000000002` | Rahul Verma | **Name on EPFO record differs from Aadhaar** → self-service fix → file |
| `100000000003` | Fatima Khan | Employer never marked date of exit → Mark Exit; PAN not linked (warning) |
| `100000000004` | Suresh Pillai | Bank KYC failed at NPCI; a prior Form 19 rejected → rejection explainer |

OTP: any six digits. Everything is synthetic.

## What is real and what is simulated

**Real code:** the rules engine in `src/lib/rules` — eligibility checks, form selection, amounts, EPS Table D,
TDS under §192A, Form 121, status schedules (3-day fast track vs 20-day standard), rejection codes → fixes. Pure
TypeScript, no I/O, **94 unit tests** (`pnpm test`). The complete journey, the i18n layer (English/Hindi from one
dictionary, parity enforced at build), the assistant's intent router, the passbook builder.

**Simulated (and labelled as such in the UI and on `/how-it-works`):** the EPFO member record, UIDAI e-KYC, NPCI
account validation, employer ECR requests, OTPs, and claim progression (a schedule derived from the filing date;
the demo clock adds days). Route handlers under `src/app/api/mock/*` add latency and an `x-simulated: true` header.
Session state lives in small cookies so it survives serverless cold starts.

**Not used:** any live government system, any government logo, any real personal data.

## How Codex contributed

Codex (OpenAI) was a build tool on this project, driven non-interactively (`codex exec`) from
[`scripts/codex-task.sh`](scripts/codex-task.sh). Each session's prompt is committed under `.codex/prompts/`, its
output under `.codex/out/`, and its diff is a separate commit with a `Co-authored-by: Codex` trailer. See
[`CODEX_LOG.md`](CODEX_LOG.md) and `git log --grep='^codex('`. Units Codex implemented: the rules engine to a
test oracle (94 tests green), the simulated backend and cookie session store, the Timeline / DemoClock / SMS
components, and additional test suites. Design, screens, copy (English and Hindi), the assistant and integration
were done with Claude Code by the author.

## Run locally

```bash
pnpm install
pnpm dev            # http://localhost:3000
pnpm test           # rules engine + assistant + passbook tests
pnpm i18n:check     # en/hi parity + every t() key exists
pnpm build
```

Optional: set `OPENAI_API_KEY` (and `OPENAI_MODEL`) to switch Sahayak from the scripted provider to an OpenAI model
that answers only from the rules engine's facts. The app never depends on it.

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind v4 · React 19 · vitest · Playwright (review captures) ·
Anek Devanagari (Ek Type, OFL) · Lucide icons (ISC). Deployed on Vercel.

## Rules modelled (indicative, as of August 2026)

Form 19 / 10C / 31 semantics and the two-month wait ([EPFO](https://www.epfindia.gov.in/site_en/WhichClaimForm.php));
self-service profile and date-of-exit corrections for UANs issued after Oct 2017
([newsonair](https://www.newsonair.gov.in/epfo-simplifies-online-process-of-updating-member-profiles));
TDS §192A: 10 % with PAN below five years and above ₹50,000, 20 % without PAN
([taxgarden](https://taxgarden.in/blog/epf-pf-withdrawal-tax-rules-india-ay-2026-27));
Form 121 replacing 15G/15H from 1 Apr 2026
([Business Standard](https://www.business-standard.com/finance/personal-finance/epfo-replaces-form-15g-15h-with-121-what-it-means-for-withdrawing-money-126042900885_1.html));
auto-settlement within 72 h up to ₹5 lakh and the 20-day outer limit ([PIB](https://www.pib.gov.in/PressReleasePage.aspx?PRID=2139291));
rejection phrasing ([Kustodian](https://kustodian.life/resources/epf-claim-rejected-reasons-guide)).
EPS Table D factors and the no-PAN rate are indicative.

## Limits and disclosures

Independent prototype built for this hackathon; no affiliation with EPFO or any government body. No government
logos, code or data. Synthetic members only. Third-party: Next.js (MIT), Tailwind (MIT), Lucide (ISC), Anek
Devanagari (OFL), Playwright (Apache-2.0). Built by Carson Rodrigues — [carsonrodrigues.com](https://carsonrodrigues.com).
