import Link from "next/link";
import { getLang, getUan } from "@/lib/session";
import { makeT } from "@/i18n";
import { Icon, type IconName } from "@/components/Icon";

/** The closed ledger: red cloth cover, the title stamped on it, one fact, one action. Then the first sheet. */
export default async function Landing() {
  const lang = await getLang();
  const uan = await getUan();
  const t = makeT(lang);
  const pillars: { key: "check" | "form" | "money" | "track"; icon: IconName }[] = [
    { key: "check", icon: "shield" },
    { key: "form", icon: "file" },
    { key: "money", icon: "landmark" },
    { key: "track", icon: "clock" },
  ];
  return (
    <div className="flex-1">
      {/* Cover */}
      <section className="cloth">
        <div className="mx-auto w-full max-w-[34rem] px-4 pt-10 pb-12 sm:pt-14 sm:pb-16">
          <div className="flex items-baseline justify-between border-b border-white/25 pb-3">
            <span className="t-label uppercase tracking-[0.14em] text-white/80">{t("landing.cover")}</span>
            <span className="t-label text-white/80">{t("landing.coverSub")}</span>
          </div>
          <h1 className="t-head text-[2.375rem] leading-[1.05] sm:text-[2.875rem] mt-8 max-w-[14ch]">{t("landing.title")}</h1>
          <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-relaxed text-white/90">{t("landing.lead")}</p>
          <div className="mt-8 flex items-end gap-4">
            <div className="t-num text-[3.5rem] leading-none sm:text-[4.25rem]">{t("landing.stat")}</div>
            <div className="pb-1.5">
              <div className="t-label text-white/95 text-base leading-tight max-w-[18ch]">{t("landing.statLabel")}</div>
              <div className="text-2xs text-white/70 mt-1">{t("landing.statSource")}</div>
            </div>
          </div>
          <div className="mt-10">
            <Link
              href={uan ? "/start" : "/login"}
              className="tap inline-flex items-center gap-3 rounded-[var(--radius-cloth)] bg-paper text-cloth-deep pl-5 pr-4 py-3 t-label text-base shadow-cloth hover:bg-white transition-colors"
            >
              {t("landing.cta")}
              <Icon name="arrowRight" size={20} />
            </Link>
            <p className="mt-3 text-sm text-white/75">{t("landing.ctaSub")}</p>
          </div>
        </div>
      </section>

      {/* First sheet */}
      <section className="mx-auto w-full max-w-[34rem] px-4 -mt-6 pb-16">
        <div className="sheet ledger">
          {pillars.map((p, i) => (
            <div key={p.key} className="ledger-row py-4">
              <div className="flex items-start justify-center pt-0.5 text-ink-3">
                <span className="t-num text-sm tnum">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <div className="pl-4 pr-4">
                <div className="flex items-center gap-2">
                  <Icon name={p.icon} size={18} className="text-cloth" />
                  <h2 className="t-label text-[0.9375rem] text-ink">{t(`landing.pillars.${p.key}.title`)}</h2>
                </div>
                <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-2">{t(`landing.pillars.${p.key}.body`)}</p>
              </div>
              <div className="pr-4 pt-0.5 text-tick" aria-hidden="true">
                <Icon name="check" size={18} />
              </div>
            </div>
          ))}
        </div>
        <p className="t-head text-xl mt-10 text-ink">{t("landing.builtFor")}</p>
        <p className="mt-2 text-ink-2 text-[0.9375rem]">{t("landing.demoNote")}</p>
        <p className="mt-6 text-sm">
          <Link href="/how-it-works" className="underline text-ink-2 hover:text-ink">
            {t("landing.howItWorksLink")}
          </Link>
        </p>
        <p className="mt-10 text-2xs text-ink-3">{t("common.poweredBy")}</p>
      </section>
    </div>
  );
}
