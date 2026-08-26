"use client";

import { useId, type ReactNode } from "react";
import { Icon, type IconName } from "./Icon";

/** The row of list controls: search, filters, sort. Wraps on narrow screens, never hides. */
export function ListToolbar({ children }: { children: ReactNode }) {
  return <div className="mb-3 flex flex-wrap items-center gap-2">{children}</div>;
}

export function SearchBox({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex-1 min-w-[12rem] flex items-center gap-2 rounded-[var(--radius-sheet)] border border-rule bg-sheet px-3 tap focus-within:border-ink">
      <Icon name="search" size={16} className="text-ink-3 shrink-0" />
      <input id={id} type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={placeholder} className="w-full bg-transparent py-2 text-[0.9375rem] text-ink placeholder:text-ink-3 outline-none" />
    </label>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  icon,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  label: string;
  icon?: IconName;
}) {
  return (
    <div role="group" aria-label={label} className="inline-flex items-center rounded-[var(--radius-sheet)] border border-rule bg-sheet p-0.5">
      {icon ? <Icon name={icon} size={14} className="text-ink-3 ml-2 mr-1" /> : null}
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`min-h-[2.5rem] px-3 rounded-[calc(var(--radius-sheet)-2px)] t-label text-[0.8125rem] ${on ? "bg-ink text-paper" : "text-ink-2 hover:bg-paper-2"}`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Select<T extends string>({ value, onChange, options, label, icon }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string; icon?: IconName }) {
  const id = useId();
  return (
    <label htmlFor={id} className="inline-flex items-center gap-1.5 rounded-[var(--radius-sheet)] border border-rule bg-sheet pl-3 pr-2 tap">
      {icon ? <Icon name={icon} size={14} className="text-ink-3" /> : null}
      <span className="sr-only">{label}</span>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className="bg-transparent py-2 pr-6 t-label text-[0.8125rem] text-ink appearance-none outline-none">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <Icon name="chevronDown" size={14} className="-ml-6 pointer-events-none text-ink-3" />
    </label>
  );
}

export function Pagination({ page, pages, onPage, labels }: { page: number; pages: number; onPage: (p: number) => void; labels: { prev: string; next: string; page: (n: number) => string } }) {
  if (pages <= 1) return null;
  return (
    <nav className="mt-3 flex items-center justify-between" aria-label="Pagination">
      <button type="button" disabled={page <= 1} onClick={() => onPage(page - 1)} className="tap inline-flex items-center gap-1.5 px-3 rounded-[var(--radius-sheet)] border border-rule bg-sheet t-label text-[0.8125rem] text-ink disabled:opacity-40">
        <Icon name="arrowLeft" size={16} /> {labels.prev}
      </button>
      <span className="t-num text-sm text-ink-2 tnum">
        {labels.page(page)} / {pages}
      </span>
      <button type="button" disabled={page >= pages} onClick={() => onPage(page + 1)} className="tap inline-flex items-center gap-1.5 px-3 rounded-[var(--radius-sheet)] border border-rule bg-sheet t-label text-[0.8125rem] text-ink disabled:opacity-40">
        {labels.next} <Icon name="arrowRight" size={16} />
      </button>
    </nav>
  );
}
