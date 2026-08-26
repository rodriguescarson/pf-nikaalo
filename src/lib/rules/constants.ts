/**
 * Rule constants — EPFO / Income-tax figures as publicly documented, Aug 2026. INDICATIVE.
 * Every number here is cited on /how-it-works. Change here, never inline.
 */

/** §192A TDS on premature PF withdrawal (service < 5 years, claim > threshold). */
export const TDS_RATE_PAN = 0.1 as const;
export const TDS_RATE_NO_PAN = 0.2 as const;
export const TDS_THRESHOLD = 50_000;
export const TDS_EXEMPT_YEARS = 5;

/** Waiting periods after date of exit. */
export const WAIT_MONTHS_FINAL = 2; // Form 19 / 10C
export const WAIT_MONTHS_ADVANCE = 1; // Form 31 unemployment advance

/** Form 31 unemployment advance: up to 75 % of PF balance. */
export const ADVANCE_UNEMPLOYMENT_PCT = 0.75;

/** EPS: < 10 years → withdrawal benefit (Form 10C); ≥ 10 years → scheme certificate, pension at 58. */
export const EPS_SCHEME_CERT_YEARS = 10;
/** EPS withdrawal benefit is not payable below 6 months of service. */
export const EPS_MIN_MONTHS = 6;
/** EPS pensionable wage ceiling. */
export const EPS_WAGE_CEILING = 15_000;
/**
 * EPS Table D — withdrawal-benefit factor by completed years of service (indicative).
 * benefit = factor × min(last basic+DA, EPS_WAGE_CEILING)
 */
export const EPS_TABLE_D: Record<number, number> = {
  0: 0,
  1: 1.02,
  2: 1.99,
  3: 2.98,
  4: 3.99,
  5: 5.02,
  6: 6.07,
  7: 7.13,
  8: 8.22,
  9: 9.33,
};

/** UANs issued on/after this date can self-correct profile fields (name, DOB, DoE) without employer. */
export const SELF_SERVICE_UAN_SINCE = "2017-10-01";

/** Processing schedules (days after submission). */
export const FAST_TRACK_DAYS = 3;
export const OUTER_LIMIT_DAYS = 20;
export const FAST_TRACK_SCHEDULE = {
  SUBMITTED: 0,
  RECEIVED_FIELD_OFFICE: 0,
  UNDER_PROCESS: 1,
  APPROVED: 2,
  SETTLED: 3,
} as const;
export const STANDARD_SCHEDULE = {
  SUBMITTED: 0,
  RECEIVED_FIELD_OFFICE: 1,
  UNDER_PROCESS: 5,
  APPROVED: 12,
  SETTLED: 18,
} as const;
/** Forced rejections (seeded demo) surface on this day. */
export const REJECTION_DAY = 4;
/** Bank credit lands 1–2 days after SETTLED. */
export const CREDIT_LAG_DAYS: [number, number] = [1, 2];
