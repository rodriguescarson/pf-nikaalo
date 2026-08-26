import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { answer } from "@/lib/assistant/provider";
import { loadClaim, loadMember } from "@/mock/store";
import { getDemoOffsetDays, getLang, todayISO, COOKIE } from "@/lib/session";
import type { Intent } from "@/lib/rules/types";

export const dynamic = "force-dynamic";

/** Sahayak: answers from the rules engine and the member's own record. Not a mock — the real assistant. */
export async function POST(req: Request) {
  let body: { uan?: string; intent?: Intent; query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }
  const query = String(body.query ?? "").slice(0, 400);
  const uan = String(body.uan ?? "");
  const member = await loadMember(uan);
  if (!member) return NextResponse.json({ error: "unknown_uan" }, { status: 404 });
  const jar = await cookies();
  const intent = (body.intent ?? (jar.get(COOKIE.intent)?.value as Intent | undefined) ?? "full_withdrawal") as Intent;
  const claim = await loadClaim();
  const asOf = todayISO(await getDemoOffsetDays());
  const lang = await getLang();
  const a = await answer(query, { member, intent, asOf, lang, form121: Boolean(claim?.form121) });
  return NextResponse.json(a, { headers: { "cache-control": "no-store" } });
}
