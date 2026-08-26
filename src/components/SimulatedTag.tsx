"use client";

import { useT } from "@/i18n/useT";
import { Icon } from "./Icon";

/** Every dependency that is not real says so, right where it is used. */
export function SimulatedTag({ label, provider }: { label?: string; provider?: string }) {
  const t = useT();
  const text = label ?? (provider ? t("common.simulatedProvider", { provider }) : t("common.simulated"));
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-dashed border-ink-3/60 px-2 py-0.5 text-2xs text-ink-2 leading-none">
      <Icon name="info" size={11} />
      {text}
    </span>
  );
}
