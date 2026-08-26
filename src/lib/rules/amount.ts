import { ADVANCE_UNEMPLOYMENT_PCT, EPS_TABLE_D, EPS_WAGE_CEILING } from "./constants";
import type { AmountBreakdown, FormSelection, Member, ServiceSummary } from "./types";

export function computeAmount(member: Member, sel: FormSelection, svc: ServiceSummary): AmountBreakdown {
  const { employeeShare, employerShare, interest } = member.passbook;
  const pfGross = employeeShare + employerShare + interest;
  if (sel.forms.includes("FORM_31")) return { pfGross, employeeShare, employerShare, interest, advanceCap: Math.round(ADVANCE_UNEMPLOYMENT_PCT * pfGross), total: Math.round(ADVANCE_UNEMPLOYMENT_PCT * pfGross) };
  const epsWithdrawalBenefit = sel.forms.includes("FORM_10C") ? Math.round(EPS_TABLE_D[Math.min(9, Math.floor(svc.totalMonths / 12))] * Math.min(svc.lastWage, EPS_WAGE_CEILING)) : undefined;
  return { pfGross, employeeShare, employerShare, interest, ...(epsWithdrawalBenefit === undefined ? {} : { epsWithdrawalBenefit }), total: pfGross + (epsWithdrawalBenefit ?? 0) };
}
