"use client";

import type { StatusView } from "@/lib/rules/types";
import { formatINR } from "@/i18n";
import { useLang, useT } from "@/i18n/useT";

export function SmsPreview({ status, claimId, amount, last4, reason }: { status: StatusView; claimId: string; amount: number; last4: string; reason?: string }) {
  const t = useT();
  const lang = useLang();

  return (
    <section>
      <h2 className="t-label text-ink">{t("status.smsTitle")}</h2>
      <div className="mt-2 max-w-[22rem] rounded-2xl rounded-tl-sm bg-paper-2 px-4 py-3 text-sm leading-relaxed text-ink">
        <div className="t-label text-2xs text-ink-3">{t("status.smsFrom")}</div>
        <p className="mt-1.5">{t(`status.${status.current}.sms`, { id: claimId, last4, amount: formatINR(amount, lang).replace("₹", ""), reason: reason ?? "" })}</p>
      </div>
    </section>
  );
}
