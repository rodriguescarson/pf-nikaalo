import { SELF_SERVICE_UAN_SINCE } from "./constants";
import type { Actor, Fix, Member, RejectionCode, RejectionExplanation, SimulatedAction } from "./types";

type FixSubject = RejectionCode | SimulatedAction;

const fixed = (actor: Actor, selfServe: boolean, etaDays: [number, number], simulatedAction?: SimulatedAction): Fix => ({
  actor, selfServe, etaDays, simulatedAction, stepsKey: `fix.${simulatedAction ?? ""}.steps`,
});

export function fixFor(subject: FixSubject, member: Member | null = null, _asOf?: string): Fix {
  const profile = subject === "NAME_MISMATCH" || subject === "DOB_MISMATCH" || subject === "UPDATE_PROFILE";
  if (profile) {
    const selfServe = member ? member.uanIssuedOn >= SELF_SERVICE_UAN_SINCE : true;
    return fixed(selfServe ? "member" : "employer", selfServe, [1, 3], "UPDATE_PROFILE");
  }
  switch (subject) {
    case "DOE_NOT_AVAILABLE": case "MARK_EXIT": return fixed("member", true, [0, 1], "MARK_EXIT");
    case "BANK_KYC_NOT_VERIFIED": case "BANK_NAME_DIFFERS": case "UNCLEAR_CHEQUE": case "PAYMENT_RETURNED": case "RESEED_BANK":
      return fixed("member", true, [1, 3], "RESEED_BANK");
    case "PAN_NOT_VERIFIED": case "SEED_PAN": return fixed("member", true, [0, 1], "SEED_PAN");
    case "SERVICE_OVERLAP": case "PENDING_WITH_EMPLOYER": return { ...fixed("employer", false, [7, 30]), stepsKey: `fix.${subject}.steps` };
    case "CLAIM_ALREADY_SETTLED": return { ...fixed("epfo", false, [0, 0]), stepsKey: "fix.CLAIM_ALREADY_SETTLED.steps" };
    case "WRONG_FORM": return { ...fixed("member", true, [0, 0]), stepsKey: "fix.WRONG_FORM.steps" };
    case "EPS_NOT_ELIGIBLE": return { ...fixed("epfo", false, [0, 0]), stepsKey: "fix.EPS_NOT_ELIGIBLE.steps" };
    case "SIGNATURE_DIFFERS": return { ...fixed("member", true, [1, 3]), stepsKey: "fix.SIGNATURE_DIFFERS.steps" };
  }
}

export function explainRejection(code: RejectionCode, member: Member | null): RejectionExplanation {
  return {
    code,
    plainKey: `rejection.${code}.plain`,
    fix: fixFor(code, member),
    refileAllowed: code !== "CLAIM_ALREADY_SETTLED",
  };
}
