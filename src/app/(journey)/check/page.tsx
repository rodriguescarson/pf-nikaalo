import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getLang, getUan, COOKIE } from "@/lib/session";
import { makeT } from "@/i18n";
import { Page, PageTitle } from "@/components/Sheet";
import { Stepper } from "@/components/Stepper";
import { loadMember } from "@/mock/store";
import type { Intent } from "@/lib/rules/types";
import { AgentRun } from "./AgentRun";

export const metadata = { title: "Checking your record" };

export default async function CheckPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const intent = (await cookies()).get(COOKIE.intent)?.value as Intent | undefined;
  if (!intent) redirect("/start");
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const t = makeT(lang);
  return (
    <Page>
      <Stepper current="check" lang={lang} minutes={2} />
      <PageTitle title={t("check.title")} sub={t("check.sub")} />
      <AgentRun uan={uan} intent={intent} memberName={member.name} latestEmployer={member.employments.at(-1)?.employer ?? ""} />
    </Page>
  );
}
