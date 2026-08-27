import Image from "next/image";
import Link from "next/link";
import { getLang, getUan } from "@/lib/session";
import { formatINR, makeT, translateList } from "@/i18n";
import { Icon, type IconName } from "@/components/Icon";
import { Reveal, CountUp } from "@/components/Motion";

type Pillar = { key: "check" | "form" | "money" | "track"; icon: IconName; tone: string };

/** Persuade surface: bold claim, floating proof cards, feature tiles, a lime band with the money widget. */
export default async function Landing() {
  const lang = await getLang();
  const uan = await getUan();
  const t = makeT(lang);
  const chips = translateList<string>(lang, "landing.hero.chips");
  const sources = translateList<string>(lang, "landing.hero.sources");
  const steps = translateList<{ title: string; body: string }>(lang, "landing.steps.items");
  const startHref = uan ? "/start" : "/login";
  const pillars: Pillar[] = [
    { key: "check", icon: "shield", tone: "bg-lime text-ink" },
    { key: "form", icon: "file", tone: "bg-green text-white" },
    { key: "money", icon: "landmark", tone: "bg-lime-2 text-ink" },
    { key: "track", icon: "clock", tone: "bg-dark text-white" },
  ];

  return (
    <div className="flex-1 overflow-x-clip">
      {/* Hero */}
      <section className="mx-auto w-full max-w-[72rem] px-5 pt-10 pb-8 sm:pt-16 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-10">
        <div>
          <Reveal>
            <h1 className="t-head text-[2.75rem] leading-[1.02] sm:text-[3.5rem] lg:text-[4rem] text-ink max-w-[14ch]">
              {t("landing.hero.title1")} <span className="accent">{t("landing.hero.titleAccent")}</span> {t("landing.hero.title2")}
            </h1>
          </Reveal>
          <Reveal delay={90}>
            <p className="mt-5 max-w-[52ch] text-[1.0625rem] leading-relaxed text-ink-2">{t("landing.hero.lead")}</p>
          </Reveal>
          <Reveal delay={160} className="mt-7 flex flex-wrap items-center gap-3">
            <Link href={startHref} className="btn-lime tap inline-flex items-center gap-2 rounded-full px-6 py-3.5 t-label text-base">
              {t("landing.hero.cta")}
              <Icon name="arrowRight" size={18} />
            </Link>
            <Link href="/how-it-works" className="tap inline-flex items-center gap-2 rounded-full px-4 py-3.5 t-label text-base text-ink hover:bg-ink/5">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-dark text-white">
                <Icon name="help" size={18} />
              </span>
              {t("landing.hero.ctaSecondary")}
            </Link>
          </Reveal>
          <Reveal delay={230} className="mt-8 border-t border-rule-2/60 pt-5">
            <ul className="flex flex-wrap gap-2" aria-label={t("landing.hero.worksWith")}>
              {chips.map((c) => (
                <li key={c} className="rounded-full border border-ink/15 bg-white/60 px-3 py-1.5 text-sm text-ink-2">
                  {c}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* Floating proof cards over the generated hero image */}
        <Reveal delay={120} className="relative mt-12 lg:mt-0 mx-auto w-full max-w-[34rem] aspect-[5/4] sm:aspect-[4/3]">
          <div className="absolute inset-[6%] rounded-full border border-lime-deep/30" aria-hidden="true" />
          <div className="absolute inset-[18%] rounded-full border border-green/15 orbit" aria-hidden="true">
            <span className="absolute -top-1.5 left-1/2 h-3 w-3 rounded-full bg-lime shadow-lime" />
          </div>
          <Image src="/img/hero.webp" alt="" width={1200} height={800} priority sizes="(min-width: 1024px) 34rem, 100vw" className="absolute inset-0 h-full w-full object-contain float-c mix-blend-multiply drop-shadow-[0_30px_40px_rgb(14_21_18_/_0.18)]" />
          {/* Claim card */}
          <div className="absolute left-[2%] bottom-[2%] sm:bottom-auto sm:top-[54%] w-[62%] sm:w-[58%] card-green rounded-[1.25rem] p-4 shadow-cloth float-a">
            <div className="flex items-center justify-between">
              <span className="t-label text-white/85">{t("landing.hero.cardClaim")}</span>
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20">
                <Icon name="check" size={14} strokeWidth={3} />
              </span>
            </div>
            <div className="mt-3 t-num text-[1.5rem] tnum tracking-wide">PFN 2608 7469</div>
            <div className="mt-2 flex items-end justify-between text-white/85 text-xs">
              <span>Rahul Kumar Verma</span>
              <span className="t-num text-base text-white">{formatINR(288_000, lang)}</span>
            </div>
          </div>
          {/* Checks card */}
          <div className="absolute right-[0%] top-[8%] w-[46%] glass rounded-[1.25rem] p-4 float-b hidden sm:block">
            <div className="flex items-center justify-between">
              <span className="t-label text-ink">{t("landing.hero.cardChecks")}</span>
              <span className="t-label text-green">{t("landing.hero.cardPassed")}</span>
            </div>
            <div className="mt-3 flex items-end gap-1 h-12" aria-hidden="true">
              {[5, 8, 6, 10, 7, 11, 9, 12, 8, 11, 10, 12, 12].map((h, i) => (
                <span key={i} className={`flex-1 rounded-sm ${i === 2 ? "bg-pencil/70" : "bg-green/80"}`} style={{ height: `${h * 8}%` }} />
              ))}
            </div>
            <div className="mt-2 text-2xs text-ink-2 flex items-center gap-1.5">
              <span className="mark mark-tick !h-5 !w-5">
                <Icon name="check" size={11} strokeWidth={3} />
              </span>
              {t("landing.hero.cardFixed")}
            </div>
          </div>
          {/* Stat chip */}
          <div className="absolute left-[2%] top-[2%] sm:left-auto sm:top-auto sm:right-[4%] sm:bottom-[4%] glass rounded-full pl-2 pr-4 py-2 flex items-center gap-2 float-c">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-lime text-ink">
              <Icon name="shield" size={18} />
            </span>
            <span className="leading-tight">
              <span className="t-num text-lg text-ink block">1 in 3</span>
              <span className="text-2xs text-ink-2">{t("landing.hero.statLabel")}</span>
            </span>
          </div>
        </Reveal>
      </section>

      {/* Sources strip */}
      <section className="mx-auto w-full max-w-[72rem] px-5 py-6">
        <Reveal>
          <p className="text-center t-label text-ink-3">{t("landing.hero.worksWith")}</p>
          <div className="mt-4 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_12%,#000_88%,transparent)]">
            <ul className="marquee flex w-max gap-3" aria-label={t("landing.hero.worksWith")}>
              {[...sources, ...sources].map((s, i) => (
                <li key={i} className="shrink-0 rounded-full bg-white/70 border border-rule px-5 py-2.5 t-label text-ink-2 flex items-center gap-2">
                  <Icon name="shield" size={14} className="text-green" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-3 text-center text-2xs text-ink-3">{t("landing.hero.simNote")}</p>
        </Reveal>
      </section>

      {/* Features */}
      <section className="mx-auto w-full max-w-[72rem] px-5 py-12 sm:py-16">
        <Reveal>
          <div className="flex items-center justify-between gap-4">
            <span className="rounded-full bg-green-deep text-white px-3.5 py-1.5 t-label">{t("landing.features.kicker")}</span>
            <span className="text-sm text-ink-2 hidden sm:block">{t("landing.builtFor")}</span>
          </div>
          <h2 className="t-head text-[2rem] sm:text-[2.75rem] mt-6 max-w-[26ch] text-ink">
            {t("landing.features.title1")} <span className="accent">{t("landing.features.accent1")}</span> {t("landing.features.title2")}{" "}
            <span className="accent">{t("landing.features.accent2")}</span> {t("landing.features.title3")}
          </h2>
        </Reveal>
        <ul className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Reveal as="li" className="tile lift bg-lime-2 min-h-[18rem] sm:col-span-2 lg:col-span-1">
            <Image src="/img/wallet.webp" alt="" width={700} height={786} sizes="(min-width: 1024px) 18rem, 100vw" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-ink/70 to-transparent text-white">
              <div className="t-label text-base">{t("landing.pillars.money.title")}</div>
            </div>
          </Reveal>
          {pillars.slice(0, 3).map((p, i) => (
            <Reveal as="li" key={p.key} delay={80 * (i + 1)} className={`tile lift p-6 min-h-[18rem] flex flex-col ${i === 0 ? "bg-green text-white" : i === 1 ? "bg-lime text-ink" : "bg-dark text-white"}`}>
              <svg className="tile-glyph" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                {p.key === "check" ? (
                  <>
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="m9 12l2 2l4-4" />
                  </>
                ) : p.key === "form" ? (
                  <>
                    <path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" />
                    <path d="M14 2v5a1 1 0 0 0 1 1h5M10 9H8m8 4H8m8 4H8" />
                  </>
                ) : (
                  <path d="M10 18v-7m1.119-8.795a2 2 0 0 1 1.762 0l7.84 3.846A.5.5 0 0 1 20.5 7h-17a.5.5 0 0 1-.22-.949zM14 18v-7m4 7v-7M3 22h18M6 18v-7" />
                )}
              </svg>
              <span className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${i === 1 ? "bg-ink text-lime" : "bg-white/15 text-white"}`}>
                <Icon name={p.icon} size={20} />
              </span>
              <h3 className="t-head text-[1.375rem] mt-5">{t(`landing.pillars.${p.key}.title`)}</h3>
              <p className={`mt-auto pt-6 text-[0.9375rem] leading-relaxed ${i === 1 ? "text-ink/80" : "text-white/85"}`}>{t(`landing.pillars.${p.key}.body`)}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* Lime band: dark money widget + 3 steps */}
      <section className="lime-band relative overflow-hidden">
        <div className="absolute -left-10 -bottom-24 t-head text-[22rem] leading-none text-ink/5 select-none pointer-events-none" aria-hidden="true">
          ₹
        </div>
        <div className="mx-auto w-full max-w-[72rem] px-5 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <Reveal className="cloth rounded-[1.75rem] p-6 sm:p-8 shadow-cloth max-w-[28rem] w-full">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm">
                <span className="h-2 w-2 rounded-full bg-lime" /> Form 19 · Rahul
              </span>
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/10">
                <Icon name="lock" size={16} />
              </span>
            </div>
            <div className="mt-8 text-sm text-white/70">{t("landing.steps.widgetLabel")}</div>
            <div className="mt-1 t-num text-[2.5rem] sm:text-[3rem] leading-none text-lime">
              <CountUp to={288_000} lang={lang} />
            </div>
            <div className="mt-2 text-sm text-white/60">{formatINR(320_000, lang)} · {t("landing.steps.widgetTds")}</div>
            <div className="mt-7 flex items-center gap-2">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/10">
                <Icon name="file" size={18} />
              </span>
              <Link href={startHref} className="tap inline-flex items-center gap-2 rounded-full border border-white/20 px-4 t-label text-white hover:bg-white/10">
                <Icon name="arrowRight" size={14} /> {t("landing.steps.widgetFile")}
              </Link>
              <Link href={startHref} className="tap inline-flex items-center gap-2 rounded-full border border-white/20 px-4 t-label text-white hover:bg-white/10">
                <Icon name="clock" size={14} /> {t("landing.steps.widgetTrack")}
              </Link>
              <span className="ml-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-lime text-ink">
                <Icon name="check" size={18} strokeWidth={3} />
              </span>
            </div>
          </Reveal>
          <div>
            <Reveal>
              <h2 className="t-head text-[2rem] sm:text-[2.75rem] text-ink max-w-[16ch]">{t("landing.steps.title")}</h2>
            </Reveal>
            <ol className="mt-8 space-y-5">
              {steps.map((s, i) => (
                <Reveal as="li" key={i} delay={100 * i} className="flex items-start gap-4">
                  <span className="mt-0.5 inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-dark text-lime t-num">{i + 1}</span>
                  <div>
                    <div className="t-label text-base text-ink">{s.title}</div>
                    <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink/75">{s.body}</p>
                  </div>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Honesty + close */}
      <section className="mx-auto w-full max-w-[72rem] px-5 py-14 sm:py-20">
        <Reveal className="sheet rounded-[1.75rem] p-7 sm:p-10 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <h2 className="t-head text-[1.75rem] sm:text-[2.25rem] text-ink">{t("landing.honest.title")}</h2>
            <p className="mt-3 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-2">{t("landing.honest.body")}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/how-it-works" className="tap inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white px-5 t-label text-ink hover:bg-canvas">
              {t("landing.honest.cta")}
            </Link>
            <Link href={startHref} className="btn-lime tap inline-flex items-center gap-2 rounded-full px-5 t-label">
              {t("landing.hero.cta")} <Icon name="arrowRight" size={16} />
            </Link>
          </div>
        </Reveal>
        <p className="mt-10 text-center text-2xs text-ink-3">{t("common.poweredBy")}</p>
      </section>
    </div>
  );
}
