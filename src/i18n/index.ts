import en from "./en.json";
import hi from "./hi.json";
import type { Lang } from "@/lib/rules/types";

export type Dict = typeof en;
export const DICTS: Record<Lang, Dict> = { en, hi: hi as unknown as Dict };
export const LANGS: Lang[] = ["en", "hi"];
export const DEFAULT_LANG: Lang = "en";

type Params = Record<string, string | number>;

function lookup(dict: unknown, key: string): string | undefined {
  let cur: unknown = dict;
  for (const part of key.split(".")) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = (cur as Record<string, unknown>)[part];
  }
  return typeof cur === "string" ? cur : undefined;
}

/** Translate `key` from `lang`, falling back to English, then to the key itself (visible on purpose). */
export function translate(lang: Lang, key: string, params?: Params): string {
  const raw = lookup(DICTS[lang], key) ?? lookup(DICTS.en, key) ?? key;
  if (!params) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k: string) => (params[k] != null ? String(params[k]) : `{${k}}`));
}

export function makeT(lang: Lang) {
  return (key: string, params?: Params) => translate(lang, key, params);
}

export function isLang(v: unknown): v is Lang {
  return v === "en" || v === "hi";
}

/** Money in rupees, Indian grouping, no decimals. */
export function formatINR(n: number, lang: Lang = "en"): string {
  return new Intl.NumberFormat(lang === "hi" ? "hi-IN" : "en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** ISO date → "26 Aug 2026" / "26 अग॰ 2026". */
export function formatDate(iso: string, lang: Lang = "en"): string {
  const [y, m, d] = iso.split("-").map(Number);
  return new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(Date.UTC(y, m - 1, d)),
  );
}
