import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO, COOKIE } from "@/lib/session";
import { formatINR, makeT } from "@/i18n";
import { computeAmount, computeTds, runPreflight, selectForms, serviceSummary } from "@/lib/rules";
import type { Intent } from "@/lib/rules/types";
import { loadMember } from "@/mock/store";
import { Page, PageTitle, Sheet } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { Icon } from "@/components/Icon";
import { ReviewForm } from "./ReviewForm";

export const metadata = { title: "Review and file" };

export default async function ReviewPage() {
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
  const fastTrack = preflight.checks.every((c) => c.status === "pass");
  const t = makeT(lang);
  const inr = (n: number) => formatINR(n, lang);

  const lines: [string, string][] = [
    [t("review.member"), `${member.name} · ${t("common.uan")} ${uan}`],
    [t("review.forms"), sel.forms.map((f) => t(`forms.${f}`)).join(" + ")],
    [t("review.amount"), inr(amount.total - tds.amount)],
    [t("review.tds"), tds.applicable ? `${inr(tds.amount)} (${Math.round(tds.rate * 100)}%)` : inr(0)],
    [t("review.bank"), t("claim.bankLine", { last4: member.bank.accountLast4, ifsc: member.bank.ifsc })],
  ];

  return (
    <Page>
      <Stepper current="review" lang={lang} minutes={1} />
      <PageTitle title={t("review.title")} sub={t("review.sub")} />
      <Sheet ledger>
        {lines.map(([k, v], i) => (
          <div key={k} className="ledger-row items-start">
            <div className="flex items-center justify-center pt-3.5 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
            <div className="px-4 py-3 text-sm text-ink-2">{k}</div>
            <div className="pr-4 py-3 text-[0.9375rem] text-ink text-right max-w-[16rem] tnum">{v}</div>
          </div>
        ))}
      </Sheet>
      <p className="mt-4 flex items-start gap-2 text-sm text-ink-2 leading-relaxed">
        <Icon name={fastTrack ? "shield" : "clock"} size={18} className={`shrink-0 mt-0.5 ${fastTrack ? "text-tick" : "text-ink-3"}`} />
        {t(fastTrack ? "review.fastTrack" : "review.standard")}
      </p>
      <ReviewForm uan={uan} intent={intent} form121={form121} />
    </Page>
  );
}
