import { Suspense } from "react";
import { getLang } from "@/lib/session";
import { makeT, translateList } from "@/i18n";
import { Page, PageTitle } from "@/components/Sheet";
import { HowTabs } from "./HowTabs";

export const metadata = { title: "How it works" };

type MockRow = { name: string; sim: string; real: string };
type Source = { text: string; url: string };

/** Honesty is a feature: what is real, what is simulated, what it would take. One tab per question. */
export default async function HowItWorksPage() {
  const lang = await getLang();
  const t = makeT(lang);
  return (
    <Page className="pb-16 max-w-[52rem]">
      <PageTitle title={t("how.title")} sub={t("how.sub")} />
      <Suspense>
        <HowTabs
          real={translateList<string>(lang, "how.real")}
          mock={translateList<MockRow>(lang, "how.mock")}
          scale={translateList<string>(lang, "how.scale")}
          sources={translateList<Source>(lang, "how.sources")}
          labels={{
            real: t("insights.tabs.real"),
            simulated: t("insights.tabs.simulated"),
            scale: t("insights.tabs.scale"),
            sources: t("insights.tabs.sources"),
            simulatedWord: t("common.simulated"),
            codexTitle: t("how.codexTitle"),
            codexBody: t("how.codexBody"),
            repo: t("how.repo"),
            limitsTitle: t("how.limitsTitle"),
            limits: t("how.limits"),
            poweredBy: t("common.poweredBy"),
          }}
        />
      </Suspense>
    </Page>
  );
}
