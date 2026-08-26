import { cookies } from "next/headers";
import { COOKIE } from "@/lib/session";
import { simulated, sleep } from "@/lib/simulate";

export const dynamic = "force-dynamic";
const provider = "Session";

export async function DELETE() {
  await sleep();
  const jar = await cookies();
  for (const { name } of jar.getAll()) if (name.startsWith("pfn_") && name !== COOKIE.lang) jar.delete(name);
  return simulated(provider, { ok: true });
}
