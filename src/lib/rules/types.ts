/**
 * PF Nikaalo rules engine — shared contract.
 * Everything here is PURE data. No I/O, no Date.now(), no randomness anywhere in src/lib/rules.
 * Dates are ISO "YYYY-MM-DD". Money is integer rupees.
 * Independent hackathon prototype: models EPFO rules as publicly documented (Aug 2026), indicative only.
 */

export type ISODate = string;
export type Lang = "en" | "hi";

/** What the citizen says they need, in plain language (triage screen). */
export type Intent =
  | "full_withdrawal" // "I left my job, I want all my PF money" → Form 19 (+10C optional)
  | "pension_withdrawal" // "Only the pension (EPS) part" → Form 10C / scheme certificate
  | "both" // "Everything — PF and pension" → Form 19 + 10C
  | "advance_unemployment"; // "I need money now, unemployed < 2 months" → Form 31 (75 % advance)

export type ClaimForm = "FORM_19" | "FORM_10C" | "FORM_31" | "SCHEME_CERTIFICATE";

export interface AadhaarRecord {
  name: string;
  dob: ISODate;
  gender: "M" | "F" | "O";
  /** Aadhaar is seeded AND verified against the UAN. */
  verified: boolean;
}

export interface PanRecord {
  seeded: boolean;
  verified: boolean;
  name?: string;
}

export type BankKycStatus = "verified" | "pending_employer" | "unverified" | "npci_failed";

export interface BankRecord {
  accountLast4: string;
  ifsc: string;
  nameOnAccount: string;
  kycStatus: BankKycStatus;
}

export interface Employment {
  establishmentId: string;
  employer: string;
  doj: ISODate;
  /** Date of exit. Missing = employer has not marked exit (the #1 real-world blocker). */
  doe?: ISODate;
  /** First day of the last month a contribution was received. */
  lastContributionMonth: ISODate;
  /** Monthly basic + DA at exit, rupees. Used for the EPS withdrawal benefit (capped at 15,000). */
  wageBasicDA: number;
}

export interface Passbook {
  employeeShare: number;
  employerShare: number;
  interest: number;
  epsContribution: number;
}

export interface PriorClaim {
  id: string;
  form: ClaimForm;
  status: "settled" | "rejected" | "pending";
  reasonCode?: RejectionCode;
  date: ISODate;
}

export interface Member {
  uan: string;
  name: string; // as on the EPFO record
  dob: ISODate;
  gender: "M" | "F" | "O";
  uanIssuedOn: ISODate;
  uanActive: boolean;
  eNomination: boolean;
  aadhaar: AadhaarRecord;
  pan: PanRecord;
  bank: BankRecord;
  employments: Employment[];
  passbook: Passbook;
  priorClaims: PriorClaim[];
}

export type CheckId =
  | "UAN_ACTIVE"
  | "AADHAAR_SEEDED"
  | "NAME_MATCH"
  | "DOB_MATCH"
  | "DOE_PRESENT"
  | "TWO_MONTH_WAIT"
  | "BANK_KYC"
  | "BANK_NAME_MATCH"
  | "PAN_SEEDED"
  | "NO_DUPLICATE_CLAIM"
  | "SERVICE_OVERLAP"
  | "EPS_ELIGIBLE"
  | "E_NOMINATION";

/** EPFO's own rejection vocabulary, normalised to codes. */
export type RejectionCode =
  | "NAME_MISMATCH"
  | "DOB_MISMATCH"
  | "DOE_NOT_AVAILABLE"
  | "BANK_KYC_NOT_VERIFIED"
  | "BANK_NAME_DIFFERS"
  | "PAN_NOT_VERIFIED"
  | "SERVICE_OVERLAP"
  | "CLAIM_ALREADY_SETTLED"
  | "WRONG_FORM"
  | "UNCLEAR_CHEQUE"
  | "PAYMENT_RETURNED"
  | "PENDING_WITH_EMPLOYER"
  | "EPS_NOT_ELIGIBLE"
  | "SIGNATURE_DIFFERS";

export type CheckStatus = "pass" | "fail" | "warn";
export type Actor = "member" | "employer" | "epfo" | "bank";
export type SimulatedAction = "MARK_EXIT" | "RESEED_BANK" | "UPDATE_PROFILE" | "SEED_PAN";

export interface Fix {
  actor: Actor;
  /** True when the member can do it alone on the portal (simulated here). */
  selfServe: boolean;
  /** i18n key of the step list, e.g. "fix.UPDATE_PROFILE.steps" */
  stepsKey: string;
  /** Expected days [min, max] until the fix reflects. */
  etaDays: [number, number];
  simulatedAction?: SimulatedAction;
}

export interface CheckResult {
  id: CheckId;
  status: CheckStatus;
  /** A blocking fail means EPFO would reject; submission is refused. */
  blocking: boolean;
  reasonCode?: RejectionCode;
  /** Human-readable evidence pairs shown on the card, e.g. { "EPFO record": "RAHUL VERMA", "Aadhaar": "Rahul Kumar Verma" } */
  evidence: Record<string, string>;
  fix?: Fix;
  /** i18n key of the plain-language message, e.g. "check.NAME_MATCH.fail" */
  messageKey: string;
}

export interface Preflight {
  checks: CheckResult[];
  canSubmit: boolean;
  rejectionRisk: "low" | "medium" | "high";
  blockingCodes: RejectionCode[];
  warnings: CheckId[];
}

export interface ServiceSummary {
  totalMonths: number;
  /** totalMonths / 12, rounded to 2 dp. */
  continuousYears: number;
  hasTransfers: boolean;
  /** Basic+DA of the most recent employment. */
  lastWage: number;
}

export interface FormSelection {
  forms: ClaimForm[];
  primary: ClaimForm;
  rationaleKey: string;
  notAllowed: { form: ClaimForm; reasonKey: string }[];
}

export interface AmountBreakdown {
  pfGross: number;
  employeeShare: number;
  employerShare: number;
  interest: number;
  /** Present only when FORM_10C is in the selection. */
  epsWithdrawalBenefit?: number;
  /** Present only when FORM_31 is in the selection. */
  advanceCap?: number;
  /** What the member will actually receive before TDS. */
  total: number;
}

export interface TdsInput {
  pfGross: number;
  continuousYears: number;
  panVerified: boolean;
  exemptReason?: "ill_health" | "employer_closed" | "beyond_control";
  /** Member declared Form 121 (replaces 15G/15H from 1 Apr 2026): income below taxable limit. */
  form121Declared: boolean;
}

export interface TdsResult {
  applicable: boolean;
  rate: 0 | 0.1 | 0.2;
  amount: number;
  net: number;
  reasonKey: string;
  /** True when a Form 121 declaration would remove TDS (i.e. TDS would otherwise apply). */
  form121Eligible: boolean;
}

export type StageId =
  | "SUBMITTED"
  | "RECEIVED_FIELD_OFFICE"
  | "UNDER_PROCESS"
  | "APPROVED"
  | "SETTLED"
  | "REJECTED";

export interface Claim {
  id: string;
  uan: string;
  forms: ClaimForm[];
  submittedAt: ISODate;
  /** All checks passed with no warnings → 3-day fast track; otherwise standard 20-day path. */
  fastTrack: boolean;
  amount: AmountBreakdown;
  tds: TdsResult;
  /** Seeded demo claims can be forced to reject at the schedule's rejection day. */
  forcedOutcome?: { stage: "REJECTED"; code: RejectionCode };
}

export interface StageEvent {
  stage: StageId;
  at: ISODate;
  /** i18n key: who is acting at this stage */
  actorKey: string;
  /** i18n key: what happens next */
  nextKey: string;
  expectedBy?: ISODate;
  done: boolean;
  current: boolean;
}

export interface RejectionExplanation {
  code: RejectionCode;
  /** i18n key of the plain-language meaning, e.g. "rejection.BANK_NAME_DIFFERS.plain" */
  plainKey: string;
  fix: Fix;
  refileAllowed: boolean;
}

export interface StatusView {
  events: StageEvent[];
  current: StageId;
  expectedCreditDate?: ISODate;
  rejection?: RejectionExplanation;
}
