import { describe, expect, it } from "vitest";
import { applyFix, runPreflight } from "@/lib/rules";
import type { Member } from "@/lib/rules/types";
import { MEMBERS } from "@/mock/members";

const AS_OF = "2026-08-26";
const byId = (p: ReturnType<typeof runPreflight>, id: string) => p.checks.find((c) => c.id === id)!;

describe("runPreflight — seeded members", () => {
  it("runs all 13 checks in a stable order", () => {
    const p = runPreflight(MEMBERS["100000000001"], "full_withdrawal", AS_OF);
    expect(p.checks.map((c) => c.id)).toEqual([
      "UAN_ACTIVE",
      "AADHAAR_SEEDED",
      "NAME_MATCH",
      "DOB_MATCH",
      "DOE_PRESENT",
      "TWO_MONTH_WAIT",
      "BANK_KYC",
      "BANK_NAME_MATCH",
      "PAN_SEEDED",
      "NO_DUPLICATE_CLAIM",
      "SERVICE_OVERLAP",
      "EPS_ELIGIBLE",
      "E_NOMINATION",
    ]);
    for (const c of p.checks) expect(c.messageKey).toMatch(/^check\.[A-Z_]+\.(pass|fail|warn)$/);
  });

  it("Priya (clean) can submit with low risk", () => {
    const p = runPreflight(MEMBERS["100000000001"], "both", AS_OF);
    expect(p.canSubmit).toBe(true);
    expect(p.rejectionRisk).toBe("low");
    expect(p.blockingCodes).toEqual([]);
    expect(p.checks.every((c) => c.status === "pass")).toBe(true);
  });

  it("Rahul fails NAME_MATCH (blocking) with evidence and a self-serve fix", () => {
    const p = runPreflight(MEMBERS["100000000002"], "full_withdrawal", AS_OF);
    const c = byId(p, "NAME_MATCH");
    expect(c.status).toBe("fail");
    expect(c.blocking).toBe(true);
    expect(c.reasonCode).toBe("NAME_MISMATCH");
    expect(Object.values(c.evidence)).toEqual(expect.arrayContaining(["RAHUL VERMA", "Rahul Kumar Verma"]));
    expect(c.fix?.selfServe).toBe(true); // UAN issued 2022 → self-service profile correction
    expect(c.fix?.actor).toBe("member");
    expect(c.fix?.simulatedAction).toBe("UPDATE_PROFILE");
    expect(p.canSubmit).toBe(false);
    expect(p.rejectionRisk).toBe("high");
    expect(p.blockingCodes).toEqual(["NAME_MISMATCH"]);
    // everything else is clean
    expect(p.checks.filter((x) => x.status !== "pass").map((x) => x.id)).toEqual(["NAME_MATCH"]);
  });

  it("Fatima fails DOE_PRESENT with a self-serve Mark Exit (> 2 months since last contribution) and warns on PAN", () => {
    const p = runPreflight(MEMBERS["100000000003"], "full_withdrawal", AS_OF);
    const doe = byId(p, "DOE_PRESENT");
    expect(doe.status).toBe("fail");
    expect(doe.blocking).toBe(true);
    expect(doe.reasonCode).toBe("DOE_NOT_AVAILABLE");
    expect(doe.fix?.selfServe).toBe(true);
    expect(doe.fix?.simulatedAction).toBe("MARK_EXIT");
    const pan = byId(p, "PAN_SEEDED");
    expect(pan.status).toBe("warn");
    expect(pan.blocking).toBe(false);
    expect(pan.fix?.simulatedAction).toBe("SEED_PAN");
    const enom = byId(p, "E_NOMINATION");
    expect(enom.status).toBe("warn");
    expect(p.canSubmit).toBe(false);
    expect(p.warnings).toEqual(expect.arrayContaining(["PAN_SEEDED", "E_NOMINATION"]));
  });

  it("Fatima's Mark Exit needs the employer when fewer than 2 months have passed", () => {
    const p = runPreflight(MEMBERS["100000000003"], "full_withdrawal", "2026-05-10");
    const doe = byId(p, "DOE_PRESENT");
    expect(doe.status).toBe("fail");
    expect(doe.fix?.selfServe).toBe(false);
    expect(doe.fix?.actor).toBe("employer");
  });

  it("Suresh fails BANK_KYC (NPCI failed) with a re-seed fix; bank name is only a warning", () => {
    const p = runPreflight(MEMBERS["100000000004"], "both", AS_OF);
    const kyc = byId(p, "BANK_KYC");
    expect(kyc.status).toBe("fail");
    expect(kyc.blocking).toBe(true);
    expect(kyc.reasonCode).toBe("BANK_KYC_NOT_VERIFIED");
    expect(kyc.fix?.simulatedAction).toBe("RESEED_BANK");
    const bn = byId(p, "BANK_NAME_MATCH");
    expect(bn.status).toBe("warn"); // "S. Pillai" vs "Suresh Pillai" = initial match
    expect(p.canSubmit).toBe(false);
  });
});

describe("runPreflight — rules", () => {
  const priya = () => structuredClone(MEMBERS["100000000001"]) as Member;

  it("TWO_MONTH_WAIT fails for final settlement inside 2 months of exit, but passes for an unemployment advance after 1 month", () => {
    const m = priya();
    // exit 2026-05-31; asOf 2026-07-10 = 1 month 10 days
    const full = runPreflight(m, "full_withdrawal", "2026-07-10");
    expect(full.checks.find((c) => c.id === "TWO_MONTH_WAIT")?.status).toBe("fail");
    expect(full.canSubmit).toBe(false);
    const adv = runPreflight(m, "advance_unemployment", "2026-07-10");
    expect(adv.checks.find((c) => c.id === "TWO_MONTH_WAIT")?.status).toBe("pass");
    expect(adv.canSubmit).toBe(true);
  });

  it("a pending prior claim blocks a duplicate", () => {
    const m = priya();
    m.priorClaims = [{ id: "CLM-X", form: "FORM_19", status: "pending", date: "2026-08-01" }];
    const p = runPreflight(m, "full_withdrawal", AS_OF);
    const c = p.checks.find((x) => x.id === "NO_DUPLICATE_CLAIM")!;
    expect(c.status).toBe("fail");
    expect(c.blocking).toBe(true);
    expect(c.reasonCode).toBe("PENDING_WITH_EMPLOYER");
  });

  it("an already-settled Form 19 blocks another final settlement", () => {
    const m = priya();
    m.priorClaims = [{ id: "CLM-Y", form: "FORM_19", status: "settled", date: "2026-07-01" }];
    const p = runPreflight(m, "full_withdrawal", AS_OF);
    const c = p.checks.find((x) => x.id === "NO_DUPLICATE_CLAIM")!;
    expect(c.status).toBe("fail");
    expect(c.reasonCode).toBe("CLAIM_ALREADY_SETTLED");
  });

  it("DOB mismatch is blocking with an employer/EPFO fix for old UANs", () => {
    const m = priya();
    m.aadhaar.dob = "1997-04-21";
    m.uanIssuedOn = "2016-05-01";
    const p = runPreflight(m, "full_withdrawal", AS_OF);
    const c = p.checks.find((x) => x.id === "DOB_MATCH")!;
    expect(c.status).toBe("fail");
    expect(c.reasonCode).toBe("DOB_MISMATCH");
    expect(c.fix?.selfServe).toBe(false);
  });

  it("overlapping employments fail SERVICE_OVERLAP with an employer fix", () => {
    const m = priya();
    m.employments.push({
      establishmentId: "X",
      employer: "Overlap Co",
      doj: "2026-01-01",
      doe: "2026-07-31",
      lastContributionMonth: "2026-07-01",
      wageBasicDA: 20_000,
    });
    const p = runPreflight(m, "full_withdrawal", AS_OF);
    const c = p.checks.find((x) => x.id === "SERVICE_OVERLAP")!;
    expect(c.status).toBe("fail");
    expect(c.reasonCode).toBe("SERVICE_OVERLAP");
    expect(c.fix?.actor).toBe("employer");
  });

  it("EPS_ELIGIBLE warns (not blocks) with ≥ 10 years of service for pension withdrawal", () => {
    const m = priya();
    m.employments = [{ ...m.employments[0], doj: "2014-01-01", doe: "2026-05-31", lastContributionMonth: "2026-05-01" }];
    const p = runPreflight(m, "both", AS_OF);
    const c = p.checks.find((x) => x.id === "EPS_ELIGIBLE")!;
    expect(c.status).toBe("warn");
    expect(c.blocking).toBe(false);
    expect(p.canSubmit).toBe(true);
    expect(p.rejectionRisk).toBe("medium");
  });

  it("missing PAN is a warning, not a block", () => {
    const m = priya();
    m.pan = { seeded: false, verified: false };
    const p = runPreflight(m, "full_withdrawal", AS_OF);
    expect(p.checks.find((x) => x.id === "PAN_SEEDED")?.status).toBe("warn");
    expect(p.canSubmit).toBe(true);
  });
});

describe("applyFix", () => {
  it("UPDATE_PROFILE aligns the EPFO name with Aadhaar and clears Rahul's block", () => {
    const fixed = applyFix(MEMBERS["100000000002"], "UPDATE_PROFILE", AS_OF);
    expect(fixed.name).toBe("Rahul Kumar Verma");
    expect(runPreflight(fixed, "full_withdrawal", AS_OF).canSubmit).toBe(true);
    // pure: original untouched
    expect(MEMBERS["100000000002"].name).toBe("RAHUL VERMA");
  });
  it("MARK_EXIT sets the date of exit to the end of the last contribution month", () => {
    const fixed = applyFix(MEMBERS["100000000003"], "MARK_EXIT", AS_OF);
    expect(fixed.employments[0].doe).toBe("2026-04-30");
    const p = runPreflight(fixed, "full_withdrawal", AS_OF);
    expect(p.checks.find((c) => c.id === "DOE_PRESENT")?.status).toBe("pass");
    expect(p.canSubmit).toBe(true); // PAN warn remains, not blocking
  });
  it("RESEED_BANK verifies the bank and aligns the account name", () => {
    const fixed = applyFix(MEMBERS["100000000004"], "RESEED_BANK", AS_OF);
    expect(fixed.bank.kycStatus).toBe("verified");
    expect(fixed.bank.nameOnAccount).toBe("Suresh Pillai");
    expect(runPreflight(fixed, "both", AS_OF).canSubmit).toBe(true);
  });
  it("SEED_PAN seeds and verifies PAN", () => {
    const fixed = applyFix(MEMBERS["100000000003"], "SEED_PAN", AS_OF);
    expect(fixed.pan.seeded && fixed.pan.verified).toBe(true);
  });
});
