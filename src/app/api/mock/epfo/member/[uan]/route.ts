import { loadMember } from "@/mock/store";
import { simulated, sleep } from "@/lib/simulate";

export const dynamic = "force-dynamic";
const provider = "EPFO member record";

export async function GET(_request: Request, { params }: { params: Promise<{ uan: string }> }) {
  await sleep();
  const { uan } = await params;
  if (!/^\d{12}$/.test(uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  const member = await loadMember(uan);
  return member ? simulated(provider, { member }) : simulated(provider, { error: "unknown_uan" }, { status: 404 });
}
