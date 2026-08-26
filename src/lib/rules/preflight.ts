import { EPS_MIN_MONTHS, SELF_SERVICE_UAN_SINCE, WAIT_MONTHS_ADVANCE, WAIT_MONTHS_FINAL } from "./constants";
import { addDays, addMonths, endOfMonth, nameDiff, serviceSummary } from "./normalize";
import { fixFor } from "./rejection";
import type { CheckId, CheckResult, Fix, Intent, Member, Preflight, RejectionCode, SimulatedAction } from "./types";

const pass = (id: CheckId): CheckResult => ({ id, status: "pass", blocking: false, evidence: {}, messageKey: `check.${id}.pass` });
const result = (id: CheckId, status: "fail" | "warn", blocking: boolean, reasonCode?: RejectionCode, fix?: Fix, evidence: Record<string, string> = {}): CheckResult => ({
  id, status, blocking, ...(reasonCode ? { reasonCode } : {}), evidence, ...(fix ? { fix } : {}), messageKey: `check.${id}.${status}`,
});

const latestEmployment = (member: Member) => member.employments.reduce((latest, job) => !latest || job.doj > latest.doj ? job : latest, undefined as Member["employments"][number] | undefined);
const exitDate = (member: Member) => {
  const latest = latestEmployment(member);
  return latest ? latest.doe ?? endOfMonth(latest.lastContributionMonth) : "0000-01-01";
};
const simpleFix = (actor: Fix["actor"], selfServe: boolean, etaDays: [number, number], stepsName: string): Fix => ({ actor, selfServe, etaDays, stepsKey: `fix.${stepsName}.steps` });

export function runPreflight(member: Member, intent: Intent, asOf: string): Preflight {
  const svc = serviceSummary(member.employments, asOf);
  const latest = latestEmployment(member);
  const checks: CheckResult[] = [];
  checks.push(member.uanActive ? pass("UAN_ACTIVE") : result("UAN_ACTIVE", "fail", true, undefined, simpleFix("epfo", false, [0, 0], "UAN_ACTIVE")));
  checks.push(member.aadhaar.verified ? pass("AADHAAR_SEEDED") : result("AADHAAR_SEEDED", "fail", true, undefined, simpleFix("member", true, [0, 1], "AADHAAR_SEEDED")));

  const profileFix = () => fixFor("UPDATE_PROFILE", member, asOf);
  const nameComparison = nameDiff(member.name, member.aadhaar.name);
  checks.push(nameComparison === "exact" ? pass("NAME_MATCH") : result("NAME_MATCH", "fail", true, "NAME_MISMATCH", profileFix(), { "EPFO record": member.name, Aadhaar: member.aadhaar.name }));
  checks.push(member.dob === member.aadhaar.dob ? pass("DOB_MATCH") : result("DOB_MATCH", "fail", true, "DOB_MISMATCH", profileFix(), { "EPFO record": member.dob, Aadhaar: member.aadhaar.dob }));

  if (latest?.doe) checks.push(pass("DOE_PRESENT"));
  else {
    const eligibleSelfServe = !!latest && asOf >= addMonths(endOfMonth(latest.lastContributionMonth), WAIT_MONTHS_FINAL);
    checks.push(result("DOE_PRESENT", "fail", true, "DOE_NOT_AVAILABLE", eligibleSelfServe
      ? { ...fixFor("MARK_EXIT", member, asOf), actor: "member", selfServe: true }
      : { ...fixFor("MARK_EXIT", member, asOf), actor: "employer", selfServe: false, etaDays: [3, 15] }));
  }

  const waitingMonths = intent === "advance_unemployment" ? WAIT_MONTHS_ADVANCE : WAIT_MONTHS_FINAL;
  const due = addMonths(exitDate(member), waitingMonths);
  checks.push(asOf >= due ? pass("TWO_MONTH_WAIT") : result("TWO_MONTH_WAIT", "fail", true, "WRONG_FORM", {
    ...fixFor("WRONG_FORM", member, asOf), selfServe: false, etaDays: [Math.max(0, daysUntil(asOf, due)), Math.max(0, daysUntil(asOf, due))],
  }));

  if (member.bank.kycStatus === "verified") checks.push(pass("BANK_KYC"));
  else if (member.bank.kycStatus === "pending_employer") checks.push(result("BANK_KYC", "fail", true, "BANK_KYC_NOT_VERIFIED", simpleFix("employer", false, [3, 15], "BANK_KYC_NOT_VERIFIED")));
  else checks.push(result("BANK_KYC", "fail", true, "BANK_KYC_NOT_VERIFIED", fixFor("RESEED_BANK", member, asOf)));
  const bankComparison = nameDiff(member.bank.nameOnAccount, member.aadhaar.name);
  checks.push(bankComparison === "exact" ? pass("BANK_NAME_MATCH") : result("BANK_NAME_MATCH", bankComparison === "minor" ? "warn" : "fail", bankComparison === "major", "BANK_NAME_DIFFERS", fixFor("RESEED_BANK", member, asOf), { "Bank account": member.bank.nameOnAccount, Aadhaar: member.aadhaar.name }));
  checks.push(member.pan.seeded && member.pan.verified ? pass("PAN_SEEDED") : result("PAN_SEEDED", "warn", false, "PAN_NOT_VERIFIED", fixFor("SEED_PAN", member, asOf)));

  const pending = member.priorClaims.some((claim) => claim.status === "pending");
  const settled19 = ["full_withdrawal", "both"].includes(intent) && member.priorClaims.some((claim) => claim.status === "settled" && claim.form === "FORM_19");
  checks.push(pending ? result("NO_DUPLICATE_CLAIM", "fail", true, "PENDING_WITH_EMPLOYER", fixFor("PENDING_WITH_EMPLOYER", member, asOf)) : settled19 ? result("NO_DUPLICATE_CLAIM", "fail", true, "CLAIM_ALREADY_SETTLED", fixFor("CLAIM_ALREADY_SETTLED", member, asOf)) : pass("NO_DUPLICATE_CLAIM"));
  checks.push(hasOverlap(member) ? result("SERVICE_OVERLAP", "fail", true, "SERVICE_OVERLAP", fixFor("SERVICE_OVERLAP", member, asOf)) : pass("SERVICE_OVERLAP"));
  const pensionIntent = intent === "both" || intent === "pension_withdrawal";
  checks.push(!pensionIntent || (svc.totalMonths >= EPS_MIN_MONTHS && svc.totalMonths < 120) ? pass("EPS_ELIGIBLE") : result("EPS_ELIGIBLE", "warn", false, svc.totalMonths < EPS_MIN_MONTHS ? "EPS_NOT_ELIGIBLE" : undefined, svc.totalMonths < EPS_MIN_MONTHS ? fixFor("EPS_NOT_ELIGIBLE", member, asOf) : undefined));
  checks.push(member.eNomination ? pass("E_NOMINATION") : result("E_NOMINATION", "warn", false, undefined, simpleFix("member", true, [0, 0], "E_NOMINATION")));

  const blocking = checks.filter((check) => check.status === "fail" && check.blocking);
  const warnings = checks.filter((check) => check.status === "warn").map((check) => check.id);
  return { checks, canSubmit: blocking.length === 0, rejectionRisk: blocking.length ? "high" : warnings.length ? "medium" : "low", blockingCodes: [...new Set(blocking.flatMap((check) => check.reasonCode ? [check.reasonCode] : []))], warnings };
}

function daysUntil(from: string, to: string): number {
  let date = from; let days = 0;
  while (date < to) { date = addDays(date, 1); days += 1; }
  return days;
}

function hasOverlap(member: Member): boolean {
  const ranges = member.employments.map((employment) => [employment.doj, employment.doe ?? employment.lastContributionMonth] as const);
  return ranges.some(([start, end], index) => ranges.slice(index + 1).some(([otherStart, otherEnd]) => start <= otherEnd && otherStart <= end));
}

export function applyFix(member: Member, action: SimulatedAction, _asOf: string): Member {
  const updated = structuredClone(member);
  const latest = latestEmployment(updated);
  if (action === "UPDATE_PROFILE") { updated.name = updated.aadhaar.name; updated.dob = updated.aadhaar.dob; }
  if (action === "MARK_EXIT" && latest) latest.doe = endOfMonth(latest.lastContributionMonth);
  if (action === "RESEED_BANK") { updated.bank.kycStatus = "verified"; updated.bank.nameOnAccount = updated.aadhaar.name; }
  if (action === "SEED_PAN") updated.pan = { seeded: true, verified: true, name: updated.aadhaar.name };
  return updated;
}
