import type { Member } from "@/lib/rules/types";
import type { EntryType, PassbookEntry } from "@/lib/passbook";

/** Pure derivations over the passbook — the data behind the Insights tab. No I/O, no dates from the clock. */

export interface MonthPoint {
  month: string; // YYYY-MM
  employee: number;
  employer: number;
  pension: number;
  interest: number;
  /** PF balance (employee + employer + interest) at the end of this month. */
  balance: number;
}

export interface Streaks {
  /** Consecutive months with a contribution, ending at the latest month. */
  current: number;
  longest: number;
  longestFrom: string;
  longestTo: string;
  /** Months inside the employment span with no contribution. */
  gaps: string[];
  totalMonths: number;
}

export interface EmployerSummary {
  establishmentId: string;
  employer: string;
  from: string;
  to: string;
  months: number;
  employee: number;
  employerShare: number;
  pension: number;
  hasExit: boolean;
}

export interface Split {
  type: EntryType;
  amount: number;
  share: number; // 0..1 of PF balance + pension
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function nextMonth(m: string): string {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mm, 1)); // mm is 1-based → next month
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

/** Monthly series with a running PF balance. Interest is credited into the balance the month it is posted. */
export function monthlySeries(entries: PassbookEntry[]): MonthPoint[] {
  const byMonth = new Map<string, MonthPoint>();
  for (const e of entries) {
    const p = byMonth.get(e.month) ?? { month: e.month, employee: 0, employer: 0, pension: 0, interest: 0, balance: 0 };
    p[e.type === "employer" ? "employer" : e.type] += e.amount;
    byMonth.set(e.month, p);
  }
  const months = [...byMonth.keys()].sort();
  let balance = 0;
  return months.map((m) => {
    const p = byMonth.get(m)!;
    balance += p.employee + p.employer + p.interest;
    return { ...p, balance };
  });
}

/** Contribution streaks and gaps across the whole span (first month → last month with any contribution). */
export function streaks(entries: PassbookEntry[]): Streaks {
  const months = new Set(entries.filter((e) => e.type === "employee").map((e) => e.month));
  const sorted = [...months].sort();
  if (sorted.length === 0) return { current: 0, longest: 0, longestFrom: "", longestTo: "", gaps: [], totalMonths: 0 };
  const gaps: string[] = [];
  let longest = 0;
  let longestFrom = sorted[0];
  let longestTo = sorted[0];
  let run = 0;
  let runFrom = sorted[0];
  let cursor = sorted[0];
  const last = sorted[sorted.length - 1];
  while (cursor <= last) {
    if (months.has(cursor)) {
      if (run === 0) runFrom = cursor;
      run += 1;
      if (run > longest) {
        longest = run;
        longestFrom = runFrom;
        longestTo = cursor;
      }
    } else {
      gaps.push(cursor);
      run = 0;
    }
    cursor = nextMonth(cursor);
  }
  // current = trailing run ending at the last contributing month
  let current = 0;
  let c = last;
  while (months.has(c)) {
    current += 1;
    c = prevMonth(c);
  }
  return { current, longest, longestFrom, longestTo, gaps, totalMonths: sorted.length };
}

function prevMonth(m: string): string {
  const [y, mm] = m.split("-").map(Number);
  const d = new Date(Date.UTC(y, mm - 2, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function employerSummaries(member: Member, entries: PassbookEntry[]): EmployerSummary[] {
  return member.employments.map((emp) => {
    const rows = entries.filter((e) => e.establishmentId === emp.establishmentId);
    const months = new Set(rows.filter((r) => r.type === "employee").map((r) => r.month));
    const sum = (t: EntryType) => rows.filter((r) => r.type === t).reduce((a, r) => a + r.amount, 0);
    return {
      establishmentId: emp.establishmentId,
      employer: emp.employer,
      from: monthKey(emp.doj),
      to: monthKey(emp.doe ?? emp.lastContributionMonth),
      months: months.size,
      employee: sum("employee"),
      employerShare: sum("employer"),
      pension: sum("pension"),
      hasExit: Boolean(emp.doe),
    };
  });
}

export function split(entries: PassbookEntry[]): Split[] {
  const types: EntryType[] = ["employee", "employer", "interest", "pension"];
  const totals = types.map((t) => ({ type: t, amount: entries.filter((e) => e.type === t).reduce((a, e) => a + e.amount, 0) }));
  const all = totals.reduce((a, t) => a + t.amount, 0) || 1;
  return totals.map((t) => ({ ...t, share: t.amount / all }));
}

/** Interest credited per financial year (Apr–Mar), keyed by the year it was posted in. */
export function interestByYear(entries: PassbookEntry[]): { year: string; amount: number }[] {
  const m = new Map<string, number>();
  for (const e of entries) if (e.type === "interest") m.set(e.month.slice(0, 4), (m.get(e.month.slice(0, 4)) ?? 0) + e.amount);
  return [...m.entries()].sort().map(([year, amount]) => ({ year, amount }));
}

/** Simple projection: average monthly net contribution over the last 12 contributing months × months ahead, plus 8.25 % p.a. on the balance. */
export function projectBalance(series: MonthPoint[], monthsAhead: number, ratePa = 0.0825): number {
  if (series.length === 0) return 0;
  const recent = series.slice(-12);
  const avg = recent.reduce((a, p) => a + p.employee + p.employer, 0) / recent.length;
  let bal = series[series.length - 1].balance;
  for (let i = 0; i < monthsAhead; i++) bal = bal * (1 + ratePa / 12) + avg;
  return Math.round(bal);
}
