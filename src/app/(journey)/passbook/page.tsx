import { redirect } from "next/navigation";
import { getLang, getUan } from "@/lib/session";
import { makeT } from "@/i18n";
import { loadMember } from "@/mock/store";
import { buildPassbook } from "@/lib/passbook";
import { Page, PageTitle } from "@/components/Sheet";
import { PassbookList } from "./PassbookList";

export const metadata = { title: "Passbook" };

export default async function PassbookPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const t = makeT(lang);
  const entries = buildPassbook(member);
  const employers = member.employments.map((e) => ({ id: e.establishmentId, name: e.employer }));
  return (
    <Page>
      <PageTitle title={t("passbook.title")} sub={t("passbook.sub")} />
      <PassbookList entries={entries} employers={employers} balance={member.passbook.employeeShare + member.passbook.employerShare + member.passbook.interest} />
    </Page>
  );
}
