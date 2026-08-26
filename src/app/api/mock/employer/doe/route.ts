import { simulated, sleep } from "@/lib/simulate";
import { loadMember } from "@/mock/store";

export const dynamic = "force-dynamic";
const provider = "Employer ECR request";

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const uan = body && typeof body === "object" ? (body as { uan?: unknown }).uan : undefined;
  if (typeof uan !== "string" || !/^\d{12}$/.test(uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  const member = await loadMember(uan);
  if (!member) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  const latest = member.employments.reduce((current, employment) => !current || employment.doj > current.doj ? employment : current);
  return simulated(provider, { requested: true, employer: latest.employer, etaDays: [3, 15] as [number, number] });
}
