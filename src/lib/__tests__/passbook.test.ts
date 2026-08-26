import { describe, expect, it } from "vitest";
import { buildPassbook } from "@/lib/passbook";
import { MEMBERS } from "@/mock/members";

describe("buildPassbook", () => {
  it("reconciles every seeded employee, employer, pension, and interest total within ±3 rupees", () => {
    for (const member of Object.values(MEMBERS)) {
      const entries = buildPassbook(member);
      const sum = (type: string) => entries.filter((e) => e.type === type).reduce((a, e) => a + e.amount, 0);
      expect(Math.abs(sum("employee") - member.passbook.employeeShare)).toBeLessThanOrEqual(3);
      expect(Math.abs(sum("employer") - member.passbook.employerShare)).toBeLessThanOrEqual(3);
      expect(Math.abs(sum("pension") - member.passbook.epsContribution)).toBeLessThanOrEqual(3);
      expect(Math.abs(sum("interest") - member.passbook.interest)).toBeLessThanOrEqual(3);
    }
  });

  it.each(Object.values(MEMBERS))("sorts and attributes $name's entries", (member) => {
    const entries = buildPassbook(member);
    const establishmentIds = new Set(member.employments.map((employment) => employment.establishmentId));

    expect(entries.map((entry) => entry.month)).toEqual([...entries.map((entry) => entry.month)].sort());
    expect(entries.every((entry) => establishmentIds.has(entry.establishmentId))).toBe(true);
    expect(entries.every((entry) => entry.amount >= 0)).toBe(true);
  });

  it("includes Rahul's two employers", () => {
    const employers = new Set(buildPassbook(MEMBERS["100000000002"]).map((entry) => entry.employer));
    expect(employers).toEqual(new Set(MEMBERS["100000000002"].employments.map((employment) => employment.employer)));
  });

  it("ends Fatima's ledger in April 2026", () => {
    const entries = buildPassbook(MEMBERS["100000000003"]);
    expect(entries.at(-1)?.month).toBe("2026-04");
  });
});
