"use client";

export function StatTile({ label, value, sub, tone = "plain" }: { label: string; value: string; sub?: string; tone?: "lime" | "dark" | "plain" }) {
  const wrap = tone === "lime" ? "bg-lime text-ink" : tone === "dark" ? "cloth" : "sheet";
  const labelCls = tone === "dark" ? "text-white/70" : tone === "lime" ? "text-ink/70" : "text-ink-3";
  const valueCls = tone === "dark" ? "text-lime" : "text-ink";
  return (
    <div className={`rounded-[var(--radius-sheet)] p-4 ${wrap}`}>
      <div className={`text-2xs ${labelCls}`}>{label}</div>
      <div className={`mt-1 t-num text-[1.5rem] sm:text-[1.75rem] leading-none tnum ${valueCls}`}>{value}</div>
      {sub ? <div className={`mt-1.5 text-2xs leading-tight ${labelCls}`}>{sub}</div> : null}
    </div>
  );
}
