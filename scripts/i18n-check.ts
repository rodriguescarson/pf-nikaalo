// Fails the build when en.json and hi.json drift, or when a rule-emitted key has no dictionary entry.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

type Tree = { [k: string]: string | Tree };
const root = join(import.meta.dirname ?? ".", "..");
const en = JSON.parse(readFileSync(join(root, "src/i18n/en.json"), "utf8")) as Tree;
const hi = JSON.parse(readFileSync(join(root, "src/i18n/hi.json"), "utf8")) as Tree;

function flatten(t: Tree, prefix = ""): Set<string> {
  const out = new Set<string>();
  for (const [k, v] of Object.entries(t)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (typeof v === "string") out.add(key);
    else for (const sub of flatten(v, key)) out.add(sub);
  }
  return out;
}
const enKeys = flatten(en);
const hiKeys = flatten(hi);
const missingHi = [...enKeys].filter((k) => !hiKeys.has(k));
const extraHi = [...hiKeys].filter((k) => !enKeys.has(k));

// Keys the rules engine emits by convention.
const CHECKS = ["UAN_ACTIVE","AADHAAR_SEEDED","NAME_MATCH","DOB_MATCH","DOE_PRESENT","TWO_MONTH_WAIT","BANK_KYC","BANK_NAME_MATCH","PAN_SEEDED","NO_DUPLICATE_CLAIM","SERVICE_OVERLAP","EPS_ELIGIBLE","E_NOMINATION"];
const CODES = ["NAME_MISMATCH","DOB_MISMATCH","DOE_NOT_AVAILABLE","BANK_KYC_NOT_VERIFIED","BANK_NAME_DIFFERS","PAN_NOT_VERIFIED","SERVICE_OVERLAP","CLAIM_ALREADY_SETTLED","WRONG_FORM","UNCLEAR_CHEQUE","PAYMENT_RETURNED","PENDING_WITH_EMPLOYER","EPS_NOT_ELIGIBLE","SIGNATURE_DIFFERS"];
const ACTIONS = ["MARK_EXIT","RESEED_BANK","UPDATE_PROFILE","SEED_PAN"];
const STAGES = ["SUBMITTED","RECEIVED_FIELD_OFFICE","UNDER_PROCESS","APPROVED","SETTLED","REJECTED"];
const required: string[] = [];
for (const c of CHECKS) for (const s of ["pass","fail","warn"]) required.push(`check.${c}.${s}`);
for (const c of CODES) required.push(`rejection.${c}.plain`, `rejection.${c}.epfo`, `fix.${c}.steps`);
for (const a of ACTIONS) required.push(`fix.${a}.steps`, `fix.${a}.label`);
for (const s of STAGES) required.push(`status.${s}.actor`, `status.${s}.next`, `status.${s}.title`);
for (const k of ["tds.exempt.fiveYears","tds.exempt.threshold","tds.exempt.reason","tds.exempt.form121","tds.under5yrs.pan","tds.under5yrs.noPan","forms.rationale.FORM_19","forms.rationale.FORM_10C","forms.rationale.FORM_31","forms.rationale.SCHEME_CERTIFICATE","forms.notAllowed.tenYears","forms.notAllowed.wait"]) required.push(k);
const missingRequired = required.filter((k) => !enKeys.has(k));

// Source scan: t("literal.key") usages must exist in en.json.
const used = new Set<string>();
function walk(dir: string) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) { if (!/node_modules|\.next|__tests__/.test(p)) walk(p); continue; }
    if (!/\.(tsx?|jsx?)$/.test(f)) continue;
    const src = readFileSync(p, "utf8");
    for (const m of src.matchAll(/\bt\(\s*["'`]([a-zA-Z0-9_.]+)["'`]/g)) used.add(m[1]);
  }
}
walk(join(root, "src"));
const missingUsed = [...used].filter((k) => !enKeys.has(k));

let failed = false;
const report = (title: string, items: string[]) => { if (items.length) { failed = true; console.error(`\n${title} (${items.length}):\n  ` + items.join("\n  ")); } };
report("Missing in hi.json", missingHi);
report("Extra in hi.json (not in en.json)", extraHi);
report("Rule-emitted keys missing in en.json", missingRequired);
report("t() keys used in src but missing in en.json", missingUsed);
if (failed) process.exit(1);
console.log(`i18n ok: ${enKeys.size} keys, en/hi in parity, ${used.size} literal usages verified.`);
