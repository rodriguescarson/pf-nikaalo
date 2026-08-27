"use client";

export function Legend({ items }: { items: { key: string; label: string; color: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1.5" aria-label="Legend">
      {items.map((i) => (
        <li key={i.key} className="inline-flex items-center gap-1.5 text-2xs text-ink-2">
          <span className="inline-block h-2.5 w-2.5 rounded-[3px]" style={{ background: i.color }} aria-hidden="true" />
          {i.label}
        </li>
      ))}
    </ul>
  );
}
