"use client";

import { useT } from "@/i18n/useT";
import { Icon } from "./Icon";

/** On every page, by rule: this is an independent prototype, not EPFO, and every record is synthetic. */
export function Banner() {
  const t = useT();
  return (
    <div role="note" className="no-print px-3 pt-2">
      <p className="mx-auto w-full max-w-[72rem] rounded-full bg-ochre-fill/80 text-ochre px-4 py-1.5 text-2xs sm:text-xs flex items-start sm:items-center gap-2 leading-snug">
        <Icon name="info" size={14} className="mt-0.5 sm:mt-0 shrink-0" />
        <span>
          <strong className="font-bold">{t("banner.lead")}</strong> {t("banner.body")}
        </span>
      </p>
    </div>
  );
}
