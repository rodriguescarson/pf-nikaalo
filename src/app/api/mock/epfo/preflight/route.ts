import type { Intent } from "@/lib/rules/types";
import { runPreflight } from "@/lib/rules";
import { getDemoOffsetDays, todayISO } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";
import { loadMember } from "@/mock/store";

export const dynamic = "force-dynamic";
const provider = "EPFO claim pre-validation";
const intents: readonly Intent[] = ["full_withdrawal", "pension_withdrawal", "both", "advance_unemployment"];

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const input = body && typeof body === "object" ? body as { uan?: unknown; intent?: unknown } : {};
  if (typeof input.uan !== "string" || !/^\d{12}$/.test(input.uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  if (typeof input.intent !== "string" || !intents.includes(input.intent as Intent)) return simulated(provider, { error: "invalid_intent" }, { status: 400 });
  const member = await loadMember(input.uan);
  if (!member) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  const asOf = todayISO(await getDemoOffsetDays());
  return simulated(provider, { preflight: runPreflight(member, input.intent as Intent, asOf), asOf });
}
