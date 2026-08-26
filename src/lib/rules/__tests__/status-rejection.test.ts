import { describe, expect, it } from "vitest";
import { deriveStatus, explainRejection } from "@/lib/rules";
import type { Claim, RejectionCode } from "@/lib/rules/types";
import { MEMBERS } from "@/mock/members";

const claim = (over: Partial<Claim> = {}): Claim => ({
  id: "CLM-TEST",
  uan: "100000000001",
  forms: ["FORM_19", "FORM_10C"],
  submittedAt: "2026-08-26",
  fastTrack: true,
  amount: { pfGross: 210_000, employeeShare: 96_000, employerShare: 78_000, interest: 36_000, epsWithdrawalBenefit: 44_700, total: 254_700 },
  tds: { applicable: true, rate: 0.1, amount: 21_000, net: 189_000, reasonKey: "tds.under5yrs.pan", form121Eligible: true },
  ...over,
});

describe("deriveStatus — fast track", () => {
  it("day 0: submitted + received, under process is next", () => {
    const s = deriveStatus(claim(), "2026-08-26");
    expect(s.events.map((e) => e.stage)).toEqual(["SUBMITTED", "RECEIVED_FIELD_OFFICE", "UNDER_PROCESS", "APPROVED", "SETTLED"]);
    expect(s.current).toBe("RECEIVED_FIELD_OFFICE");
    const cur = s.events.find((e) => e.current)!;
    expect(cur.stage).toBe("RECEIVED_FIELD_OFFICE");
    expect(cur.expectedBy).toBe("2026-08-27"); // next stage date
    expect(s.events.filter((e) => e.done).length).toBe(2);
    expect(s.rejection).toBeUndefined();
    expect(s.expectedCreditDate).toBeUndefined();
  });
  it("day 1: under process", () => {
    expect(deriveStatus(claim(), "2026-08-27").current).toBe("UNDER_PROCESS");
  });
  it("day 3: settled with a credit date 1–2 days later", () => {
    const s = deriveStatus(claim(), "2026-08-29");
    expect(s.current).toBe("SETTLED");
    expect(s.events.every((e) => e.done)).toBe(true);
    expect(["2026-08-30", "2026-08-31"]).toContain(s.expectedCreditDate);
  });
  it("events are monotonic and dated, each with actor/next keys", () => {
    const s = deriveStatus(claim(), "2026-08-27");
    const dates = s.events.map((e) => e.at);
    expect([...dates].sort()).toEqual(dates);
    for (const e of s.events) {
      expect(e.actorKey).toMatch(/^status\.[A-Z_]+\.actor$/);
      expect(e.nextKey).toMatch(/^status\.[A-Z_]+\.next$/);
    }
  });
});

describe("deriveStatus — standard path", () => {
  it("follows the 0/1/5/12/18 schedule", () => {
    const c = claim({ fastTrack: false });
    expect(deriveStatus(c, "2026-08-26").current).toBe("SUBMITTED");
    expect(deriveStatus(c, "2026-08-27").current).toBe("RECEIVED_FIELD_OFFICE");
    expect(deriveStatus(c, "2026-08-31").current).toBe("UNDER_PROCESS");
    expect(deriveStatus(c, "2026-09-07").current).toBe("APPROVED");
    expect(deriveStatus(c, "2026-09-13").current).toBe("SETTLED");
  });
});

describe("deriveStatus — forced rejection", () => {
  const c = claim({ fastTrack: false, forcedOutcome: { stage: "REJECTED", code: "BANK_NAME_DIFFERS" } });
  it("before the rejection day it looks like a normal claim", () => {
    const s = deriveStatus(c, "2026-08-28");
    expect(s.current).toBe("RECEIVED_FIELD_OFFICE");
    expect(s.rejection).toBeUndefined();
  });
  it("on/after day 4 it is rejected with an explanation and no later stages", () => {
    const s = deriveStatus(c, "2026-08-30");
    expect(s.current).toBe("REJECTED");
    expect(s.events.map((e) => e.stage)).toEqual(["SUBMITTED", "RECEIVED_FIELD_OFFICE", "REJECTED"]);
    expect(s.rejection?.code).toBe("BANK_NAME_DIFFERS");
    expect(s.rejection?.fix.simulatedAction).toBe("RESEED_BANK");
    expect(s.rejection?.refileAllowed).toBe(true);
    expect(s.expectedCreditDate).toBeUndefined();
  });
});

describe("explainRejection", () => {
  const ALL: RejectionCode[] = [
    "NAME_MISMATCH",
    "DOB_MISMATCH",
    "DOE_NOT_AVAILABLE",
    "BANK_KYC_NOT_VERIFIED",
    "BANK_NAME_DIFFERS",
    "PAN_NOT_VERIFIED",
    "SERVICE_OVERLAP",
    "CLAIM_ALREADY_SETTLED",
    "WRONG_FORM",
    "UNCLEAR_CHEQUE",
    "PAYMENT_RETURNED",
    "PENDING_WITH_EMPLOYER",
    "EPS_NOT_ELIGIBLE",
    "SIGNATURE_DIFFERS",
  ];
  it("maps every code to a plain-language key and a fix", () => {
    for (const code of ALL) {
      const r = explainRejection(code, MEMBERS["100000000004"]);
      expect(r.code).toBe(code);
      expect(r.plainKey).toBe(`rejection.${code}.plain`);
      expect(r.fix.stepsKey).toMatch(/^fix\.[A-Z_]+\.steps$/);
      expect(["member", "employer", "epfo", "bank"]).toContain(r.fix.actor);
      expect(r.fix.etaDays[0]).toBeLessThanOrEqual(r.fix.etaDays[1]);
    }
  });
  it("CLAIM_ALREADY_SETTLED cannot be re-filed; most others can", () => {
    expect(explainRejection("CLAIM_ALREADY_SETTLED", MEMBERS["100000000001"]).refileAllowed).toBe(false);
    expect(explainRejection("NAME_MISMATCH", MEMBERS["100000000002"]).refileAllowed).toBe(true);
  });
  it("self-service depends on UAN age for profile fixes", () => {
    expect(explainRejection("NAME_MISMATCH", MEMBERS["100000000002"]).fix.selfServe).toBe(true); // UAN 2022
    const old = structuredClone(MEMBERS["100000000002"]);
    old.uanIssuedOn = "2016-01-01";
    expect(explainRejection("NAME_MISMATCH", old).fix.selfServe).toBe(false);
  });
});
