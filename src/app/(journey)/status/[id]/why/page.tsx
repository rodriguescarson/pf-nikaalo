import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO, COOKIE, COOKIE_OPTS } from "@/lib/session";
import { makeT } from "@/i18n";
import { deriveStatus } from "@/lib/rules";
import { loadMember } from "@/mock/store";
import { findClaim } from "@/lib/claims";
import { Page, PageTitle, Sheet } from "@/components/Sheet";
import { Icon } from "@/components/Icon";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";

export const metadata = { title: "Why it was rejected" };

async function refile() {
  "use server";
  const jar = await cookies();
  jar.delete(COOKIE.claim);
  jar.set(COOKIE.intent, "full_withdrawal", COOKIE_OPTS);
  redirect("/check");
}

/** EPFO's words, then ours, then what to do. The loop back to /check is the point. */
export default async function WhyPage({ params }: PageProps<"/status/[id]/why">) {
  const { id } = await params;
  const lang = await getLang();
  const uan = (await getUan())!;
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const claim = await findClaim(member, id);
  if (!claim) notFound();
  const status = deriveStatus(claim, todayISO(await getDemoOffsetDays()));
  const r = status.rejection;
  if (!r) redirect(`/status/${id}`);
  const t = makeT(lang);
  const actor = t(`common.${r.fix.actor === "member" ? "you" : r.fix.actor}`);
  const eta = r.fix.etaDays[1] === 0 ? t("common.sameDay") : r.fix.etaDays[0] === r.fix.etaDays[1] ? t("common.days", { n: r.fix.etaDays[0] }) : t("common.dayRange", { min: r.fix.etaDays[0], max: r.fix.etaDays[1] });

  return (
    <Page>
      <Link href={`/status/${id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-2 underline mb-4">
        <Icon name="arrowLeft" size={16} /> {t("status.title", { id })}
      </Link>
      <PageTitle title={t("rejection.title")} sub={t("rejection.sub")} />
      <Sheet ledger>
        <div className="ledger-row">
          <div className="flex items-start justify-center pt-4 mark mark-x">
            <Icon name="x" size={20} strokeWidth={2.5} />
          </div>
          <div className="px-4 py-3.5">
            <div className="t-label text-2xs text-ink-3 uppercase tracking-wide">{t("rejection.epfoSaid")}</div>
            <div className="mt-1 t-label text-[1.0625rem] text-ink">“{t(`rejection.${r.code}.epfo`)}”</div>
          </div>
          <div />
        </div>
        <div className="ledger-row">
          <div className="flex items-start justify-center pt-4 text-ink-3">
            <Icon name="info" size={18} />
          </div>
          <div className="px-4 py-3.5">
            <div className="t-label text-2xs text-ink-3 uppercase tracking-wide">{t("rejection.meaning")}</div>
            <p className="mt-1 text-[0.9375rem] text-ink leading-relaxed">{t(`rejection.${r.code}.plain`)}</p>
          </div>
          <div />
        </div>
        <div className="ledger-row">
          <div className="flex items-start justify-center pt-4 text-cloth">
            <Icon name="pen" size={18} />
          </div>
          <div className="px-4 py-3.5">
            <div className="t-label text-2xs text-ink-3 uppercase tracking-wide">{t("rejection.todo")}</div>
            <p className="mt-1 text-[0.9375rem] text-ink leading-relaxed">{t(r.fix.stepsKey)}</p>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-2">
              <span>
                <span className="text-ink-3">{t("check.whoFixes")}:</span> <span className="text-ink">{actor}</span>
              </span>
              <span>
                <span className="text-ink-3">{t("check.eta")}:</span> <span className="text-ink">{eta}</span>
              </span>
            </div>
          </div>
          <div />
        </div>
      </Sheet>
      <p className={`mt-4 text-sm flex items-center gap-2 ${r.refileAllowed ? "text-tick" : "text-ink-2"}`}>
        <Icon name={r.refileAllowed ? "refresh" : "lock"} size={16} />
        {t(r.refileAllowed ? "rejection.canRefile" : "rejection.cannotRefile")}
      </p>
      {r.refileAllowed ? (
        <form action={refile} id="refile" />
      ) : null}
      <ActionBar>
        <PrimaryButton type="submit" form="refile" disabled={!r.refileAllowed}>
          {t("status.refile")}
          <Icon name="arrowRight" size={20} />
        </PrimaryButton>
      </ActionBar>
    </Page>
  );
}
