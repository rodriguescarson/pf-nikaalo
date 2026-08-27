"use client";

import { useId, useMemo, useState } from "react";

const DEFAULT_RAMP = ["var(--color-seq-2)", "var(--color-seq-3)", "var(--color-seq-4)", "var(--color-seq-5)"];

/** Rows × columns of cells on a one-hue sequential ramp (5 quantile steps); empty cells are outlined, not filled. */
export function Heatmap({ rows, cols, cells, formatValue, ariaLabel, ramp = DEFAULT_RAMP }: { rows: string[]; cols: string[]; cells: Record<string, number | null>; formatValue: (n: number) => string; ariaLabel: string; ramp?: string[] }) {
  const id = useId();
  const [hover, setHover] = useState<{ r: string; c: string; v: number } | null>(null);
  const thresholds = useMemo(() => {
    const vals = Object.values(cells).filter((v): v is number => typeof v === "number" && v > 0).sort((a, b) => a - b);
    if (vals.length === 0) return [];
    return [0.25, 0.5, 0.75].map((q) => vals[Math.min(vals.length - 1, Math.floor(q * vals.length))]);
  }, [cells]);
  const step = (v: number) => thresholds.filter((t) => v > t).length;

  return (
    <div className="relative overflow-x-auto">
      <table className="border-separate border-spacing-[2px]" role="img" aria-label={ariaLabel} aria-describedby={`${id}-tbl`}>
        <thead>
          <tr>
            <th />
            {cols.map((c) => (
              <th key={c} className="text-2xs font-normal text-ink-3 pb-0.5 text-center" scope="col">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <th className="text-2xs font-normal text-ink-2 pr-2 text-left tnum" scope="row">
                {r}
              </th>
              {cols.map((c) => {
                const v = cells[`${r}|${c}`];
                const empty = v == null;
                return (
                  <td key={c} className="p-0">
                    <div
                      className="h-4 w-4 sm:h-[18px] sm:w-[18px] rounded-[3px] transition-transform hover:scale-110"
                      style={empty ? { border: "1px solid var(--color-rule)" } : { background: ramp[Math.min(ramp.length - 1, step(v))] }}
                      onMouseEnter={() => (empty ? setHover(null) : setHover({ r, c, v }))}
                      onMouseLeave={() => setHover(null)}
                      title={empty ? `${r} ${c}: —` : `${r} ${c}: ${formatValue(v)}`}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-2 flex items-center gap-1.5 text-2xs text-ink-3">
        <span>less</span>
        {ramp.map((c, i) => (
          <span key={i} className="inline-block h-2.5 w-2.5 rounded-[2px]" style={{ background: c }} aria-hidden="true" />
        ))}
        <span>more</span>
        {hover ? (
          <span className="ml-auto text-ink-2" role="status">
            {hover.r} {hover.c} · <span className="t-num text-ink tnum">{formatValue(hover.v)}</span>
          </span>
        ) : null}
      </div>
      <table id={`${id}-tbl`} className="sr-only">
        <tbody>
          {rows.map((r) => (
            <tr key={r}>
              <td>{r}</td>
              {cols.map((c) => (
                <td key={c}>{cells[`${r}|${c}`] == null ? "—" : formatValue(cells[`${r}|${c}`] as number)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
