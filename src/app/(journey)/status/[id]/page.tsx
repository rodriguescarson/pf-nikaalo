import Link from "next/link";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO } from "@/lib/session";
import { formatDate, formatINR, makeT } from "@/i18n";
import { deriveStatus } from "@/lib/rules";
import { loadMember } from "@/mock/store";
import { findClaim } from "@/lib/claims";
import { Page, PageTitle, Sheet } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { Icon } from "@/components/Icon";
import { Timeline } from "@/components/Timeline";
import { DemoClock } from "@/components/DemoClock";
import { SmsPreview } from "@/components/SmsPreview";
import { Sahayak } from "@/components/Sahayak";
import { StatusActions } from "./StatusActions";
import { StatusTabs } from "./StatusTabs";

export async function generateMetadata({ params }: PageProps<"/status/[id]">) {
  const { id } = await params;
  return { title: `Claim ${id}` };
}

export default async function StatusPage({ params }: PageProps<"/status/[id]">) {
  const { id } = await params;
  const lang = await getLang();
  const uan = (await getUan())!;
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const claim = await findClaim(member, id);
  if (!claim) notFound();
  const offset = await getDemoOffsetDays();
  const today = todayISO(offset);
  const status = deriveStatus(claim, today);
  const t = makeT(lang);
  const net = claim.amount.total - claim.tds.amount;
  const rejected = status.current === "REJECTED";
  const last4 = member.bank.accountLast4;
  const reason = status.rejection ? t(`rejection.${status.rejection.code}.epfo`) : "";
  const doneEvents = status.events.filter((e) => e.done);
  const inr = (n: number) => formatINR(n, lang).replace("₹", "");

  const kpis = [
    { label: t("review.amount"), value: formatINR(net, lang) },
    { label: t("review.forms"), value: claim.forms.map((f) => t(`forms.${f}`).split(" · ")[0]).join(" + ") },
    { label: t("status.filedOn", { date: "" }).replace(/\s+$/, ""), value: formatDate(claim.submittedAt, lang) },
    { label: t("status.current"), value: t(`status.${status.current}.title`) },
  ];

  return (
    <Page>
      <Stepper current="status" lang={lang} />
      <PageTitle title={t("status.title", { id: claim.id })} sub={t("status.sub")} />

      {/* KPI row */}
      <div className="-mt-1 mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {kpis.map((k, i) => (
          <div key={k.label} className={`rounded-[var(--radius-sheet)] px-3.5 py-3 ${i === 0 ? "cloth" : "sheet"}`}>
            <div className={`text-2xs ${i === 0 ? "text-white/70" : "text-ink-3"}`}>{k.label}</div>
            <div className={`mt-0.5 t-num text-[1.0625rem] leading-tight tnum ${i === 0 ? "text-lime" : "text-ink"}`}>{k.value}</div>
          </div>
        ))}
      </div>

      {rejected && status.rejection ? (
        <Sheet className="p-4 mb-5 border-pencil/40 bg-pencil-fill/40">
          <div className="flex items-start gap-3">
            <span className="mark mark-x mt-0.5">
              <Icon name="x" size={18} strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="t-label text-ink">{reason}</div>
              <p className="mt-1 text-sm text-ink-2">{t(`rejection.${status.rejection.code}.plain`)}</p>
              <Link href={`/status/${claim.id}/why`} className="mt-2 inline-flex items-center gap-1.5 t-label text-green underline">
                {t("status.whyRejected")} <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>
        </Sheet>
      ) : null}

      <Suspense>
        <StatusTabs
          messageCount={doneEvents.length}
          timeline={
            <>
              <Timeline status={status} claimId={claim.id} amount={net} last4={last4} />
              <div className="mt-6">
                <DemoClock today={today} offsetDays={offset} />
              </div>
            </>
          }
          messages={
            <div>
              <p className="text-sm text-ink-2 mb-3">{t("status.messagesSub")}</p>
              {doneEvents.length === 0 ? (
                <Sheet className="p-5 text-sm text-ink-2">{t("status.noMessages")}</Sheet>
              ) : (
                <ol className="space-y-3">
                  {doneEvents.map((e) => (
                    <li key={e.stage} className="flex items-start gap-3">
                      <span className="mt-1 mark mark-tick !h-6 !w-6">
                        <Icon name="check" size={12} strokeWidth={3} />
                      </span>
                      <div className="flex-1 sheet rounded-[var(--radius-cloth)] px-4 py-3 max-w-[26rem]">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="t-label text-2xs text-ink-3">{t("status.smsFrom")}</span>
                          <span className="text-2xs text-ink-3 tnum">{formatDate(e.at, lang)}</span>
                        </div>
                        <p className="mt-1 text-[0.9375rem] text-ink leading-relaxed">
                          {t(`status.${e.stage}.sms`, { id: claim.id, last4, amount: inr(net), reason })}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <div className="mt-6">
                <SmsPreview status={status} claimId={claim.id} amount={net} last4={last4} reason={reason || undefined} />
              </div>
            </div>
          }
          receipt={
            <div>
              <p className="text-sm text-ink-2 mb-3 no-print">{t("status.receiptSub")}</p>
              <Sheet ledger>
                {[
                  [t("review.member"), `${member.name} · ${t("common.uan")} ${uan}`],
                  [t("review.forms"), claim.forms.map((f) => t(`forms.${f}`)).join(" + ")],
                  [t("claim.pfGross"), formatINR(claim.amount.pfGross, lang)],
                  [t("review.tds"), claim.tds.applicable ? `${formatINR(claim.tds.amount, lang)} (${Math.round(claim.tds.rate * 100)}%)` : formatINR(0, lang)],
                  [t("review.amount"), formatINR(net, lang)],
                  [t("review.bank"), t("claim.bankLine", { last4, ifsc: member.bank.ifsc })],
                  [t("status.filedOn", { date: formatDate(claim.submittedAt, lang) }), ""],
                ].map(([k, v], i) => (
                  <div key={k} className="ledger-row items-start">
                    <div className="flex items-center justify-center pt-3.5 t-num text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</div>
                    <div className="px-4 py-3 text-sm text-ink-2">{k}</div>
                    <div className="pr-4 py-3 text-[0.9375rem] text-ink text-right max-w-[16rem] tnum">{v}</div>
                  </div>
                ))}
              </Sheet>
              <p className="mt-3 text-2xs text-ink-3">
                {t("banner.lead")} {t("banner.body")}
              </p>
            </div>
          }
        />
      </Suspense>

      <StatusActions claimId={claim.id} shareText={`${t("status.title", { id: claim.id })} · ${t(`status.${status.current}.title`)} · ${t("common.appName")}`} rejected={rejected} />
      <Sahayak uan={uan} lang={lang} />
    </Page>
  );
}
