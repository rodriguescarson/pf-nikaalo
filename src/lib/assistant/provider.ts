import "server-only";
import type { Intent, Lang, Member, Preflight } from "@/lib/rules/types";
import { computeAmount, computeTds, runPreflight, selectForms, serviceSummary } from "@/lib/rules";
import { formatINR, translate } from "@/i18n";
import { detectIntent } from "./intents";

export interface AssistantContext {
  member: Member;
  intent: Intent;
  asOf: string;
  lang: Lang;
  form121: boolean;
}

export interface AssistantAnswer {
  text: string;
  /** Which provider produced it — shown in the UI for honesty. */
  provider: "scripted" | "openai";
  /** Rule/record facts the answer rests on, for the "sources" line. */
  sources: string[];
  intentId?: string;
}

/** Facts every provider shares: computed once from the rules engine. */
export function computeFacts(ctx: AssistantContext) {
  const svc = serviceSummary(ctx.member.employments, ctx.asOf);
  const preflight: Preflight = runPreflight(ctx.member, ctx.intent, ctx.asOf);
  const sel = selectForms(ctx.member, ctx.intent, svc, ctx.asOf);
  const amount = computeAmount(ctx.member, sel, svc);
  const tds = computeTds({
    pfGross: amount.pfGross,
    continuousYears: svc.continuousYears,
    panVerified: ctx.member.pan.seeded && ctx.member.pan.verified,
    form121Declared: ctx.form121,
  });
  return { svc, preflight, sel, amount, tds };
}

/** Default provider: deterministic, no model, no network. */
export function scriptedAnswer(query: string, ctx: AssistantContext): AssistantAnswer {
  const t = (k: string, p?: Record<string, string | number>) => translate(ctx.lang, k, p);
  const id = detectIntent(query);
  const { svc, preflight, sel, amount, tds } = computeFacts(ctx);
  const inr = (n: number) => formatINR(n, ctx.lang).replace("₹", "");
  const blocked = preflight.checks.filter((c) => c.status === "fail" && c.blocking);

  switch (id) {
    case "greeting":
      return { text: t("assistant.answers.greeting"), provider: "scripted", sources: [], intentId: id };
    case "reject_risk":
      return blocked.length
        ? {
            text: t("assistant.answers.rejectRisk_blocked", { items: blocked.map((c) => t(`check.${c.id}.label`)).join(", ") }),
            provider: "scripted",
            sources: blocked.map((c) => `check.${c.id}`),
            intentId: id,
          }
        : { text: t("assistant.answers.rejectRisk_clear"), provider: "scripted", sources: ["preflight.canSubmit"], intentId: id };
    case "tds":
      return tds.applicable
        ? {
            text: t("assistant.answers.tds_some", { amount: inr(tds.amount), rate: `${Math.round(tds.rate * 100)}%`, reason: t(tds.reasonKey), net: inr(tds.net) }),
            provider: "scripted",
            sources: ["tds.192A", tds.reasonKey],
            intentId: id,
          }
        : { text: t("assistant.answers.tds_none", { reason: t(tds.reasonKey) }), provider: "scripted", sources: [tds.reasonKey], intentId: id };
    case "timeline": {
      const fast = preflight.canSubmit && preflight.checks.every((c) => c.status === "pass");
      return { text: t(fast ? "assistant.answers.timeline_fast" : "assistant.answers.timeline_standard"), provider: "scripted", sources: [fast ? "schedule.fastTrack" : "schedule.standard"], intentId: id };
    }
    case "form121":
      return { text: t("assistant.answers.form121"), provider: "scripted", sources: ["tds.form121"], intentId: id };
    case "doe":
      return { text: t("assistant.answers.doe"), provider: "scripted", sources: ["fix.MARK_EXIT"], intentId: id };
    case "forms":
      return { text: t("assistant.answers.forms", { forms: sel.forms.map((f) => t(`forms.${f}`)).join(" + ") }), provider: "scripted", sources: [sel.rationaleKey], intentId: id };
    case "amount":
      return { text: t("assistant.answers.amount", { pfGross: inr(amount.pfGross), net: inr(tds.net) }), provider: "scripted", sources: ["passbook", "tds.192A"], intentId: id };
    case "who_fixes": {
      const c = blocked[0] ?? preflight.checks.find((x) => x.status === "warn");
      if (!c || !c.fix) return { text: t("assistant.answers.rejectRisk_clear"), provider: "scripted", sources: [], intentId: id };
      const eta = c.fix.etaDays[1] === 0 ? t("common.sameDay") : t("common.dayRange", { min: c.fix.etaDays[0], max: c.fix.etaDays[1] });
      return {
        text: t("assistant.answers.whoFixes", { check: t(`check.${c.id}.label`), actor: t(`common.${c.fix.actor === "member" ? "you" : c.fix.actor}`), eta }),
        provider: "scripted",
        sources: [`check.${c.id}`, c.fix.stepsKey],
        intentId: id,
      };
    }
    default:
      return { text: t("assistant.fallback"), provider: "scripted", sources: [], intentId: undefined };
  }
}

/**
 * Optional provider: an OpenAI model answering ONLY from the computed facts (no free knowledge), enabled when
 * OPENAI_API_KEY is set. Falls back to the scripted answer on any failure, so the app never depends on it.
 */
export async function openaiAnswer(query: string, ctx: AssistantContext): Promise<AssistantAnswer | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const facts = computeFacts(ctx);
  const t = (k: string) => translate(ctx.lang, k);
  const digest = {
    language: ctx.lang === "hi" ? "Hindi (Devanagari)" : "English (plain, lightly Hinglish)",
    member: { name: ctx.member.name, serviceYears: facts.svc.continuousYears, employers: ctx.member.employments.length },
    checks: facts.preflight.checks.map((c) => ({ id: c.id, status: c.status, blocking: c.blocking, message: t(c.messageKey), fix: c.fix ? { actor: c.fix.actor, selfServe: c.fix.selfServe, etaDays: c.fix.etaDays, steps: t(c.fix.stepsKey) } : null })),
    canSubmit: facts.preflight.canSubmit,
    forms: facts.sel.forms.map((f) => t(`forms.${f}`)),
    formsWhy: t(facts.sel.rationaleKey),
    amount: facts.amount,
    tds: { ...facts.tds, reason: t(facts.tds.reasonKey) },
    form121: t("assistant.answers.form121"),
    timeline: t(facts.preflight.checks.every((c) => c.status === "pass") ? "assistant.answers.timeline_fast" : "assistant.answers.timeline_standard"),
  };
  try {
    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL ?? "gpt-5-mini",
        max_output_tokens: 220,
        instructions:
          "You are Sahayak, a plain-spoken assistant inside PF Nikaalo, an independent (non-government) prototype for EPFO withdrawal claims. Answer ONLY from the FACTS JSON; if the facts do not cover the question say you cannot answer that here and point to the checks screen. Reply in the language named in facts.language, in at most 3 short sentences, no exclamation marks, no legal advice, never invent numbers. Rupee amounts must come from the facts.",
        input: `FACTS: ${JSON.stringify(digest)}\n\nQUESTION: ${query}`,
      }),
      signal: AbortSignal.timeout(12_000),
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { output_text?: string; output?: { content?: { text?: string }[] }[] };
    const text = j.output_text ?? j.output?.flatMap((o) => o.content ?? []).map((c) => c.text ?? "").join("") ?? "";
    if (!text.trim()) return null;
    return { text: text.trim(), provider: "openai", sources: ["facts:rules-engine"], intentId: detectIntent(query) ?? undefined };
  } catch {
    return null;
  }
}

export async function answer(query: string, ctx: AssistantContext): Promise<AssistantAnswer> {
  return (await openaiAnswer(query, ctx)) ?? scriptedAnswer(query, ctx);
}
