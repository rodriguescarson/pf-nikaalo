"use client";

import Link from "next/link";
import { useT } from "@/i18n/useT";
import { Icon } from "@/components/Icon";

export function StatusActions({ claimId, shareText, rejected }: { claimId: string; shareText: string; rejected: boolean }) {
  const t = useT();
  const wa = `https://wa.me/?text=${encodeURIComponent(`${shareText}\n${typeof window !== "undefined" ? window.location.href : ""}`)}`;
  return (
    <div className="mt-6 flex flex-wrap gap-2 no-print">
      <a href={wa} target="_blank" rel="noreferrer" className="tap inline-flex items-center gap-2 rounded-[var(--radius-cloth)] border border-ink/30 px-4 py-2.5 t-label text-ink hover:bg-paper-2">
        <Icon name="share" size={16} /> {t("status.share")}
      </a>
      <button type="button" onClick={() => window.print()} className="tap inline-flex items-center gap-2 rounded-[var(--radius-cloth)] border border-ink/30 px-4 py-2.5 t-label text-ink hover:bg-paper-2">
        <Icon name="printer" size={16} /> {t("status.print")}
      </button>
      {rejected ? (
        <Link href={`/status/${claimId}/why`} className="tap inline-flex items-center gap-2 rounded-[var(--radius-cloth)] bg-cloth text-white px-4 py-2.5 t-label hover:bg-cloth-deep">
          <Icon name="help" size={16} /> {t("status.whyRejected")}
        </Link>
      ) : null}
      <Link href="/claims" className="tap inline-flex items-center gap-2 px-2 py-2.5 text-sm underline text-ink-2">
        {t("nav.claims")}
      </Link>
    </div>
  );
}
