"use client";

import { useT } from "@/i18n/useT";
import { Icon } from "./Icon";

/** On every page, by rule: this is an independent prototype, not EPFO, and every record is synthetic. */
export function Banner() {
  const t = useT();
  return (
    <div role="note" className="bg-ochre-fill text-ochre border-b border-rule no-print">
      <p className="mx-auto w-full max-w-[34rem] px-4 py-1.5 text-2xs sm:text-xs flex items-start gap-2 leading-snug">
        <Icon name="info" size={14} className="mt-0.5 shrink-0" />
        <span>
          <strong className="font-semibold">{t("banner.lead")}</strong> {t("banner.body")}
        </span>
      </p>
    </div>
  );
}
