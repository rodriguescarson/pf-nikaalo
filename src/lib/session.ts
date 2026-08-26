import { cookies } from "next/headers";
import type { Lang } from "@/lib/rules/types";
import { isLang, DEFAULT_LANG } from "@/i18n";

/** Cookie names. All values are tiny; the whole session must stay < 1 KB. */
export const COOKIE = {
  lang: "pfn_lang",
  uan: "pfn_uan",
  intent: "pfn_intent",
  fixes: "pfn_fixes", // comma-separated SimulatedAction list applied this session
  claim: "pfn_claim", // JSON: { id, forms, submittedAt, fastTrack, form121 }
  demoOffset: "pfn_demo_days", // integer days added to "today" for the demo clock
} as const;

export const COOKIE_OPTS = { path: "/", sameSite: "lax" as const, httpOnly: false, maxAge: 60 * 60 * 24 * 7 };

export async function getLang(): Promise<Lang> {
  const v = (await cookies()).get(COOKIE.lang)?.value;
  return isLang(v) ? v : DEFAULT_LANG;
}

export async function getUan(): Promise<string | undefined> {
  return (await cookies()).get(COOKIE.uan)?.value || undefined;
}

export async function getDemoOffsetDays(): Promise<number> {
  const v = Number((await cookies()).get(COOKIE.demoOffset)?.value ?? "0");
  return Number.isFinite(v) ? v : 0;
}

export async function getAppliedFixes(): Promise<string[]> {
  const v = (await cookies()).get(COOKIE.fixes)?.value;
  return v ? v.split(",").filter(Boolean) : [];
}

/** "Today" for the app: real UTC date plus the demo offset. ISO YYYY-MM-DD. */
export function todayISO(offsetDays = 0): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}
