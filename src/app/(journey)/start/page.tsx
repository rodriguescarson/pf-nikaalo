import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLang, getUan, COOKIE, COOKIE_OPTS } from "@/lib/session";
import { makeT } from "@/i18n";
import { Page, PageTitle } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { loadClaim, loadMember } from "@/mock/store";
import { TriageForm } from "./TriageForm";
import type { Intent } from "@/lib/rules/types";

export const metadata = { title: "What do you need?" };

const INTENTS: Intent[] = ["full_withdrawal", "both", "pension_withdrawal", "advance_unemployment"];

async function chooseIntent(formData: FormData) {
  "use server";
  const intent = String(formData.get("intent") ?? "");
  if (!INTENTS.includes(intent as Intent)) return;
  const jar = await cookies();
  jar.set(COOKIE.intent, intent, COOKIE_OPTS);
  redirect("/check");
}

async function startFresh() {
  "use server";
  const jar = await cookies();
  for (const k of [COOKIE.claim, COOKIE.intent, COOKIE.demoOffset]) jar.delete(k);
  redirect("/start");
}

export default async function StartPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const t = makeT(lang);
  const member = await loadMember(uan);
  const claim = await loadClaim();
  const current = (await cookies()).get(COOKIE.intent)?.value as Intent | undefined;
  return (
    <Page>
      <Stepper current="start" lang={lang} minutes={3} />
      <PageTitle title={t("start.title")} sub={t("start.sub")} />
      {member ? <p className="t-label text-ink-2 -mt-3 mb-4">{t("start.greeting", { name: member.name })}</p> : null}
      <TriageForm
        intents={INTENTS}
        current={current}
        resumeClaimId={claim?.id}
        action={chooseIntent}
        resetAction={startFresh}
      />
    </Page>
  );
}
