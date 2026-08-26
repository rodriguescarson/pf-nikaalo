import type { Member } from "@/lib/rules/types";

export type EntryType = "employee" | "employer" | "pension" | "interest";
export interface PassbookEntry {
  month: string; // YYYY-MM
  employer: string;
  establishmentId: string;
  type: EntryType;
  amount: number;
}

const EPS_CAP = 1250; // 8.33 % of the ₹15,000 wage ceiling

function monthsBetween(start: string, end: string): string[] {
  const out: string[] = [];
  const [sy, sm] = start.split("-").map(Number);
  const [ey, em] = end.split("-").map(Number);
  let y = sy;
  let m = sm;
  while (y < ey || (y === ey && m <= em)) {
    out.push(`${y}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      y += 1;
    }
  }
  return out;
}

/**
 * Synthetic monthly ledger derived from the member's employments, scaled so the totals reconcile with the
 * seeded passbook figures. Deterministic: no randomness, same member → same entries.
 */
export function buildPassbook(member: Member): PassbookEntry[] {
  const raw: PassbookEntry[] = [];
  for (const e of member.employments) {
    const months = monthsBetween(e.doj.slice(0, 7), (e.doe ?? e.lastContributionMonth).slice(0, 7));
    const eps = Math.min(EPS_CAP, Math.round(e.wageBasicDA * 0.0833));
    months.forEach((month, i) => {
      raw.push({ month, employer: e.employer, establishmentId: e.establishmentId, type: "employee", amount: Math.round(e.wageBasicDA * 0.12) });
      raw.push({ month, employer: e.employer, establishmentId: e.establishmentId, type: "employer", amount: Math.round(e.wageBasicDA * 0.12) - eps });
      raw.push({ month, employer: e.employer, establishmentId: e.establishmentId, type: "pension", amount: eps });
      // Interest is credited once a year, at the end of March, on the running balance.
      if (month.endsWith("-03") && i > 0) raw.push({ month, employer: e.employer, establishmentId: e.establishmentId, type: "interest", amount: 0 });
    });
  }
  const sum = (t: EntryType) => raw.filter((r) => r.type === t).reduce((a, r) => a + r.amount, 0);
  const scale = (t: EntryType, target: number) => {
    const s = sum(t);
    if (s <= 0) return;
    const k = target / s;
    for (const r of raw) if (r.type === t) r.amount = Math.round(r.amount * k);
  };
  scale("employee", member.passbook.employeeShare);
  scale("employer", member.passbook.employerShare);
  scale("pension", member.passbook.epsContribution);
  const interestRows = raw.filter((r) => r.type === "interest");
  if (interestRows.length) {
    const each = Math.round(member.passbook.interest / interestRows.length);
    for (const r of interestRows) r.amount = each;
  } else if (member.passbook.interest > 0) {
    const last = raw[raw.length - 1];
    raw.push({ ...last, type: "interest", amount: member.passbook.interest });
  }
  return raw.sort((a, b) => (a.month === b.month ? 0 : a.month < b.month ? -1 : 1));
}
