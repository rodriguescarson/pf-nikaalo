import Link from "next/link";
import type { Lang } from "@/lib/rules/types";
import { makeT } from "@/i18n";
import { LangToggle } from "./LangToggle";
import { Icon } from "./Icon";

/** The cloth band: the ledger's cover carries the name, the language switch, and — when signed in — the pages. */
export function Header({ lang, signedIn }: { lang: Lang; signedIn: boolean }) {
  const t = makeT(lang);
  return (
    <header className="cloth no-print">
      <div className="mx-auto w-full max-w-[34rem] px-4 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 tap -ml-2 pl-2 pr-2 rounded" aria-label={t("common.home")}>
          <span className="t-head text-[1.375rem] leading-none tracking-tight">{t("common.appName")}</span>
        </Link>
        <nav aria-label={t("common.nav")} className="ml-auto flex items-center gap-1">
          {signedIn ? (
            <>
              <Link href="/passbook" className="tap px-2.5 rounded flex items-center gap-1.5 text-sm hover:bg-white/10">
                <Icon name="file" size={18} />
                <span className="hidden sm:inline">{t("nav.passbook")}</span>
              </Link>
              <Link href="/claims" className="tap px-2.5 rounded flex items-center gap-1.5 text-sm hover:bg-white/10">
                <Icon name="clock" size={18} />
                <span className="hidden sm:inline">{t("nav.claims")}</span>
              </Link>
            </>
          ) : null}
          <Link href="/how-it-works" className="tap px-2.5 rounded flex items-center gap-1.5 text-sm hover:bg-white/10">
            <Icon name="help" size={18} />
            <span className="hidden sm:inline">{t("nav.how")}</span>
          </Link>
          <LangToggle lang={lang} />
        </nav>
      </div>
    </header>
  );
}
