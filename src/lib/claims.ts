import "server-only";
import type { Claim, Member } from "@/lib/rules/types";
import { buildClaim, loadClaim, seededPriorClaims } from "@/mock/store";

/** Every claim this member can see: the one filed in this session plus the seeded history. */
export async function allClaimsFor(member: Member): Promise<Claim[]> {
  const stored = await loadClaim();
  const live = stored && stored.uan === member.uan ? await buildClaim(stored) : undefined;
  const prior = seededPriorClaims(member);
  return [...(live ? [live] : []), ...prior].sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export async function findClaim(member: Member, id: string): Promise<Claim | undefined> {
  return (await allClaimsFor(member)).find((c) => c.id === id);
}
