"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useLang, useT } from "@/i18n/useT";
import { formatDate, formatINR } from "@/i18n";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/Sheet";
import { ListToolbar, Segmented } from "@/components/ListToolbar";

export type ClaimRow = { id: string; submittedAt: string; forms: string; stage: string; stageLabel: string; bucket: "pending" | "settled" | "rejected"; net: number };

export function ClaimsList({ rows }: { rows: ClaimRow[] }) {
  const t = useT();
  const lang = useLang();
  const [bucket, setBucket] = useState<"all" | ClaimRow["bucket"]>("all");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const shown = useMemo(() => {
    const f = rows.filter((r) => bucket === "all" || r.bucket === bucket);
    return f.sort((a, b) => (sort === "newest" ? (a.submittedAt < b.submittedAt ? 1 : -1) : a.submittedAt > b.submittedAt ? 1 : -1));
  }, [rows, bucket, sort]);

  if (rows.length === 0) {
    return (
      <Sheet className="p-6 text-center">
        <Icon name="file" size={28} className="mx-auto text-ink-3" />
        <p className="mt-3 text-[0.9375rem] text-ink-2">{t("claims.empty")}</p>
        <Link href="/start" className="mt-4 inline-flex items-center gap-2 rounded-[var(--radius-cloth)] bg-cloth text-white px-4 py-2.5 t-label">
          {t("claims.start")} <Icon name="arrowRight" size={16} />
        </Link>
      </Sheet>
    );
  }

  return (
    <>
      <ListToolbar>
        <Segmented
          value={bucket}
          onChange={setBucket}
          options={[
            { value: "all", label: t("claims.filterAll") },
            { value: "pending", label: t("claims.filterPending") },
            { value: "settled", label: t("claims.filterSettled") },
            { value: "rejected", label: t("claims.filterRejected") },
          ]}
          label={t("claims.filterAll")}
        />
        <Segmented
          value={sort}
          onChange={setSort}
          options={[
            { value: "newest", label: t("passbook.sortNewest") },
            { value: "oldest", label: t("passbook.sortOldest") },
          ]}
          label={t("passbook.sortNewest")}
          icon="sort"
        />
      </ListToolbar>
      {shown.length === 0 ? (
        <Sheet className="p-5 text-sm text-ink-2">{t("claims.emptyFiltered")}</Sheet>
      ) : (
        <Sheet ledger>
          <ul>
            {shown.map((r, i) => (
              <li key={r.id} className="ledger-row hover:bg-paper-2 items-center">
                <Link href={`/status/${r.id}`} className="col-span-3 grid grid-cols-[3.25rem_1fr_auto] items-center">
                  <div className="flex items-center justify-center">
                {r.bucket === "rejected" ? (
                  <span className="mark-x">
                    <Icon name="x" size={18} strokeWidth={2.5} />
                  </span>
                ) : r.bucket === "settled" ? (
                  <span className="mark-tick">
                    <Icon name="check" size={18} strokeWidth={2.5} />
                  </span>
                ) : (
                  <span className="text-cloth">
                    <Icon name="clock" size={18} />
                  </span>
                )}
                  </div>
                  <div className="px-4 py-3">
                <div className="t-num text-[0.9375rem] text-ink tnum">{r.id}</div>
                <div className="text-sm text-ink-2 mt-0.5">
                  {r.forms} · {t("claims.filedOn", { date: formatDate(r.submittedAt, lang) })}
                </div>
                <div className="t-label text-sm mt-1 text-ink">{r.stageLabel}</div>
                  </div>
                  <div className="pr-4 py-3 text-right">
                <div className="t-num text-[0.9375rem] text-ink tnum">{formatINR(r.net, lang)}</div>
                <div className="text-2xs text-ink-3 t-num">{String(i + 1).padStart(2, "0")}</div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Sheet>
      )}
    </>
  );
}
