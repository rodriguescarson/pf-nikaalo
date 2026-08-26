import { TDS_EXEMPT_YEARS, TDS_RATE_NO_PAN, TDS_RATE_PAN, TDS_THRESHOLD } from "./constants";
import type { TdsInput, TdsResult } from "./types";

export function computeTds(input: TdsInput): TdsResult {
  const underFiveYears = input.continuousYears < TDS_EXEMPT_YEARS;
  const aboveThreshold = input.pfGross > TDS_THRESHOLD;
  const form121Eligible = underFiveYears && aboveThreshold && !input.exemptReason;
  const applicable = form121Eligible && !input.form121Declared;
  const rate = applicable ? (input.panVerified ? TDS_RATE_PAN : TDS_RATE_NO_PAN) : 0;
  const amount = Math.round(rate * input.pfGross);
  const reasonKey = !underFiveYears ? "tds.exempt.fiveYears" : !aboveThreshold ? "tds.exempt.threshold" : input.exemptReason ? "tds.exempt.reason" : input.form121Declared ? "tds.exempt.form121" : input.panVerified ? "tds.under5yrs.pan" : "tds.under5yrs.noPan";
  return { applicable, rate, amount, net: input.pfGross - amount, reasonKey, form121Eligible };
}
