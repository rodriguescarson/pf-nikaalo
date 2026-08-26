import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO, COOKIE, COOKIE_OPTS } from "@/lib/session";
import { formatINR, makeT } from "@/i18n";
import { computeAmount, computeTds, runPreflight, selectForms, serviceSummary } from "@/lib/rules";
import type { Intent } from "@/lib/rules/types";
import { loadMember } from "@/mock/store";
import { Page, PageTitle, Sheet } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { Icon } from "@/components/Icon";
import { ClaimActions, Form121Toggle } from "./ClaimActions";

export const metadata = { title: "Your claim" };

async function setForm121(formData: FormData) {
  "use server";
  const on = formData.get("form121") === "on";
  (await cookies()).set("pfn_f121", on ? "1" : "0", COOKIE_OPTS);
}

export default async function ClaimPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const jar = await cookies();
  const intent = jar.get(COOKIE.intent)?.value as Intent | undefined;
  if (!intent) redirect("/start");
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const asOf = todayISO(await getDemoOffsetDays());
  const preflight = runPreflight(member, intent, asOf);
  if (!preflight.canSubmit) redirect("/check");
  const form121 = jar.get("pfn_f121")?.value === "1";
  const svc = serviceSummary(member.employments, asOf);
  const sel = selectForms(member, intent, svc, asOf);
  const amount = computeAmount(member, sel, svc);
  const tds = computeTds({ pfGross: amount.pfGross, continuousYears: svc.continuousYears, panVerified: member.pan.seeded && member.pan.verified, form121Declared: form121 });
  const t = makeT(lang);
  const inr = (n: number) => formatINR(n, lang);
  const years = svc.continuousYears.toFixed(1);

  const rows: { key: string; label: string; value: number; muted?: boolean }[] = [
    { key: "employeeShare", label: t("claim.employeeShare"), value: amount.employeeShare },
    { key: "employerShare", label: t("claim.employerShare"), value: amount.employerShare },
    { key: "interest", label: t("claim.interest"), value: amount.interest },
  ];

  return (
    <Page>
      <Stepper current="claim" lang={lang} minutes={2} />
      <PageTitle title={t("claim.title")} sub={t("claim.sub")} />
      <p className="text-sm text-ink-2 -mt-3 mb-5">
        {member.employments.length > 1 ? t("claim.serviceLine", { years, n: member.employments.length }) : t("claim.serviceLineOne", { years })}
      </p>

      {/* Forms */}
      <section aria-labelledby="forms-h">
        <h2 id="forms-h" className="t-label text-ink mb-2">
          {t("claim.formsChosen")}
        </h2>
        <Sheet ledger>
          <ul>
            {sel.forms.map((f, i) => (
              <li key={f} className="ledger-row">
              <div className="flex items-start justify-center pt-4 mark-tick">
                <Icon name="check" size={20} strokeWidth={2.5} />
              </div>
              <div className="px-4 py-3.5">
                <div className="t-label text-[0.9375rem] text-ink">{t(`forms.${f}`)}</div>
                <p className="mt-1 text-sm text-ink-2 leading-snug">
                  <span className="text-ink-3">{t("claim.why")}:</span> {t(`forms.rationale.${f}`)}
                </p>
              </div>
              <div className="pr-4 pt-4 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
              </li>
            ))}
            {sel.notAllowed.map((n) => (
              <li key={n.form} className="ledger-row bg-paper-2/60">
              <div className="flex items-start justify-center pt-4 text-ink-3">
                <Icon name="x" size={18} />
              </div>
              <div className="px-4 py-3.5">
                <div className="t-label text-[0.9375rem] text-ink-2">
                  {t("claim.notAllowedTitle")}: {t(`forms.${n.form}`)}
                </div>
                <p className="mt-1 text-sm text-ink-2 leading-snug">{t(n.reasonKey)}</p>
              </div>
              <div />
              </li>
            ))}
          </ul>
        </Sheet>
      </section>

      {/* Amount ledger */}
      <section aria-labelledby="amount-h" className="mt-7">
        <h2 id="amount-h" className="t-label text-ink mb-2">
          {t("claim.amountTitle")}
        </h2>
        <Sheet ledger className="overflow-hidden">
          {rows.map((r, i) => (
            <div key={r.key} className="ledger-row items-center min-h-[2.75rem]">
              <div className="flex items-center justify-center text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
              <div className="px-4 py-2 text-[0.9375rem] text-ink-2">{r.label}</div>
              <div className="pr-4 py-2 t-num text-[0.9375rem] text-ink tnum">{inr(r.value)}</div>
            </div>
          ))}
          <div className="ledger-row items-center min-h-[2.75rem] bg-paper-2/70">
            <div />
            <div className="px-4 py-2 t-label text-ink">{t("claim.pfGross")}</div>
            <div className="pr-4 py-2 t-num text-[1.0625rem] text-ink tnum">{inr(amount.pfGross)}</div>
          </div>
          {amount.epsWithdrawalBenefit != null ? (
            <div className="ledger-row items-start min-h-[2.75rem]">
              <div className="flex items-center justify-center text-ink-3 t-num text-sm pt-2.5">{String(rows.length + 1).padStart(2, "0")}</div>
              <div className="px-4 py-2">
                <div className="text-[0.9375rem] text-ink-2">{t("claim.epsBenefit")}</div>
                <div className="text-2xs text-ink-3 mt-0.5">{t("claim.epsNote", { years: Math.min(9, Math.floor(svc.totalMonths / 12)) })}</div>
              </div>
              <div className="pr-4 py-2 t-num text-[0.9375rem] text-ink tnum">{inr(amount.epsWithdrawalBenefit)}</div>
            </div>
          ) : null}
          {amount.advanceCap != null ? (
            <div className="ledger-row items-center min-h-[2.75rem]">
              <div className="flex items-center justify-center text-ink-3 t-num text-sm">{String(rows.length + 1).padStart(2, "0")}</div>
              <div className="px-4 py-2 text-[0.9375rem] text-ink-2">{t("claim.advanceCap")}</div>
              <div className="pr-4 py-2 t-num text-[0.9375rem] text-ink tnum">{inr(amount.advanceCap)}</div>
            </div>
          ) : null}
          <div className="ledger-row items-center min-h-[2.75rem]">
            <div className="flex items-center justify-center mark-x">
              <Icon name="alert" size={16} className={tds.applicable ? "" : "opacity-0"} />
            </div>
            <div className="px-4 py-2 text-[0.9375rem] text-ink-2">
              {t("claim.tds")}
              {tds.applicable ? <span className="text-ink-3"> · {Math.round(tds.rate * 100)}%</span> : null}
            </div>
            <div className={`pr-4 py-2 t-num text-[0.9375rem] tnum ${tds.applicable ? "mark-x" : "text-ink-3"}`}>{tds.applicable ? `− ${inr(tds.amount)}` : inr(0)}</div>
          </div>
          {/* Running total: the cloth strip */}
          <div className="cloth grid grid-cols-[3.25rem_1fr_auto] items-center min-h-[3.25rem]">
            <div />
            <div className="px-4 py-2 t-label text-white/90">{t("claim.net")}</div>
            <div className="pr-4 py-2 t-num text-[1.375rem] tnum">{inr(amount.total - tds.amount)}</div>
          </div>
        </Sheet>
      </section>

      {/* Tax */}
      <section aria-labelledby="tds-h" className="mt-7">
        <h2 id="tds-h" className="t-label text-ink mb-2">
          {t("claim.tdsTitle")}
        </h2>
        <Sheet className="p-4">
          <p className="text-[0.9375rem] text-ink leading-relaxed">{t(tds.reasonKey)}</p>
          <div className="mt-4 border-t border-rule pt-4">
            <h3 className="t-label text-ink">{t("claim.form121Title")}</h3>
            {tds.form121Eligible ? (
              <>
                <p className="mt-1 text-sm text-ink-2 leading-relaxed">{t("claim.form121Body")}</p>
                <Form121Toggle checked={form121} action={setForm121} label={t("claim.form121Toggle")} />
              </>
            ) : (
              <p className="mt-1 text-sm text-ink-2">{t("claim.form121Ineligible")}</p>
            )}
          </div>
        </Sheet>
      </section>

      {/* Bank */}
      <section aria-labelledby="bank-h" className="mt-7">
        <h2 id="bank-h" className="t-label text-ink mb-2">
          {t("claim.bankTitle")}
        </h2>
        <Sheet className="p-4 flex items-start gap-3">
          <Icon name="landmark" size={20} className="text-cloth mt-0.5 shrink-0" />
          <div>
            <div className="t-num text-[0.9375rem] text-ink tnum">{t("claim.bankLine", { last4: member.bank.accountLast4, ifsc: member.bank.ifsc })}</div>
            <div className="text-sm text-ink-2 mt-0.5">{member.bank.nameOnAccount} · {t("claim.bankNote")}</div>
          </div>
        </Sheet>
      </section>

      <ClaimActions />
    </Page>
  );
}
