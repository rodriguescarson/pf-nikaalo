import Link from "next/link";
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

  return (
    <Page>
      <Stepper current="status" lang={lang} />
      <PageTitle title={t("status.title", { id: claim.id })} sub={t("status.sub")} />
      <div className="-mt-3 mb-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-2">
        <span>{t("status.filedOn", { date: formatDate(claim.submittedAt, lang) })}</span>
        <span className="t-num tnum text-ink">{claim.forms.map((f) => t(`forms.${f}`).split(" · ")[0]).join(" + ")}</span>
        <span className="t-num tnum text-ink">{formatINR(net, lang)}</span>
      </div>

      {rejected && status.rejection ? (
        <Sheet className="p-4 mb-5 border-pencil/40 bg-pencil-fill/40">
          <div className="flex items-start gap-3">
            <span className="mark mark-x mt-0.5">
              <Icon name="x" size={20} strokeWidth={2.5} />
            </span>
            <div className="flex-1">
              <div className="t-label text-ink">{t(`rejection.${status.rejection.code}.epfo`)}</div>
              <p className="mt-1 text-sm text-ink-2">{t(`rejection.${status.rejection.code}.plain`)}</p>
              <Link href={`/status/${claim.id}/why`} className="mt-2 inline-flex items-center gap-1.5 t-label text-cloth underline">
                {t("status.whyRejected")} <Icon name="arrowRight" size={16} />
              </Link>
            </div>
          </div>
        </Sheet>
      ) : null}

      <Timeline status={status} claimId={claim.id} amount={net} last4={member.bank.accountLast4} />

      <div className="mt-6">
        <DemoClock today={today} offsetDays={offset} />
      </div>

      <div className="mt-6">
        <SmsPreview status={status} claimId={claim.id} amount={net} last4={member.bank.accountLast4} reason={status.rejection ? t(`rejection.${status.rejection.code}.epfo`) : undefined} />
      </div>

      <StatusActions claimId={claim.id} shareText={`${t("status.title", { id: claim.id })} · ${t(`status.${status.current}.title`)} · ${t("common.appName")}`} rejected={rejected} />

      {/* Printable receipt */}
      <section className="hidden print:block mt-8">
        <h2 className="t-head text-xl">{t("status.receipt")}</h2>
        <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-sm">
          <dt className="text-ink-3">{t("review.member")}</dt>
          <dd>{member.name} · {uan}</dd>
          <dt className="text-ink-3">{t("review.forms")}</dt>
          <dd>{claim.forms.map((f) => t(`forms.${f}`)).join(" + ")}</dd>
          <dt className="text-ink-3">{t("review.amount")}</dt>
          <dd>{formatINR(net, lang)}</dd>
          <dt className="text-ink-3">{t("status.filedOn", { date: formatDate(claim.submittedAt, lang) })}</dt>
          <dd />
        </dl>
        <p className="mt-4 text-2xs text-ink-3">{t("banner.lead")} {t("banner.body")}</p>
      </section>

      <Sahayak uan={uan} lang={lang} />
    </Page>
  );
}
