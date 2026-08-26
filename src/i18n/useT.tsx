"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@/lib/rules/types";
import { makeT, DEFAULT_LANG } from "./index";

const LangContext = createContext<Lang>(DEFAULT_LANG);

export function LocaleProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export function useLang(): Lang {
  return useContext(LangContext);
}

export function useT() {
  const lang = useContext(LangContext);
  return useMemo(() => makeT(lang), [lang]);
}
