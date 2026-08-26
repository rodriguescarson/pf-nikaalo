"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Lang } from "@/lib/rules/types";
import { Icon } from "./Icon";

/** EN ⇄ हिं. Persists a cookie and re-renders the server tree; the html lang attribute follows. */
export function LangToggle({ lang }: { lang: Lang }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Lang = lang === "en" ? "hi" : "en";
  const label = lang === "en" ? "हिंदी में पढ़ें" : "Read in English";
  return (
    <button
      type="button"
      className="tap px-2.5 rounded flex items-center gap-1.5 text-sm hover:bg-white/10 disabled:opacity-60"
      aria-label={label}
      lang={next}
      disabled={pending}
      onClick={() => {
        document.cookie = `pfn_lang=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
        start(() => router.refresh());
      }}
    >
      <Icon name="languages" size={18} />
      <span className="t-label">{lang === "en" ? "हिं" : "EN"}</span>
    </button>
  );
}
