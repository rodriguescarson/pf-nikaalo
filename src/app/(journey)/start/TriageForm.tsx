"use client";

import Link from "next/link";
import { useState } from "react";
import type { Intent } from "@/lib/rules/types";
import { useT } from "@/i18n/useT";
import { Icon } from "@/components/Icon";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";

/** One question. Four plain-language answers. The form number is our problem. */
export function TriageForm({
  intents,
  current,
  resumeClaimId,
  action,
  resetAction,
}: {
  intents: Intent[];
  current?: Intent;
  resumeClaimId?: string;
  action: (fd: FormData) => Promise<void>;
  resetAction: () => Promise<void>;
}) {
  const t = useT();
  const [chosen, setChosen] = useState<Intent | undefined>(current);
  return (
    <>
      {resumeClaimId ? (
        <div className="sheet p-4 mb-5 flex items-center gap-3">
          <Icon name="clock" size={20} className="text-cloth shrink-0" />
          <div className="flex-1 text-sm text-ink-2">{t("start.resume")}</div>
          <Link href={`/status/${resumeClaimId}`} className="t-label text-cloth underline shrink-0">
            {t("start.resumeCta")}
          </Link>
        </div>
      ) : null}
      <form id="triage" action={action}>
        <fieldset className="sheet ledger">
          <legend className="sr-only">{t("start.title")}</legend>
          {intents.map((intent, i) => {
            const selected = chosen === intent;
            return (
              <label key={intent} className={`ledger-row cursor-pointer ${selected ? "bg-cloth-tint/60" : "hover:bg-paper-2"}`}>
                <div className="flex items-start justify-center pt-4">
                  <input
                    type="radio"
                    name="intent"
                    value={intent}
                    checked={selected}
                    onChange={() => setChosen(intent)}
                    className="h-5 w-5 accent-[var(--color-cloth)]"
                  />
                </div>
                <div className="px-4 py-3.5">
                  <div className="t-label text-[0.9375rem] text-ink leading-snug">{t(`start.options.${intent}.title`)}</div>
                  <div className="mt-1 text-sm text-ink-2">{t(`start.options.${intent}.body`)}</div>
                </div>
                <div className="pr-4 pt-4 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
              </label>
            );
          })}
        </fieldset>
      </form>
      {resumeClaimId ? (
        <form action={resetAction} className="mt-4">
          <button type="submit" className="text-sm underline text-ink-2">
            {t("start.startFresh")}
          </button>
        </form>
      ) : null}
      <ActionBar>
        <PrimaryButton type="submit" form="triage" disabled={!chosen}>
          {t("common.continue")}
          <Icon name="arrowRight" size={20} />
        </PrimaryButton>
      </ActionBar>
    </>
  );
}
