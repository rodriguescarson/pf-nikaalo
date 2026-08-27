"use client";

import type { StatusView } from "@/lib/rules/types";
import { formatDate } from "@/i18n";
import { useLang, useT } from "@/i18n/useT";
import { Icon } from "./Icon";

export function Timeline({ status, claimId: _claimId, amount: _amount, last4: _last4 }: { status: StatusView; claimId: string; amount: number; last4: string }) {
  const t = useT();
  const lang = useLang();

  return (
    <>
      <ol className="sheet ledger" aria-label={t("status.title", { id: _claimId })}>
        {status.events.map((event, index) => {
          const isLast = index === status.events.length - 1;
          const isFuture = !event.done && !event.current;

          return (
            <li key={`${event.stage}-${event.at}`} className="ledger-row" aria-current={event.current ? "step" : undefined}>
              <div className="relative self-stretch">
                {index > 0 ? <span className={`absolute left-1/2 top-0 h-[1.875rem] -translate-x-1/2 border-l ${event.done ? "border-ink" : "border-dashed border-rule"}`} aria-hidden="true" /> : null}
                {!isLast ? <span className={`absolute left-1/2 top-[1.875rem] bottom-0 -translate-x-1/2 border-l ${status.events[index + 1].done ? "border-ink" : "border-dashed border-rule"}`} aria-hidden="true" /> : null}
                <div className="relative z-10 flex justify-center pt-4">
                  <StationMark current={event.current} done={event.done} rejected={event.stage === "REJECTED"} />
                </div>
              </div>
              <div className="px-4 py-3.5">
                <div className="t-label text-[0.9375rem] text-ink">{t(`status.${event.stage}.title`)}</div>
                <p className="mt-1 text-sm text-ink-2">
                  <span className="text-ink-3">{t("status.actor")}:</span> {t(event.actorKey)}
                </p>
                {event.current ? (
                  <p className="mt-1 text-sm leading-snug text-ink-2">
                    <span className="text-ink-3">{t("common.whatNext")}:</span> {t(event.nextKey)}
                  </p>
                ) : null}
                {event.done ? <p className="mt-1 text-sm text-ink-3">{t("status.doneAt", { date: formatDate(event.at, lang) })}</p> : null}
                {event.current && event.expectedBy ? <p className="mt-1 text-sm text-ink-3">{t("status.expectedBy", { date: formatDate(event.expectedBy, lang) })}</p> : null}
              </div>
              <time dateTime={event.at} className={`t-num pr-4 pt-4 text-right text-sm ${isFuture ? "text-ink-3" : "text-ink-2"}`}>
                {formatDate(event.at, lang)}
              </time>
            </li>
          );
        })}
      </ol>

      {status.expectedCreditDate ? (
        <p className="mt-3 flex items-center gap-2 text-ink-2">
          <Icon name="landmark" size={18} className="text-cloth" />
          <span className="t-label">{t("status.expectedCredit", { date: formatDate(status.expectedCreditDate, lang) })}</span>
        </p>
      ) : null}
    </>
  );
}

function StationMark({ current, done, rejected }: { current: boolean; done: boolean; rejected: boolean }) {
  if (rejected) {
    return (
      <span className="mark mark-x relative inline-flex h-7 w-7 items-center justify-center bg-sheet" aria-hidden="true">
        <svg className="absolute inset-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
          <circle cx="14" cy="14" r="11.25" stroke="currentColor" strokeWidth="1.75" />
        </svg>
        <Icon name="x" size={16} strokeWidth={2.5} />
      </span>
    );
  }

  if (current) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-cloth bg-sheet" aria-hidden="true">
        <span className="h-2 w-2 rounded-full bg-cloth motion-safe:animate-pulse" />
      </span>
    );
  }

  if (done) {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-ink text-white" aria-hidden="true">
        <Icon name="check" size={16} strokeWidth={2.75} />
      </span>
    );
  }

  return <span className="inline-flex h-7 w-7 rounded-full border-2 border-rule bg-sheet" aria-hidden="true" />;
}
