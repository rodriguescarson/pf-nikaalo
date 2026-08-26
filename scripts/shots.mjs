// Headless review captures: desktop + mobile for every route, signed in as a seeded member.
// Usage: node scripts/shots.mjs [baseUrl] [uan]   → writes .impeccable/review/<viewport>-<route>.png
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://localhost:3210";
const uan = process.argv[3] ?? "100000000002";
const out = ".impeccable/review";
mkdirSync(out, { recursive: true });

const routes = [
  ["landing", "/"],
  ["login", "/login"],
  ["start", "/start"],
  ["check", "/check"],
  ["claim", "/claim"],
  ["review", "/claim/review"],
  ["claims", "/claims"],
  ["passbook", "/passbook"],
  ["how", "/how-it-works"],
];

const browser = await chromium.launch();
for (const [vp, size] of [
  ["mobile", { width: 390, height: 844 }],
  ["desktop", { width: 1280, height: 900 }],
]) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 2, reducedMotion: "reduce" });
  const host = new URL(base).hostname;
  await ctx.addCookies([
    { name: "pfn_uan", value: uan, domain: host, path: "/" },
    { name: "pfn_intent", value: "full_withdrawal", domain: host, path: "/" },
    { name: "pfn_fixes", value: vp === "mobile" ? "" : "UPDATE_PROFILE", domain: host, path: "/" },
    { name: "pfn_lang", value: "en", domain: host, path: "/" },
  ]);
  const page = await ctx.newPage();
  for (const [name, path] of routes) {
    try {
      await page.goto(base + path, { waitUntil: "networkidle", timeout: 60_000 });
      if (name === "check") await page.waitForTimeout(9000);
      await page.screenshot({ path: `${out}/${vp}-${name}.png`, fullPage: true });
      console.log("ok", vp, name, page.url());
    } catch (e) {
      console.log("FAIL", vp, name, String(e).slice(0, 120));
    }
  }
  await ctx.close();
}
await browser.close();
