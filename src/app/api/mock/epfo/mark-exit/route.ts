import { addMonths, endOfMonth } from "@/lib/rules";
import { getDemoOffsetDays, todayISO } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";
import { loadMember, recordFix } from "@/mock/store";

export const dynamic = "force-dynamic";
const provider = "EPFO Mark Exit";

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const uan = body && typeof body === "object" ? (body as { uan?: unknown }).uan : undefined;
  if (typeof uan !== "string" || !/^\d{12}$/.test(uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  const member = await loadMember(uan);
  if (!member) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  const latest = member.employments.reduce((current, employment) => !current || employment.doj > current.doj ? employment : current);
  const asOf = todayISO(await getDemoOffsetDays());
  if (asOf < addMonths(endOfMonth(latest.lastContributionMonth), 2)) return simulated(provider, { error: "too_early" }, { status: 409 });
  await recordFix("MARK_EXIT");
  return simulated(provider, { ok: true, doe: endOfMonth(latest.lastContributionMonth) });
}
