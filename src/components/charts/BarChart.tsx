"use client";

import { useId, useState } from "react";

type Series = { key: string; label: string; color: string };
type Group = { label: string; values: Record<string, number> };

const W = 640;
const PAD = { top: 22, right: 8, bottom: 30, left: 8 };
const MAX_BAR = 24;
const GAP = 2;

/** Grouped or stacked columns: ≤ 24 px bars, 2 px gaps, rounded data-ends, one direct label per group, hover tooltip. */
export function BarChart({ groups, series, stacked = false, formatValue, ariaLabel, height = 200 }: { groups: Group[]; series: Series[]; stacked?: boolean; formatValue: (n: number) => string; ariaLabel: string; height?: number }) {
  const id = useId();
  const [hover, setHover] = useState<{ g: number; s: number } | null>(null);
  const H = height;
  const g = groups.length;
  const totals = groups.map((gr) => (stacked ? series.reduce((a, s) => a + (gr.values[s.key] ?? 0), 0) : Math.max(...series.map((s) => gr.values[s.key] ?? 0), 0)));
  const max = Math.max(1, ...totals);
  const slot = (W - PAD.left - PAD.right) / Math.max(1, g);
  const inner = stacked ? 1 : series.length;
  const bw = Math.min(MAX_BAR, (slot - 16 - GAP * (inner - 1)) / inner);
  const y = (v: number) => PAD.top + (1 - v / max) * (H - PAD.top - PAD.bottom);
  const base = y(0);

  function bar(gi: number, si: number) {
    const v = groups[gi].values[series[si].key] ?? 0;
    const cx = PAD.left + slot * gi + slot / 2;
    if (stacked) {
      const before = series.slice(0, si).reduce((a, s) => a + (groups[gi].values[s.key] ?? 0), 0);
      const x0 = cx - bw / 2;
      const y0 = y(before + v) + (si > 0 ? GAP / 2 : 0);
      const y1 = y(before) - (si < series.length - 1 ? GAP / 2 : 0);
      return { x: x0, y: y0, w: bw, h: Math.max(0, y1 - y0), v, top: si === series.length - 1 };
    }
    const groupW = bw * inner + GAP * (inner - 1);
    const x0 = cx - groupW / 2 + si * (bw + GAP);
    return { x: x0, y: y(v), w: bw, h: Math.max(0, base - y(v)), v, top: true };
  }

  const r = 4;
  const roundedTop = (x: number, yTop: number, w: number, h: number) =>
    h <= 0 ? "" : `M${x},${yTop + h} L${x},${yTop + r} Q${x},${yTop} ${x + r},${yTop} L${x + w - r},${yTop} Q${x + w},${yTop} ${x + w},${yTop + r} L${x + w},${yTop + h} Z`;

  const hv = hover ? bar(hover.g, hover.s) : null;

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label={ariaLabel} aria-describedby={`${id}-tbl`} className="block" onMouseLeave={() => setHover(null)}>
        <line x1={PAD.left} x2={W - PAD.right} y1={base} y2={base} stroke="var(--color-rule)" strokeWidth="1" />
        {groups.map((gr, gi) => (
          <g key={gi}>
            {series.map((s, si) => {
              const b = bar(gi, si);
              return (
                <g key={s.key}>
                  <path d={b.top ? roundedTop(b.x, b.y, b.w, b.h) : `M${b.x},${b.y} h${b.w} v${b.h} h-${b.w} Z`} fill={s.color} />
                  <rect x={b.x - 4} y={PAD.top} width={b.w + 8} height={H - PAD.top - PAD.bottom} fill="transparent" onMouseEnter={() => setHover({ g: gi, s: si })} onTouchStart={() => setHover({ g: gi, s: si })} />
                </g>
              );
            })}
            <text x={PAD.left + slot * gi + slot / 2} y={y(totals[gi]) - 6} textAnchor="middle" className="fill-ink" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
              {formatValue(totals[gi])}
            </text>
            <text x={PAD.left + slot * gi + slot / 2} y={H - 10} textAnchor="middle" className="fill-ink-3" fontSize="10" fontFamily="var(--font-sans)">
              <title>{gr.label}</title>
              {gr.label.length > Math.max(6, slot / 7) ? gr.label.slice(0, Math.max(5, Math.floor(slot / 7)) - 1) + "…" : gr.label}
            </text>
          </g>
        ))}
      </svg>
      {hover && hv ? (
        <div className="pointer-events-none absolute top-1 sheet px-3 py-2 text-2xs text-ink-2 leading-tight" style={{ left: `${Math.min(80, (hv.x / W) * 100)}%` }} role="status">
          <div>
            {groups[hover.g].label} · {series[hover.s].label}
          </div>
          <div className="t-num text-sm text-ink tnum">{formatValue(hv.v)}</div>
        </div>
      ) : null}
      <table id={`${id}-tbl`} className="sr-only">
        <tbody>
          {groups.map((gr) => (
            <tr key={gr.label}>
              <td>{gr.label}</td>
              {series.map((s) => (
                <td key={s.key}>
                  {s.label}: {formatValue(gr.values[s.key] ?? 0)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
