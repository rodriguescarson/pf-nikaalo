"use client";

import { useState } from "react";

/** Part-to-whole as one horizontal stacked bar with 2 px gaps, plus a legend list with values and shares. */
export function ShareBar({ parts, formatValue, formatShare }: { parts: { key: string; label: string; value: number; color: string }[]; formatValue: (n: number) => string; formatShare: (share: number) => string }) {
  const [hover, setHover] = useState<string | null>(null);
  const total = parts.reduce((a, p) => a + p.value, 0) || 1;
  return (
    <div>
      <div className="flex h-7 w-full overflow-hidden rounded-full bg-canvas-2" role="img" aria-label={parts.map((p) => `${p.label} ${formatShare(p.value / total)}`).join(", ")}>
        {parts.map((p, i) => {
          const share = p.value / total;
          return (
            <div
              key={p.key}
              className="relative h-full transition-[filter]"
              style={{ width: `calc(${share * 100}% - ${i < parts.length - 1 ? 2 : 0}px)`, marginRight: i < parts.length - 1 ? 2 : 0, background: p.color, filter: hover && hover !== p.key ? "saturate(0.4) opacity(0.6)" : undefined }}
              onMouseEnter={() => setHover(p.key)}
              onMouseLeave={() => setHover(null)}
              title={`${p.label} · ${formatValue(p.value)} · ${formatShare(share)}`}
            >
              {share >= 0.12 ? <span className="absolute inset-0 flex items-center justify-center text-2xs font-bold text-white drop-shadow-[0_1px_0_rgb(0_0_0_/_0.35)]">{formatShare(share)}</span> : null}
            </div>
          );
        })}
      </div>
      <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {parts.map((p) => (
          <li key={p.key} className="flex items-center gap-2 text-sm" onMouseEnter={() => setHover(p.key)} onMouseLeave={() => setHover(null)}>
            <span className="inline-block h-2.5 w-2.5 rounded-[3px] shrink-0" style={{ background: p.color }} aria-hidden="true" />
            <span className="text-ink-2 flex-1">{p.label}</span>
            <span className="t-num text-ink tnum">{formatValue(p.value)}</span>
            <span className="text-2xs text-ink-3 w-10 text-right tnum">{formatShare(p.value / total)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
