import { cookies } from "next/headers";
import { COOKIE, COOKIE_OPTS } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";
import { MEMBERS } from "@/mock/members";

export const dynamic = "force-dynamic";
const provider = "EPFO OTP";

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const uan = body && typeof body === "object" ? (body as { uan?: unknown }).uan : undefined;
  if (typeof uan !== "string" || !/^\d{12}$/.test(uan)) return simulated(provider, { error: "invalid_uan" }, { status: 400 });
  if (!MEMBERS[uan]) return simulated(provider, { error: "unknown_uan" }, { status: 404 });
  (await cookies()).set(COOKIE.uan, uan, COOKIE_OPTS);
  return simulated(provider, { ok: true, sentToLast2: uan.slice(-2) });
}

export async function PUT(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const otp = body && typeof body === "object" ? (body as { otp?: unknown }).otp : undefined;
  if (typeof otp !== "string" || !/^\d{6}$/.test(otp)) return simulated(provider, { error: "invalid_otp" }, { status: 400 });
  return simulated(provider, { ok: true });
}
