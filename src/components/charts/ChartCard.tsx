"use client";

import { useState, type ReactNode } from "react";
import { Icon } from "@/components/Icon";

/** A titled chart surface with an optional table view (the accessibility and contrast fallback). */
export function ChartCard({ title, sub, children, table, labels }: { title: string; sub?: string; children: ReactNode; table?: ReactNode; labels: { tableView: string; chartView: string } }) {
  const [asTable, setAsTable] = useState(false);
  return (
    <section className="sheet p-4 sm:p-5" aria-label={title}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="t-label text-ink">{title}</h3>
          {sub ? <p className="mt-0.5 text-sm text-ink-2">{sub}</p> : null}
        </div>
        {table ? (
          <button
            type="button"
            onClick={() => setAsTable((v) => !v)}
            aria-pressed={asTable}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full border border-rule bg-white px-3 py-1.5 text-2xs t-label text-ink-2 hover:bg-canvas-2"
          >
            <Icon name={asTable ? "shield" : "file"} size={12} />
            {asTable ? labels.chartView : labels.tableView}
          </button>
        ) : null}
      </div>
      <div className="mt-4">{asTable && table ? <div className="overflow-x-auto">{table}</div> : children}</div>
    </section>
  );
}
