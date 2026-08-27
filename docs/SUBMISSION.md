# Build What Moves India — submission pack for PF Nikaalo

Deadline: **Thu 28 Aug 2026, 8:00 PM IST** (form closes, no grace). Target: everything in the form by **15:00 IST**.

## What the form asks for

1. **Live public link** (opens without any access request): `https://pf-nikaalo.vercel.app`
   Demo login: any of the four UANs below + any 6-digit OTP.
   `100000000002` (Rahul — name mismatch, the video case) · `100000000001` (Priya — clean, TDS + Form 121) ·
   `100000000003` (Fatima — date of exit missing) · `100000000004` (Suresh — bank KYC failed, prior rejection).
2. **One video ≤ 2:00** — minute 1 = demo as a citizen, minute 2 = how it was built and why. Unlisted YouTube or Loom.
3. **Project summary < 250 words** — below (238 words).
4. Partner email — leave blank (solo).

---

## Video script (timed to ~1:50). Record at phone width (≈ 400 px wide window) for minute 1, editor/terminal for minute 2.

**0:00–0:08 · landing (Hindi toggle visible)**
"One in three PF final-settlement claims in India gets rejected. Mine did. PF Nikaalo checks your claim before you file it."

**0:08–0:18 · login → triage**
Tap Rahul Verma → Send code → any six digits → *"I left my job. I want all my PF money."*
"No form numbers. You say what you need in plain words."

**0:18–0:40 · pre-flight (the hero moment)**
Let Sahayak's five tool calls tick through, then the 13 lines write in.
"Thirteen checks, against the same records EPFO uses. One is circled: the name on the EPFO record is 'RAHUL VERMA', Aadhaar says 'Rahul Kumar Verma'. EPFO would reject this claim for a missing middle name."
Open *How to fix it* for a beat, then tap **Fix it now** → the old line is struck, the new one written, risk drops to Low.
"Because his UAN is post-2017, he can fix it himself. Done. Now it can't bounce."

**0:40–0:52 · claim**
"We picked Form 19 and explained why. Here's the money as a ledger — his share, the employer's, interest, tax at 10% under 192A, and what lands in the bank. If his income is below the limit, Form 121 removes the tax." Toggle it on, the TDS line goes to zero, toggle back.

**0:50–0:58 · passbook insights (optional 6-second beat)**
Open Passbook → Insights: "And your khata is not a status code either: contribution streak, how the balance grew, what each employer paid, month by month." Scroll one screen, then continue.

**0:52–1:00 · review → file → status**
Tick the undertaking, six digits, File. Timeline appears. Press **+1 day** twice: Under process → Approved.
"Who is acting, what happens next, by when — and the SMS EPFO would send. Not a status code." Flip to Hindi for two seconds.

**1:00–1:20 · how it's built (screen: repo + terminal)**
"It's a Next.js app on Vercel. The rules — eligibility, forms, EPS, TDS, Form 121, status, rejection reasons — are a pure TypeScript engine with 94 unit tests." (`pnpm test` green on screen.) "EPFO, UIDAI, NPCI and the employer are simulated route handlers with real latency; every one is labelled in the UI, and the how-it-works page says what the real integration is."

**1:20–1:40 · Codex**
Show `CODEX_LOG.md` and `git log --grep='^codex('`.
"Codex was a build tool, not a sticker. I wrote the contract and the tests; Codex implemented the rules engine until the tests passed, the mock backend, the timeline components, and more tests — each a separate commit with a Codex co-author line, so you can verify exactly what it did."

**1:40–1:50 · honesty + close**
"All data is synthetic, nothing touches a government system, and the page lists what it would take to run this for real. PF Nikaalo — the claim gets checked before it gets filed."

### Pre-record checklist
- Incognito window at ~400×860 for minute 1; `localhost` or the Vercel URL (Vercel preferred — proves the live link).
- Rahul journey fresh: `/api/mock/session` DELETE or clear cookies first.
- Reduce motion OFF (so the write-in animation shows). Sound on for the Hindi flip if you narrate over it.
- Minute 2 windows: VS Code with `src/lib/rules/preflight.ts`, a terminal with `pnpm test`, `CODEX_LOG.md`.
- Export ≤ 2:00. Upload unlisted. Paste the link in the form and test it in a private window.

---

## Project summary (< 250 words)

**PF Nikaalo — reject-proof your PF claim.**

About one in three EPFO final-settlement claims is rejected, almost always for something visible before filing: a name that differs from Aadhaar, a date of exit the employer never marked, an unverified bank account. The portal accepts the claim and rejects it weeks later with "member details mismatch". I went through this myself.

PF Nikaalo is a complete citizen journey, in English and Hindi, that refuses to file what will bounce. You say what you need in plain words; it runs thirteen checks against the records EPFO uses and shows each failing line with evidence, who fixes it, how long it takes, and a working fix for the self-service cases. It picks the right form (19/10C/31/scheme certificate) and explains why, shows the amount as a ledger with the tax rule and a Form 121 declaration when that removes TDS, files with an Aadhaar OTP, and tracks the claim as who-is-doing-what-by-when with the SMS EPFO would send. A rejection explainer turns EPFO's phrases into actions. Sahayak answers questions, typed or spoken, from your own record.

What is real: the rules engine (pure TypeScript, 94 tests), the whole journey, the language layer. What is simulated and labelled: EPFO, UIDAI, NPCI, employer filings, OTPs, claim progression. Nothing touches a live government system; all data is synthetic.

Built with Next.js on Vercel; Codex implemented the rules engine, mock backend and timeline components against my specs and tests, each session a verifiable commit.

---

## Carson's remaining actions

| When | Action |
|---|---|
| Now | Vercel → team **rodriguescarsons-projects** → Add New → Project → Import `rodriguescarson/pf-nikaalo` → Deploy. Send me the URL. |
| After deploy | Open the URL in a private window on your phone; run the Rahul journey once. |
| Aug 27 evening | Record the 2-minute video per the script above; upload unlisted. |
| Aug 28 ≤ 15:00 | Fill the submission form (link, video, summary). |
