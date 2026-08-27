import type { Lang } from "@/lib/rules/types";
import { makeT } from "@/i18n";

export const JOURNEY_STEPS = ["login", "start", "check", "claim", "review", "status"] as const;
export type JourneyStep = (typeof JOURNEY_STEPS)[number];

/** Progress pills: done in deep green, current in lime, the rest pale. */
export function Stepper({ current, lang, minutes }: { current: JourneyStep; lang: Lang; minutes?: number }) {
  const t = makeT(lang);
  const idx = JOURNEY_STEPS.indexOf(current);
  const label = t("common.step", { n: idx + 1, total: JOURNEY_STEPS.length });
  return (
    <div className="mb-5 no-print" aria-label={label}>
      <div className="flex items-center gap-1.5" role="progressbar" aria-valuemin={1} aria-valuemax={JOURNEY_STEPS.length} aria-valuenow={idx + 1} aria-valuetext={label}>
        {JOURNEY_STEPS.map((s, i) => (
          <span key={s} className={`h-2 flex-1 rounded-full transition-colors ${i < idx ? "bg-green" : i === idx ? "bg-lime shadow-[0_0_0_3px_rgb(182_240_54_/_0.25)]" : "bg-rule-2/70"}`} />
        ))}
      </div>
      <div className="mt-1.5 flex items-center justify-between text-2xs text-ink-3">
        <span className="t-label text-2xs">{label}</span>
        {minutes ? <span>{t("common.estMinutes", { n: minutes })}</span> : null}
      </div>
    </div>
  );
}
