import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getLang, getUan } from "@/lib/session";
import { makeT } from "@/i18n";
import { loadMember } from "@/mock/store";
import { buildPassbook } from "@/lib/passbook";
import { employerSummaries, interestByYear, monthlySeries, projectBalance, split, streaks } from "@/lib/insights";
import { Page, PageTitle } from "@/components/Sheet";
import { PassbookTabs } from "./PassbookTabs";
import type { InsightsData } from "./PassbookInsights";

export const metadata = { title: "Passbook" };

export default async function PassbookPage() {
  const lang = await getLang();
  const uan = (await getUan())!;
  const member = await loadMember(uan);
  if (!member) redirect("/login");
  const t = makeT(lang);
  const entries = buildPassbook(member);
  const employers = member.employments.map((e) => ({ id: e.establishmentId, name: e.employer }));
  const series = monthlySeries(entries);
  const insights: InsightsData = {
    balance: member.passbook.employeeShare + member.passbook.employerShare + member.passbook.interest,
    pension: member.passbook.epsContribution,
    series,
    streaks: streaks(entries),
    employers: employerSummaries(member, entries),
    split: split(entries),
    interestByYear: interestByYear(entries),
    projection: [5, 10].map((years) => ({ years, amount: projectBalance(series, years * 12) })),
    interestMonths: series.filter((p) => p.interest > 0).map((p) => p.month),
  };
  return (
    <Page className="max-w-[52rem]">
      <PageTitle title={t("passbook.title")} sub={t("passbook.sub")} />
      <Suspense>
        <PassbookTabs entries={entries} employers={employers} balance={insights.balance} insights={insights} />
      </Suspense>
    </Page>
  );
}
