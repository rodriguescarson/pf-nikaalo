import { redirect } from "next/navigation";
import { getLang, getUan } from "@/lib/session";
import { makeT } from "@/i18n";
import { Page, PageTitle } from "@/components/Sheet";
import { LoginForm } from "./LoginForm";
import { DEMO_UANS, MEMBERS } from "@/mock/members";

export const metadata = { title: "Open your khata" };

export default async function LoginPage() {
  const lang = await getLang();
  if (await getUan()) redirect("/start");
  const t = makeT(lang);
  const demos = DEMO_UANS.map((uan) => ({ uan, name: MEMBERS[uan].name, note: t(`login.demo.${uan}`) }));
  return (
    <Page>
      <PageTitle title={t("login.title")} sub={t("login.sub")} step={t("common.step", { n: 1, total: 6 })} />
      <LoginForm demos={demos} />
    </Page>
  );
}
