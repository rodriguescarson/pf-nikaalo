"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export type TabDef = { id: string; label: string; count?: number; icon?: ReactNode };

/**
 * Accessible tabs (WAI-ARIA tabs pattern with arrow-key roving focus), URL-synced via `?tab=` so a tab can be
 * linked and survives refresh. Panels are rendered lazily; the active one is the only one mounted.
 */
export function Tabs({
  tabs,
  param = "tab",
  defaultTab,
  children,
  className = "",
}: {
  tabs: TabDef[];
  param?: string;
  defaultTab?: string;
  children: (active: string) => ReactNode;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const initial = search.get(param);
  const [active, setActive] = useState<string>(tabs.some((t) => t.id === initial) ? (initial as string) : (defaultTab ?? tabs[0].id));
  const listRef = useRef<HTMLDivElement | null>(null);
  const base = useId();

  useEffect(() => {
    const q = search.get(param);
    if (q && q !== active && tabs.some((t) => t.id === q)) setActive(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  function select(id: string) {
    setActive(id);
    const sp = new URLSearchParams(search.toString());
    sp.set(param, id);
    router.replace(`${pathname}?${sp.toString()}`, { scroll: false });
  }

  function onKey(e: React.KeyboardEvent<HTMLButtonElement>, i: number) {
    const n = tabs.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = n - 1;
    if (next >= 0) {
      e.preventDefault();
      select(tabs[next].id);
      (listRef.current?.children[next] as HTMLElement | undefined)?.focus();
    }
  }

  return (
    <div className={className}>
      <div ref={listRef} role="tablist" className="glass rounded-full p-1 inline-flex max-w-full overflow-x-auto gap-0.5 no-print [scrollbar-width:none]">
        {tabs.map((t, i) => {
          const on = t.id === active;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`${base}-tab-${t.id}`}
              aria-selected={on}
              aria-controls={`${base}-panel-${t.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`tap shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 sm:px-4 t-label whitespace-nowrap transition-colors ${on ? "bg-ink text-canvas" : "text-ink-2 hover:bg-ink/5"}`}
            >
              {t.icon}
              {t.label}
              {typeof t.count === "number" ? <span className={`t-num text-2xs rounded-full px-1.5 py-0.5 ${on ? "bg-lime text-ink" : "bg-ink/8 text-ink-2"}`}>{t.count}</span> : null}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${base}-panel-${active}`} aria-labelledby={`${base}-tab-${active}`} className="mt-4 write-in" key={active}>
        {children(active)}
      </div>
    </div>
  );
}
