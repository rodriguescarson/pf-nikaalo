import type { Lang } from "@/lib/rules/types";
import { makeT } from "@/i18n";

export const JOURNEY_STEPS = ["login", "start", "check", "claim", "review", "status"] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Progress as ledger columns: done in ink, current in cloth red, the rest ruled. */
export function Stepper({ current, lang, minutes }: { current: JourneyStep; lang: Lang; minutes?: number }) {
  const t = makeT(lang);
  const idx = JOURNEY_STEPS.indexOf(current);
  return (
    <div className="mb-5 no-print" aria-label={t("common.step", { n: idx + 1, total: JOURNEY_STEPS.length })}>
      <div
        className="flex items-center gap-1.5"
        role="progressbar"
        aria-valuemin={1}
        aria-valuemax={JOURNEY_STEPS.length}
        aria-valuenow={idx + 1}
        aria-valuetext={t("common.step", { n: idx + 1, total: JOURNEY_STEPS.length })}
      >
        {JOURNEY_STEPS.map((s, i) => (
          <span key={s} className={`h-1.5 flex-1 rounded-full ${i < idx ? "bg-ink" : i === idx ? "bg-cloth" : "bg-rule"}`} />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-2xs text-ink-3">
        <span className="t-label text-2xs">{t("common.step", { n: idx + 1, total: JOURNEY_STEPS.length })}</span>
        {minutes ? <span>{t("common.estMinutes", { n: minutes })}</span> : null}
      </div>
    </div>
  );
}
