import { cookies } from "next/headers";
import { COOKIE, COOKIE_OPTS, todayISO } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";

export const dynamic = "force-dynamic";
const provider = "Demo clock";

export async function POST(request: Request) {
  await sleep();
  const body: unknown = await request.json().catch(() => null);
  const days = body && typeof body === "object" ? (body as { days?: unknown }).days : undefined;
  if (typeof days !== "number" || !Number.isInteger(days) || days < -365 || days > 365) return simulated(provider, { error: "invalid_days" }, { status: 400 });
  const offset = days === 0 ? 0 : days;
  (await cookies()).set(COOKIE.demoOffset, String(offset), COOKIE_OPTS);
  return simulated(provider, { today: todayISO(offset) });
}
