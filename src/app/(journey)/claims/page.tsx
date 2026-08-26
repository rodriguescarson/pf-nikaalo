import { redirect } from "next/navigation";
import { getLang, getUan, getDemoOffsetDays, todayISO } from "@/lib/session";
import { makeT } from "@/i18n";
import { deriveStatus } from "@/lib/rules";
import { loadMember } from "@/mock/store";
import { allClaimsFor } from "@/lib/claims";
import { Page, PageTitle } from "@/components/Sheet";
import { ClaimsList, type ClaimRow } from "./ClaimsList";

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
  return (
    <Page>
      <PageTitle title={t("claims.title")} sub={t("claims.sub")} />
      <ClaimsList rows={rows} />
    </Page>
  );
}
