import type { Employment, ISODate, ServiceSummary } from "./types";

export function normalizeName(name: string): string {
  return name.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();
}

export function nameDiff(a: string, b: string): "exact" | "minor" | "major" {
  const left = normalizeName(a).split(" ").filter(Boolean);
  const right = normalizeName(b).split(" ").filter(Boolean);
  if (left.join(" ") === right.join(" ")) return "exact";
  const [shorter, longer] = left.length <= right.length ? [left, right] : [right, left];
  if (shorter.every((token) => longer.includes(token))) return "minor";
  if (shorter.every((token) => longer.some((candidate) => candidate === token || candidate[0] === token))) {
    return "minor";
  }
  return "major";
}

function parts(date: ISODate): [number, number, number] {
  const [year, month, day] = date.split("-").map(Number);
  return [year, month, day];
}

function iso(year: number, month: number, day: number): ISODate {
  return `${year.toString().padStart(4, "0")}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

function daysInMonth(year: number, month: number): number {
  if (month === 2) return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0) ? 29 : 28;
  return [4, 6, 9, 11].includes(month) ? 30 : 31;
}

export function endOfMonth(date: ISODate): ISODate {
  const [year, month] = parts(date);
  return iso(year, month, daysInMonth(year, month));
}

export function addMonths(date: ISODate, amount: number): ISODate {
  const [year, month, day] = parts(date);
  const absoluteMonth = year * 12 + (month - 1) + amount;
  const nextYear = Math.floor(absoluteMonth / 12);
  const nextMonth = (absoluteMonth % 12) + 1;
  return iso(nextYear, nextMonth, Math.min(day, daysInMonth(nextYear, nextMonth)));
}

export function addDays(date: ISODate, amount: number): ISODate {
  let [year, month, day] = parts(date);
  let remaining = amount;
  while (remaining > 0) {
    const end = daysInMonth(year, month);
    if (day + remaining <= end) return iso(year, month, day + remaining);
    remaining -= end - day + 1;
    day = 1;
    if (month === 12) { year += 1; month = 1; } else month += 1;
  }
  while (remaining < 0) {
    if (day + remaining >= 1) return iso(year, month, day + remaining);
    remaining += day;
    if (month === 1) { year -= 1; month = 12; } else month -= 1;
    day = daysInMonth(year, month);
  }
  return iso(year, month, day);
}

/** Whole calendar-month distance, ignoring the day portion. */
export function monthsBetween(start: ISODate, end: ISODate): number {
  const [startYear, startMonth] = parts(start);
  const [endYear, endMonth] = parts(end);
  return (endYear - startYear) * 12 + endMonth - startMonth;
}

export function serviceSummary(employments: Employment[], _asOf: ISODate): ServiceSummary {
  const totalMonths = employments.reduce((sum, employment) =>
    sum + monthsBetween(employment.doj, employment.doe ?? employment.lastContributionMonth) + 1, 0);
  const latest = employments.reduce<Employment | undefined>((current, employment) =>
    !current || employment.doj > current.doj ? employment : current, undefined);
  return {
    totalMonths,
    continuousYears: Math.round((totalMonths / 12) * 100) / 100,
    hasTransfers: employments.length > 1,
    lastWage: latest?.wageBasicDA ?? 0,
  };
}
