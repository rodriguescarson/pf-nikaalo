import { describe, expect, it } from "vitest";
import { nameDiff, normalizeName, serviceSummary } from "@/lib/rules";
import { MEMBERS } from "@/mock/members";

describe("normalizeName", () => {
  it("lowercases, strips dots and collapses whitespace", () => {
    expect(normalizeName("  RAHUL   VERMA ")).toBe("rahul verma");
    expect(normalizeName("S. Pillai")).toBe("s pillai");
    expect(normalizeName("Priya  Sharma.")).toBe("priya sharma");
  });
});

describe("nameDiff", () => {
  it("exact when normalised names are equal", () => {
    expect(nameDiff("RAHUL VERMA", "Rahul Verma")).toBe("exact");
  });
  it("minor when one name is a token-subset of the other (missing middle name)", () => {
    expect(nameDiff("RAHUL VERMA", "Rahul Kumar Verma")).toBe("minor");
  });
  it("minor when an initial matches a full token", () => {
    expect(nameDiff("S. Pillai", "Suresh Pillai")).toBe("minor");
  });
  it("major on a spelling difference in a token", () => {
    expect(nameDiff("Rahul Varma", "Rahul Verma")).toBe("major");
    expect(nameDiff("Anita Desai", "Sunita Desai")).toBe("major");
  });
});

describe("serviceSummary", () => {
  it("sums months across employments and reports transfers", () => {
    const s = serviceSummary(MEMBERS["100000000002"].employments, "2026-08-26");
    // contribution months inclusive: Sarthak Jun-2022..Mar-2024 = 22; Kite Apr-2024..May-2026 = 26
    expect(s.totalMonths).toBe(48);
    expect(s.continuousYears).toBe(4);
    expect(s.hasTransfers).toBe(true);
    expect(s.lastWage).toBe(32_000);
  });
  it("uses lastContributionMonth when date of exit is missing", () => {
    const s = serviceSummary(MEMBERS["100000000003"].employments, "2026-08-26");
    // 2020-01-06 → 2026-04-01 ≈ 75 months (counting the last contribution month)
    expect(s.totalMonths).toBeGreaterThanOrEqual(74);
    expect(s.totalMonths).toBeLessThanOrEqual(76);
    expect(s.hasTransfers).toBe(false);
    expect(s.continuousYears).toBeGreaterThan(5);
  });
  it("single short employment", () => {
    const s = serviceSummary(MEMBERS["100000000001"].employments, "2026-08-26");
    expect(s.totalMonths).toBe(39);
    expect(s.continuousYears).toBeLessThan(5);
  });
});
