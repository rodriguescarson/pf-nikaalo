import type { SimulatedAction } from "@/lib/rules/types";
import { simulated, sleep } from "@/lib/simulate";
import { loadMember, recordFix } from "@/mock/store";

export const dynamic = "force-dynamic";
const provider = "EPFO KYC update";
const actions: readonly SimulatedAction[] = ["UPDATE_PROFILE", "RESEED_BANK", "SEED_PAN", "MARK_EXIT"];

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const input = body && typeof body === "object" ? body as { uan?: unknown; action?: unknown } : {};
  if (typeof input.uan !== "string" || !/^\d{12}$/.test(input.uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  if (typeof input.action !== "string" || !actions.includes(input.action as SimulatedAction)) return simulated(provider, { error: "invalid_action" }, { status: 400 });
  if (!await loadMember(input.uan)) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  await recordFix(input.action as SimulatedAction);
  return simulated(provider, { ok: true, member: await loadMember(input.uan) });
}
