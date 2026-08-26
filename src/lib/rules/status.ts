import { CREDIT_LAG_DAYS, FAST_TRACK_SCHEDULE, REJECTION_DAY, STANDARD_SCHEDULE } from "./constants";
import { addDays } from "./normalize";
import { explainRejection } from "./rejection";
import type { Claim, StageEvent, StageId, StatusView } from "./types";

type ProcessingStage = Exclude<StageId, "REJECTED">;
const stages: ProcessingStage[] = ["SUBMITTED", "RECEIVED_FIELD_OFFICE", "UNDER_PROCESS", "APPROVED", "SETTLED"];
const event = (stage: StageId, at: string, done: boolean, current: boolean, expectedBy?: string): StageEvent => ({ stage, at, done, current, ...(expectedBy ? { expectedBy } : {}), actorKey: `status.${stage}.actor`, nextKey: `status.${stage}.next` });

export function deriveStatus(claim: Claim, now: string): StatusView {
  const schedule = claim.fastTrack ? FAST_TRACK_SCHEDULE : STANDARD_SCHEDULE;
  const rejectionAt = addDays(claim.submittedAt, REJECTION_DAY);
  if (claim.forcedOutcome && now >= rejectionAt) {
    const completed = stages.filter((stage) => addDays(claim.submittedAt, schedule[stage]) < rejectionAt).map((stage) => event(stage, addDays(claim.submittedAt, schedule[stage]), true, false));
    const rejected = event("REJECTED", rejectionAt, true, true);
    return { events: [...completed, rejected], current: "REJECTED", rejection: explainRejection(claim.forcedOutcome.code, null) };
  }
  const dated = stages.map((stage) => ({ stage, at: addDays(claim.submittedAt, schedule[stage]) }));
  const doneIndices = dated.map((item, index) => item.at <= now ? index : -1).filter((index) => index >= 0);
  const currentIndex = doneIndices.at(-1) ?? 0;
  const events = dated.map((item, index) => event(item.stage, item.at, item.at <= now, index === currentIndex, index === currentIndex ? dated[index + 1]?.at : undefined));
  const settled = events.find((item) => item.stage === "SETTLED");
  return { events, current: dated[currentIndex].stage, ...(settled?.done ? { expectedCreditDate: addDays(settled.at, CREDIT_LAG_DAYS[0]) } : {}) };
}
