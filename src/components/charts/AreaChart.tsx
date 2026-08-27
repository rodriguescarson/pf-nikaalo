"use client";

import { useId, useMemo, useRef, useState } from "react";

type Point = { x: string; y: number };

const PAD = { top: 16, right: 20, bottom: 28, left: 8 };

function niceTicks(max: number, n = 4): number[] {
  if (max <= 0) return [0];
  const raw = max / n;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw;
  const out: number[] = [];
  for (let v = 0; v <= max + step * 0.001; v += step) out.push(Math.round(v));
  return out;
}

/** Single-series line + 10 % area wash, recessive gridlines, crosshair tooltip, keyboard-navigable. */
export function AreaChart({
  data,
  formatY,
  formatX,
  color = "var(--color-chart-1)",
  height = 220,
  ariaLabel,
  markers = [],
  viewWidth = 640,
}: {
  data: Point[];
  formatY: (n: number) => string;
  formatX: (x: string) => string;
  color?: string;
  height?: number;
  ariaLabel: string;
  markers?: { x: string; label: string }[];
  viewWidth?: number;
}) {
  const W = viewWidth;
  const id = useId();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hover, setHover] = useState<number | null>(null);
  const H = height;
  const n = data.length;
  const maxY = Math.max(1, ...data.map((d) => d.y));
  const ticks = useMemo(() => niceTicks(maxY), [maxY]);
  const top = ticks[ticks.length - 1] || maxY;
  const x = (i: number) => PAD.left + (n <= 1 ? (W - PAD.left - PAD.right) / 2 : (i * (W - PAD.left - PAD.right)) / (n - 1));
  const y = (v: number) => PAD.top + (1 - v / top) * (H - PAD.top - PAD.bottom);
  const path = data.map((d, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(d.y).toFixed(1)}`).join(" ");
  const area = n ? `${path} L${x(n - 1).toFixed(1)},${y(0).toFixed(1)} L${x(0).toFixed(1)},${y(0).toFixed(1)} Z` : "";
  const xTickIdx = n <= 6 ? data.map((_, i) => i) : Array.from({ length: 6 }, (_, k) => Math.round((k * (n - 1)) / 5));
  const markerIdx = markers.map((m) => ({ ...m, i: data.findIndex((d) => d.x === m.x) })).filter((m) => m.i >= 0);

  function onMove(e: React.MouseEvent<SVGSVGElement> | React.TouchEvent<SVGSVGElement>) {
    const svg = svgRef.current;
    if (!svg || n === 0) return;
    const rect = svg.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0]?.clientX : e.clientX;
    if (clientX == null) return;
    const px = ((clientX - rect.left) / rect.width) * W;
    const rel = (px - PAD.left) / (W - PAD.left - PAD.right);
    setHover(Math.max(0, Math.min(n - 1, Math.round(rel * (n - 1)))));
  }

  const h = hover;
  const tipLeft = h != null && x(h) > W * 0.6;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={ariaLabel}
        aria-describedby={`${id}-tbl`}
        tabIndex={0}
        className="block touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-focus rounded"
        onMouseMove={onMove}
        onTouchStart={onMove}
        onTouchMove={onMove}
        onMouseLeave={() => setHover(null)}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") setHover((v) => Math.min(n - 1, (v ?? -1) + 1));
          if (e.key === "ArrowLeft") setHover((v) => Math.max(0, (v ?? n) - 1));
          if (e.key === "Escape") setHover(null);
        }}
      >
        <defs>
          <linearGradient id={`${id}-g`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.16" />
            <stop offset="1" stopColor={color} stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tv) => (
          <g key={tv}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(tv)} y2={y(tv)} stroke="var(--color-rule)" strokeWidth="1" />
            <text x={PAD.left} y={y(tv) - 4} className="fill-ink-3" fontSize="10" fontFamily="var(--font-sans)">
              {formatY(tv)}
            </text>
          </g>
        ))}
        {markerIdx.map((m) => (
          <g key={m.x}>
            <line x1={x(m.i)} x2={x(m.i)} y1={PAD.top} y2={y(0)} stroke="var(--color-chart-3)" strokeWidth="1" strokeDasharray="0" opacity="0.35" />
          </g>
        ))}
        {n > 0 ? <path d={area} fill={`url(#${id}-g)`} /> : null}
        {n > 0 ? <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" /> : null}
        {n > 0 ? (
          <g>
            <circle cx={x(n - 1)} cy={y(data[n - 1].y)} r="6" fill="var(--color-sheet)" />
            <circle cx={x(n - 1)} cy={y(data[n - 1].y)} r="4" fill={color} />
            <text x={Math.min(x(n - 1), W - PAD.right - 4)} y={y(data[n - 1].y) - 10} textAnchor="end" className="fill-ink" fontSize="11" fontWeight="700" fontFamily="var(--font-sans)">
              {formatY(data[n - 1].y)}
            </text>
          </g>
        ) : null}
        {xTickIdx.map((i) => (
          <text key={i} x={x(i)} y={H - 8} textAnchor={i === 0 ? "start" : i === n - 1 ? "end" : "middle"} className="fill-ink-3" fontSize="10" fontFamily="var(--font-sans)">
            {formatX(data[i].x)}
          </text>
        ))}
        {h != null && data[h] ? (
          <g>
            <line x1={x(h)} x2={x(h)} y1={PAD.top} y2={y(0)} stroke="var(--color-ink-3)" strokeWidth="1" />
            <circle cx={x(h)} cy={y(data[h].y)} r="6" fill="var(--color-sheet)" />
            <circle cx={x(h)} cy={y(data[h].y)} r="4" fill={color} />
          </g>
        ) : null}
      </svg>
      {h != null && data[h] ? (
        <div
          className="pointer-events-none absolute top-2 sheet px-3 py-2 text-2xs text-ink-2 leading-tight"
          style={tipLeft ? { right: `${100 - (x(h) / W) * 100 + 2}%` } : { left: `${(x(h) / W) * 100 + 1}%` }}
          role="status"
        >
          <div>{formatX(data[h].x)}</div>
          <div className="t-num text-sm text-ink tnum">{formatY(data[h].y)}</div>
        </div>
      ) : null}
      <table id={`${id}-tbl`} className="sr-only">
        <tbody>
          {data.map((d) => (
            <tr key={d.x}>
              <td>{formatX(d.x)}</td>
              <td>{formatY(d.y)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
