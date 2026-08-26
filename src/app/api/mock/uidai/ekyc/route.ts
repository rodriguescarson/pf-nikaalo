import { loadMember } from "@/mock/store";
import { simulated, sleep } from "@/lib/simulate";

export const dynamic = "force-dynamic";
const provider = "UIDAI e-KYC";

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const uan = body && typeof body === "object" ? (body as { uan?: unknown }).uan : undefined;
  if (typeof uan !== "string" || !/^\d{12}$/.test(uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  const member = await loadMember(uan);
  return member ? simulated(provider, { aadhaar: member.aadhaar }) : simulated(provider, { error: "unknown_uan" }, { status: 404 });
}
