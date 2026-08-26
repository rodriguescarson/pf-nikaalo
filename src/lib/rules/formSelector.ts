import { EPS_SCHEME_CERT_YEARS, WAIT_MONTHS_FINAL } from "./constants";
import { addMonths, endOfMonth } from "./normalize";
import type { ClaimForm, FormSelection, Intent, Member, ServiceSummary } from "./types";

const result = (forms: ClaimForm[], notAllowed: FormSelection["notAllowed"] = []): FormSelection => ({ forms, primary: forms[0], rationaleKey: `forms.rationale.${forms[0]}`, notAllowed });

export function selectForms(member: Member, intent: Intent, svc: ServiceSummary, asOf: string): FormSelection {
  const latest = member.employments.reduce((current, job) => !current || job.doj > current.doj ? job : current, undefined as Member["employments"][number] | undefined);
  const exit = latest?.doe ?? (latest ? endOfMonth(latest.lastContributionMonth) : asOf);
  const finalForms: ClaimForm[] = intent === "both" ? ["FORM_19", svc.totalMonths < 120 ? "FORM_10C" : "SCHEME_CERTIFICATE"]
    : intent === "full_withdrawal" ? ["FORM_19"]
    : intent === "pension_withdrawal" ? [svc.totalMonths < 120 ? "FORM_10C" : "SCHEME_CERTIFICATE"] : ["FORM_31"];
  if (intent !== "advance_unemployment" && asOf < addMonths(exit, WAIT_MONTHS_FINAL)) {
    return result(["FORM_31"], finalForms.map((form) => ({ form, reasonKey: "forms.notAllowed.wait" })));
  }
  const notAllowed = intent === "both" && svc.totalMonths >= EPS_SCHEME_CERT_YEARS * 12 ? [{ form: "FORM_10C" as const, reasonKey: "forms.notAllowed.tenYears" }] : [];
  return result(finalForms, notAllowed);
}
