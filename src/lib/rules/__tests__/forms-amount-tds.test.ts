import { describe, expect, it } from "vitest";
import { computeAmount, computeTds, selectForms, serviceSummary } from "@/lib/rules";
import { MEMBERS } from "@/mock/members";

const AS_OF = "2026-08-26";

describe("selectForms", () => {
  it("both + < 10 years → Form 19 + 10C, primary 19", () => {
    const m = MEMBERS["100000000001"];
    const sel = selectForms(m, "both", serviceSummary(m.employments, AS_OF), AS_OF);
    expect(sel.forms).toEqual(["FORM_19", "FORM_10C"]);
    expect(sel.primary).toBe("FORM_19");
    expect(sel.notAllowed).toEqual([]);
    expect(sel.rationaleKey).toMatch(/^forms\./);
  });
  it("both + ≥ 10 years → Form 19 + scheme certificate; 10C not allowed", () => {
    const m = structuredClone(MEMBERS["100000000001"]);
    m.employments = [{ ...m.employments[0], doj: "2014-01-01" }];
    const sel = selectForms(m, "both", serviceSummary(m.employments, AS_OF), AS_OF);
    expect(sel.forms).toEqual(["FORM_19", "SCHEME_CERTIFICATE"]);
    expect(sel.notAllowed.map((n) => n.form)).toEqual(["FORM_10C"]);
  });
  it("full_withdrawal → Form 19 only", () => {
    const m = MEMBERS["100000000002"];
    const sel = selectForms(m, "full_withdrawal", serviceSummary(m.employments, AS_OF), AS_OF);
    expect(sel.forms).toEqual(["FORM_19"]);
  });
  it("pension_withdrawal → Form 10C only", () => {
    const m = MEMBERS["100000000001"];
    const sel = selectForms(m, "pension_withdrawal", serviceSummary(m.employments, AS_OF), AS_OF);
    expect(sel.forms).toEqual(["FORM_10C"]);
    expect(sel.primary).toBe("FORM_10C");
  });
  it("advance_unemployment → Form 31 only", () => {
    const m = MEMBERS["100000000001"];
    const sel = selectForms(m, "advance_unemployment", serviceSummary(m.employments, AS_OF), AS_OF);
    expect(sel.forms).toEqual(["FORM_31"]);
  });
  it("full_withdrawal inside the 2-month wait → only Form 31 offered, Form 19 not allowed", () => {
    const m = MEMBERS["100000000001"]; // exit 2026-05-31
    const sel = selectForms(m, "full_withdrawal", serviceSummary(m.employments, "2026-07-10"), "2026-07-10");
    expect(sel.forms).toEqual(["FORM_31"]);
    expect(sel.notAllowed.map((n) => n.form)).toEqual(["FORM_19"]);
  });
});

describe("computeAmount", () => {
  it("PF gross is the sum of shares and interest; EPS benefit uses Table D × capped wage", () => {
    const m = MEMBERS["100000000001"];
    const svc = serviceSummary(m.employments, AS_OF); // 39 months → 3 completed years
    const sel = selectForms(m, "both", svc, AS_OF);
    const a = computeAmount(m, sel, svc);
    expect(a.pfGross).toBe(210_000);
    expect(a.employeeShare).toBe(96_000);
    expect(a.epsWithdrawalBenefit).toBe(Math.round(2.98 * 15_000)); // 44,700
    expect(a.total).toBe(210_000 + 44_700);
    expect(a.advanceCap).toBeUndefined();
  });
  it("Form 31 advance is capped at 75 % of PF gross and becomes the total", () => {
    const m = MEMBERS["100000000001"];
    const svc = serviceSummary(m.employments, AS_OF);
    const sel = selectForms(m, "advance_unemployment", svc, AS_OF);
    const a = computeAmount(m, sel, svc);
    expect(a.advanceCap).toBe(Math.round(0.75 * 210_000));
    expect(a.total).toBe(a.advanceCap);
    expect(a.epsWithdrawalBenefit).toBeUndefined();
  });
  it("Form 19 only → no EPS benefit", () => {
    const m = MEMBERS["100000000002"];
    const svc = serviceSummary(m.employments, AS_OF);
    const a = computeAmount(m, selectForms(m, "full_withdrawal", svc, AS_OF), svc);
    expect(a.epsWithdrawalBenefit).toBeUndefined();
    expect(a.total).toBe(320_000);
  });
  it("EPS wage is capped at 15,000 even when the last wage is higher", () => {
    const m = MEMBERS["100000000004"]; // last wage 40,000; ~6 completed years
    const svc = serviceSummary(m.employments, AS_OF);
    const a = computeAmount(m, selectForms(m, "both", svc, AS_OF), svc);
    expect(a.epsWithdrawalBenefit).toBe(Math.round(6.07 * 15_000));
  });
});

describe("computeTds", () => {
  const base = { pfGross: 210_000, continuousYears: 3.25, panVerified: true, form121Declared: false };
  it("< 5 years, > ₹50k, PAN → 10 %", () => {
    const t = computeTds(base);
    expect(t.applicable).toBe(true);
    expect(t.rate).toBe(0.1);
    expect(t.amount).toBe(21_000);
    expect(t.net).toBe(189_000);
    expect(t.form121Eligible).toBe(true);
  });
  it("no PAN → 20 %", () => {
    const t = computeTds({ ...base, panVerified: false });
    expect(t.rate).toBe(0.2);
    expect(t.amount).toBe(42_000);
  });
  it("≥ 5 years → exempt", () => {
    const t = computeTds({ ...base, continuousYears: 5 });
    expect(t.applicable).toBe(false);
    expect(t.rate).toBe(0);
    expect(t.net).toBe(210_000);
    expect(t.form121Eligible).toBe(false);
  });
  it("≤ ₹50,000 → exempt", () => {
    const t = computeTds({ ...base, pfGross: 50_000 });
    expect(t.applicable).toBe(false);
  });
  it("Form 121 declared → no TDS but still flagged eligible", () => {
    const t = computeTds({ ...base, form121Declared: true });
    expect(t.applicable).toBe(false);
    expect(t.amount).toBe(0);
    expect(t.form121Eligible).toBe(true);
  });
  it("exempt reasons remove TDS", () => {
    expect(computeTds({ ...base, exemptReason: "employer_closed" }).applicable).toBe(false);
    expect(computeTds({ ...base, exemptReason: "ill_health" }).applicable).toBe(false);
  });
  it("every result carries an i18n reasonKey", () => {
    for (const t of [computeTds(base), computeTds({ ...base, continuousYears: 6 }), computeTds({ ...base, panVerified: false })]) {
      expect(t.reasonKey).toMatch(/^tds\./);
    }
  });
});
