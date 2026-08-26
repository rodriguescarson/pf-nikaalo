"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatDate } from "@/i18n";
import { useLang, useT } from "@/i18n/useT";
import { Icon } from "./Icon";
import { SimulatedTag } from "./SimulatedTag";

export function DemoClock({ today, offsetDays = 0 }: { today: string; offsetDays?: number }) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [offset, setOffset] = useState(offsetDays);
  const [pending, setPending] = useState(false);

  async function moveTo(days: number) {
    setPending(true);
    try {
      const response = await fetch("/api/mock/demo/clock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ days }),
      });
      if (!response.ok) return;
      setOffset(days);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <section className="sheet p-4" aria-busy={pending}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="t-label text-ink">{t("status.demoTitle")}</h2>
        <SimulatedTag provider="Demo clock" />
      </div>
      <p className="mt-1 text-sm leading-snug text-ink-2">{t("status.demoBody")}</p>
      <p className="mt-3 flex items-center gap-2 text-sm text-ink">
        <Icon name="clock" size={16} className="text-cloth" />
        <span className="t-num">{t("status.today", { date: formatDate(today, lang) })}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => void moveTo(offset + 1)} disabled={pending} className="tap rounded-[var(--radius-sheet)] border border-ink/30 px-3 t-label text-ink hover:bg-paper-2 disabled:opacity-60">
          {t("status.plusOne")}
        </button>
        <button type="button" onClick={() => void moveTo(offset + 5)} disabled={pending} className="tap rounded-[var(--radius-sheet)] border border-ink/30 px-3 t-label text-ink hover:bg-paper-2 disabled:opacity-60">
          {t("status.plusFive")}
        </button>
        <button type="button" onClick={() => void moveTo(0)} disabled={pending} className="tap rounded-[var(--radius-sheet)] border border-ink/30 px-3 t-label text-ink hover:bg-paper-2 disabled:opacity-60">
          {t("status.reset")}
        </button>
      </div>
    </section>
  );
}
