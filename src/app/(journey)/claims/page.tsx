import { redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO } from "@/lib/session";
import { makeT } from "@/i18n";
import { deriveStatus } from "@/lib/rules";
import { loadMember } from "@/mock/store";
import { allClaimsFor } from "@/lib/claims";
import { Page, PageTitle } from "@/components/Sheet";
import { ClaimsList, type ClaimRow } from "./ClaimsList";
import { formatINR } from "@/i18n";

export const metadata = { title: "My claims" };

export default async function ClaimsPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const today = todayISO(await getDemoOffsetDays());
  const t = makeT(lang);
  const rows: ClaimRow[] = (await allClaimsFor(member)).map((c) => {
    const s = deriveStatus(c, today);
    const bucket = s.current === "REJECTED" ? "rejected" : s.current === "SETTLED" ? "settled" : "pending";
    return {
      id: c.id,
      submittedAt: c.submittedAt,
      forms: c.forms.map((f) => t(`forms.${f}`).split(" · ")[0]).join(" + "),
      stage: s.current,
      stageLabel: t(`status.${s.current}.title`),
      bucket,
      net: c.amount.total - c.tds.amount,
    };
  });
  const settled = rows.filter((r) => r.bucket === "settled");
  const pending = rows.filter((r) => r.bucket === "pending");
  const rejectedRows = rows.filter((r) => r.bucket === "rejected");
  const kpis = [
    { label: t("claims.kpiTotal"), value: String(rows.length), tone: "dark" },
    { label: t("claims.kpiPending"), value: String(pending.length), sub: pending.length ? `${t("claims.kpiPendingAmount")} · ${formatINR(pending.reduce((a, r) => a + r.net, 0), lang)}` : undefined },
    { label: t("claims.kpiSettled"), value: String(settled.length), sub: settled.length ? `${t("claims.kpiAmount")} · ${formatINR(settled.reduce((a, r) => a + r.net, 0), lang)}` : undefined },
    { label: t("claims.kpiRejected"), value: String(rejectedRows.length) },
  ];
  return (
    <Page>
      <PageTitle title={t("claims.title")} sub={t("claims.sub")} />
      {rows.length ? (
        <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {kpis.map((k) => (
            <div key={k.label} className={`rounded-[var(--radius-sheet)] px-3.5 py-3 ${k.tone === "dark" ? "cloth" : "sheet"}`}>
              <div className={`text-2xs ${k.tone === "dark" ? "text-white/70" : "text-ink-3"}`}>{k.label}</div>
              <div className={`mt-0.5 t-num text-[1.5rem] leading-none tnum ${k.tone === "dark" ? "text-lime" : "text-ink"}`}>{k.value}</div>
              {k.sub ? <div className="mt-1 text-2xs text-ink-3 leading-tight">{k.sub}</div> : null}
            </div>
          ))}
        </div>
      ) : null}
      <ClaimsList rows={rows} />
    </Page>
  );
}
