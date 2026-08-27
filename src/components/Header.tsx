import Link from "next/link";
import type { Lang } from "@/lib/rules/types";
import { makeT } from "@/i18n";
import { LangToggle } from "./LangToggle";
import { Icon } from "./Icon";
import { Logo } from "./Logo";

/** Floating glass bar: wordmark, quiet nav, one lime action. */
export function Header({ lang, signedIn }: { lang: Lang; signedIn: boolean }) {
  const t = makeT(lang);
  const item = "tap px-2.5 rounded-full flex items-center gap-1.5 text-sm font-medium text-ink-2 hover:text-ink hover:bg-ink/5 whitespace-nowrap";
  return (
    <header className="sticky top-0 z-40 no-print px-3 pt-3">
      <div className="mx-auto w-full max-w-[72rem] glass rounded-full pl-4 pr-2 h-14 flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 tap -ml-2 pl-2 pr-2 rounded-full shrink-0" aria-label={t("common.home")}>
          <Logo />
        </Link>
        <nav aria-label={t("common.nav")} className="ml-auto flex items-center gap-0.5 shrink-0">
          {signedIn ? (
            <>
              <Link href="/passbook" className={item} aria-label={t("nav.passbook")}>
                <Icon name="file" size={18} />
                <span className="hidden md:inline">{t("nav.passbook")}</span>
              </Link>
              <Link href="/claims" className={item} aria-label={t("nav.claims")}>
                <Icon name="clock" size={18} />
                <span className="hidden md:inline">{t("nav.claims")}</span>
              </Link>
            </>
          ) : null}
          <Link href="/how-it-works" className={item} aria-label={t("nav.how")}>
            <Icon name="help" size={18} />
            <span className="hidden md:inline">{t("nav.how")}</span>
          </Link>
          <LangToggle lang={lang} />
          {signedIn ? null : (
            <Link href="/login" className="btn-lime tap ml-1 rounded-full px-4 t-label flex items-center gap-1.5 whitespace-nowrap">
              {t("nav.start")}
              <Icon name="arrowRight" size={16} />
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
