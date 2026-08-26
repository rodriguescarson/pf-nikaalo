import type { Intent } from "@/lib/rules/types";
import { deriveStatus, runPreflight, selectForms, serviceSummary } from "@/lib/rules";
import { getDemoOffsetDays, todayISO } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";
import { buildClaim, claimId, loadClaim, loadMember, saveClaim } from "@/mock/store";

export const dynamic = "force-dynamic";
const provider = "EPFO claim intake";
const intents: readonly Intent[] = ["full_withdrawal", "pension_withdrawal", "both", "advance_unemployment"];

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const input = body && typeof body === "object" ? body as { uan?: unknown; intent?: unknown; form121?: unknown } : {};
  if (typeof input.uan !== "string" || !/^\d{12}$/.test(input.uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  if (typeof input.intent !== "string" || !intents.includes(input.intent as Intent)) return simulated(provider, { error: "invalid_intent" }, { status: 400 });
  if (typeof input.form121 !== "boolean") return simulated(provider, { error: "invalid_form121" }, { status: 400 });
  const member = await loadMember(input.uan);
  if (!member) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  const asOf = todayISO(await getDemoOffsetDays());
  const intent = input.intent as Intent;
  const preflight = runPreflight(member, intent, asOf);
  if (!preflight.canSubmit) return simulated(provider, { error: "blocked", blockingCodes: preflight.blockingCodes }, { status: 422 });
  const selection = selectForms(member, intent, serviceSummary(member.employments, asOf), asOf);
  const stored = { id: claimId(input.uan, asOf), uan: input.uan, forms: selection.forms, submittedAt: asOf, fastTrack: preflight.checks.every((check) => check.status === "pass"), form121: input.form121, intent };
  await saveClaim(stored);
  const claim = await buildClaim(stored);
  if (!claim) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  return simulated(provider, { claim, status: deriveStatus(claim, asOf) });
}

export async function GET() {
  await sleep();
  const stored = await loadClaim();
  if (!stored) return simulated(provider, { error: "no_claim" }, { status: 404 });
  const claim = await buildClaim(stored);
  if (!claim) return simulated(provider, { error: "no_claim" }, { status: 404 });
  const asOf = todayISO(await getDemoOffsetDays());
  return simulated(provider, { claim, status: deriveStatus(claim, asOf) });
}
