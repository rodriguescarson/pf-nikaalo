"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { Lang } from "@/lib/rules/types";
import { makeT, translateList, DEFAULT_LANG } from "./index";

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

export function useList<T = string>(key: string): T[] {
  const lang = useContext(LangContext);
  return useMemo(() => translateList<T>(lang, key), [lang, key]);
}
