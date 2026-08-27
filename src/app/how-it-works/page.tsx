import { getLang } from "@/lib/session";
import { makeT, translateList } from "@/i18n";
import { Page, PageTitle, Sheet } from "@/components/Sheet";
import { Icon } from "@/components/Icon";

export const metadata = { title: "How it works" };

type MockRow = { name: string; sim: string; real: string };
type Source = { text: string; url: string };

/** Honesty is a feature: what is real, what is simulated, what it would take. */
export default async function HowItWorksPage() {
  const lang = await getLang();
  const t = makeT(lang);
  const real = translateList<string>(lang, "how.real");
  const mock = translateList<MockRow>(lang, "how.mock");
  const scale = translateList<string>(lang, "how.scale");
  const sources = translateList<Source>(lang, "how.sources");
  return (
    <Page className="pb-16">
      <PageTitle title={t("how.title")} sub={t("how.sub")} />

      <h2 className="t-label text-ink mb-2">{t("how.realTitle")}</h2>
      <Sheet ledger>
        <ul>
          {real.map((line, i) => (
            <li key={i} className="ledger-row">
            <div className="flex items-start justify-center pt-3.5 mark mark-tick">
              <Icon name="check" size={18} strokeWidth={2.5} />
            </div>
            <p className="px-4 py-3 text-[0.9375rem] text-ink leading-relaxed">{line}</p>
            <div />
            </li>
          ))}
        </ul>
      </Sheet>

      <h2 className="t-label text-ink mt-8 mb-2">{t("how.mockTitle")}</h2>
      <Sheet ledger>
        <ul>
          {mock.map((m, i) => (
            <li key={i} className="ledger-row">
            <div className="flex items-start justify-center pt-3.5 text-ink-3">
              <Icon name="info" size={18} />
            </div>
            <div className="px-4 py-3">
              <div className="t-label text-[0.9375rem] text-ink">{m.name}</div>
              <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                <dt className="text-ink-3">{t("common.simulated")}</dt>
                <dd className="text-ink-2">{m.sim}</dd>
                <dt className="text-ink-3">Real</dt>
                <dd className="text-ink">{m.real}</dd>
              </dl>
            </div>
            <div />
            </li>
          ))}
        </ul>
      </Sheet>

      <h2 className="t-label text-ink mt-8 mb-2">{t("how.scaleTitle")}</h2>
      <Sheet ledger>
        <ol>
          {scale.map((line, i) => (
            <li key={i} className="ledger-row">
            <div className="flex items-start justify-center pt-3.5 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
            <p className="px-4 py-3 text-[0.9375rem] text-ink-2 leading-relaxed">{line}</p>
            <div />
            </li>
          ))}
        </ol>
      </Sheet>

      <h2 className="t-label text-ink mt-8 mb-2">{t("how.codexTitle")}</h2>
      <Sheet className="p-4">
        <p className="text-[0.9375rem] text-ink-2 leading-relaxed">{t("how.codexBody")}</p>
        <a href="https://github.com/rodriguescarson/pf-nikaalo" className="mt-3 inline-flex items-center gap-1.5 t-label text-cloth underline" target="_blank" rel="noreferrer">
          {t("how.repo")} <Icon name="arrowRight" size={16} />
        </a>
      </Sheet>

      <h2 className="t-label text-ink mt-8 mb-2">{t("how.sourcesTitle")}</h2>
      <Sheet ledger>
        <ol>
          {sources.map((s, i) => (
            <li key={i} className="ledger-row">
            <div className="flex items-start justify-center pt-3.5 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
            <p className="px-4 py-3 text-sm leading-relaxed">
              <a href={s.url} target="_blank" rel="noreferrer" className="text-ink underline decoration-rule hover:decoration-ink">
                {s.text}
              </a>
            </p>
            <div />
            </li>
          ))}
        </ol>
      </Sheet>

      <h2 className="t-label text-ink mt-8 mb-2">{t("how.limitsTitle")}</h2>
      <p className="text-sm text-ink-2 leading-relaxed">{t("how.limits")}</p>
      <p className="mt-8 text-2xs text-ink-3">{t("common.poweredBy")}</p>
    </Page>
  );
}
