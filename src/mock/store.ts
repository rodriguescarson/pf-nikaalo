/**
 * Curl-style demo flow (cookies are the complete durable state):
 * curl -c cookies.txt -X POST localhost:3000/api/mock/epfo/otp -H 'content-type: application/json' -d '{"uan":"100000000001"}'
 * curl -b cookies.txt -X POST localhost:3000/api/mock/epfo/preflight -H 'content-type: application/json' -d '{"uan":"100000000001","intent":"full_withdrawal"}'
 * curl -b cookies.txt -c cookies.txt -X POST localhost:3000/api/mock/epfo/claims -H 'content-type: application/json' -d '{"uan":"100000000001","intent":"full_withdrawal","form121":true}'
 * curl -b cookies.txt localhost:3000/api/mock/epfo/claims
 */
import "server-only";

import { cookies } from "next/headers";
import {
  addDays,
  applyFix,
  computeAmount,
  computeTds,
  REJECTION_DAY,
  selectForms,
  serviceSummary,
} from "@/lib/rules";
import type { Claim, ClaimForm, Intent, ISODate, Member, SimulatedAction } from "@/lib/rules/types";
import { COOKIE, COOKIE_OPTS, getAppliedFixes, getDemoOffsetDays, todayISO } from "@/lib/session";
import { getSeedMember } from "@/mock/members";

const ACTIONS: readonly SimulatedAction[] = ["MARK_EXIT", "RESEED_BANK", "UPDATE_PROFILE", "SEED_PAN"];
const INTENTS: readonly Intent[] = ["full_withdrawal", "pension_withdrawal", "both", "advance_unemployment"];
const FORMS: readonly ClaimForm[] = ["FORM_19", "FORM_10C", "FORM_31", "SCHEME_CERTIFICATE"];

export type StoredClaim = {
  id: string;
  uan: string;
  forms: ClaimForm[];
  submittedAt: ISODate;
  fastTrack: boolean;
  form121: boolean;
  intent: Intent;
};

const isAction = (value: string): value is SimulatedAction => ACTIONS.includes(value as SimulatedAction);
const isIntent = (value: unknown): value is Intent => typeof value === "string" && INTENTS.includes(value as Intent);
const isForm = (value: unknown): value is ClaimForm => typeof value === "string" && FORMS.includes(value as ClaimForm);
const isIsoDate = (value: unknown): value is ISODate => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);

export async function loadMember(uan: string): Promise<Member | undefined> {
  let member = getSeedMember(uan);
  if (!member) return undefined;
  const asOf = todayISO(await getDemoOffsetDays());
  for (const action of await getAppliedFixes()) {
    if (isAction(action)) member = applyFix(member, action, asOf);
  }
  return member;
}

export async function recordFix(action: SimulatedAction): Promise<void> {
  const applied = (await getAppliedFixes()).filter(isAction);
  if (!applied.includes(action)) applied.push(action);
  (await cookies()).set(COOKIE.fixes, applied.join(","), COOKIE_OPTS);
}

export async function saveClaim(claim: StoredClaim): Promise<void> {
  const serialized = JSON.stringify(claim);
  if (new TextEncoder().encode(serialized).byteLength >= 1024) throw new Error("claim_cookie_too_large");
  (await cookies()).set(COOKIE.claim, serialized, COOKIE_OPTS);
}

export async function loadClaim(): Promise<StoredClaim | undefined> {
  const raw = (await cookies()).get(COOKIE.claim)?.value;
  if (!raw) return undefined;
  try {
    const candidate: unknown = JSON.parse(raw);
    if (!candidate || typeof candidate !== "object") return undefined;
    const c = candidate as Record<string, unknown>;
    if (typeof c.id !== "string" || !/^\d{12}$/.test(String(c.uan)) || !Array.isArray(c.forms) || !c.forms.every(isForm)
      || !isIsoDate(c.submittedAt) || typeof c.fastTrack !== "boolean" || typeof c.form121 !== "boolean" || !isIntent(c.intent)) return undefined;
    return { id: c.id, uan: c.uan as string, forms: c.forms, submittedAt: c.submittedAt, fastTrack: c.fastTrack, form121: c.form121, intent: c.intent };
  } catch {
    return undefined;
  }
}

export async function clearClaim(): Promise<void> {
  (await cookies()).delete(COOKIE.claim);
}

export function claimId(uan: string, submittedAt: ISODate): string {
  const compactDate = submittedAt.slice(2).replaceAll("-", "");
  let hash = 0;
  for (const char of `${uan}:${submittedAt}`) hash = (Math.imul(hash, 31) + char.charCodeAt(0)) >>> 0;
  return `PFN-${compactDate}-${String((hash % 9_999) + 1).padStart(4, "0")}`;
}

export async function buildClaim(stored: StoredClaim): Promise<Claim | undefined> {
  const member = await loadMember(stored.uan);
  if (!member) return undefined;
  const asOf = todayISO(await getDemoOffsetDays());
  const summary = serviceSummary(member.employments, asOf);
  const selection = selectForms(member, stored.intent, summary, asOf);
  const amount = computeAmount(member, selection, summary);
  const tds = computeTds({ pfGross: amount.pfGross, continuousYears: summary.continuousYears, panVerified: member.pan.verified, form121Declared: stored.form121 });
  return { id: stored.id, uan: stored.uan, forms: stored.forms, submittedAt: stored.submittedAt, fastTrack: stored.fastTrack, amount, tds };
}

export function seededPriorClaims(member: Member): Claim[] {
  const summary = serviceSummary(member.employments, member.uanIssuedOn);
  return member.priorClaims.map((prior) => {
    const selection = { forms: [prior.form], primary: prior.form, rationaleKey: `forms.rationale.${prior.form}`, notAllowed: [] };
    const amount = computeAmount(member, selection, summary);
    const tds = computeTds({ pfGross: amount.pfGross, continuousYears: summary.continuousYears, panVerified: member.pan.verified, form121Declared: false });
    const forcedOutcome = prior.status === "rejected" && prior.reasonCode ? { stage: "REJECTED" as const, code: prior.reasonCode } : undefined;
    return { id: prior.id, uan: member.uan, forms: [prior.form], submittedAt: prior.status === "rejected" ? addDays(prior.date, -REJECTION_DAY) : prior.date, fastTrack: false, amount, tds, ...(forcedOutcome ? { forcedOutcome } : {}) };
  });
}
