"use client";

import { useEffect, useMemo, useState } from "react";
import type { EntryType, PassbookEntry } from "@/lib/passbook";
import { useLang, useT } from "@/i18n/useT";
import { formatINR } from "@/i18n";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/components/Icon";
import { ListToolbar, Pagination, SearchBox, Select } from "@/components/ListToolbar";

const PAGE = 12;

/** Search, filter, sort, paginate — the passbook is the one screen with real list volume. */
export function PassbookList({ entries, employers, balance }: { entries: PassbookEntry[]; employers: { id: string; name: string }[]; balance: number }) {
  const t = useT();
  const lang = useLang();
  const [q, setQ] = useState("");
  const [employer, setEmployer] = useState<string>("all");
  const [type, setType] = useState<"all" | EntryType>("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "amount">("newest");
  const [page, setPage] = useState(1);

  const typeLabel: Record<EntryType, string> = {
    employee: t("passbook.typeEmployee"),
    employer: t("passbook.typeEmployer"),
    pension: t("passbook.typePension"),
    interest: t("passbook.typeInterest"),
  };

  const withRunning = useMemo(() => {
    let run = 0;
    return entries.map((e) => {
      if (e.type !== "pension") run += e.amount;
      return { ...e, running: run };
    });
  }, [entries]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const f = withRunning.filter((e) => (employer === "all" || e.establishmentId === employer) && (type === "all" || e.type === type) && (!needle || e.employer.toLowerCase().includes(needle)));
    return f.sort((a, b) => (sort === "amount" ? b.amount - a.amount : sort === "newest" ? (a.month < b.month ? 1 : a.month > b.month ? -1 : 0) : a.month < b.month ? -1 : a.month > b.month ? 1 : 0));
  }, [withRunning, q, employer, type, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  useEffect(() => setPage(1), [q, employer, type, sort]);
  const slice = filtered.slice((page - 1) * PAGE, page * PAGE);
  const monthLabel = (m: string) => new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "numeric" }).format(new Date(`${m}-01T00:00:00Z`));

  return (
    <>
      <div className="cloth rounded-[var(--radius-cloth)] px-4 py-3 mb-4 flex items-baseline justify-between shadow-cloth">
        <span className="t-label text-white/90">{t("passbook.total")}</span>
        <span className="t-num text-2xl tnum">{formatINR(balance, lang)}</span>
      </div>
      <ListToolbar>
        <SearchBox value={q} onChange={setQ} placeholder={t("passbook.search")} />
        <Select
          value={employer}
          onChange={setEmployer}
          label={t("passbook.filterAll")}
          icon="filter"
          options={[{ value: "all", label: t("passbook.filterAll") }, ...employers.map((e) => ({ value: e.id, label: e.name }))]}
        />
        <Select
          value={type}
          onChange={setType}
          label={t("passbook.filterType")}
          icon="filter"
          options={[
            { value: "all", label: t("passbook.filterType") },
            { value: "employee", label: typeLabel.employee },
            { value: "employer", label: typeLabel.employer },
            { value: "pension", label: typeLabel.pension },
            { value: "interest", label: typeLabel.interest },
          ]}
        />
        <Select
          value={sort}
          onChange={setSort}
          label={t("passbook.sortNewest")}
          icon="sort"
          options={[
            { value: "newest", label: t("passbook.sortNewest") },
            { value: "oldest", label: t("passbook.sortOldest") },
            { value: "amount", label: t("passbook.sortAmount") },
          ]}
        />
      </ListToolbar>

      {filtered.length === 0 ? (
        <Sheet className="p-6 text-center">
          <Icon name="search" size={26} className="mx-auto text-ink-3" />
          <p className="mt-3 text-sm text-ink-2">{t("passbook.empty")}</p>
          <button
            type="button"
            className="mt-3 t-label text-cloth underline"
            onClick={() => {
              setQ("");
              setEmployer("all");
              setType("all");
            }}
          >
            {t("passbook.clear")}
          </button>
        </Sheet>
      ) : (
        <>
          <p className="text-2xs text-ink-3 mb-1.5" aria-live="polite">
            {t("passbook.showing", { from: (page - 1) * PAGE + 1, to: Math.min(page * PAGE, filtered.length), n: filtered.length })}
          </p>
          <Sheet ledger>
            <div className="ledger-row min-h-0 bg-paper-2/70 text-2xs text-ink-3 t-label uppercase tracking-wide">
              <div className="px-2 py-1.5 text-center">{t("passbook.colMonth")}</div>
              <div className="px-4 py-1.5">{t("passbook.colEmployer")} · {t("passbook.colType")}</div>
              <div className="pr-4 py-1.5 text-right">{t("passbook.colAmount")}</div>
            </div>
            {slice.map((e, i) => (
              <div key={`${e.month}-${e.establishmentId}-${e.type}-${i}`} className="ledger-row items-center min-h-[2.75rem]">
                <div className="px-1 py-2 text-center t-num text-xs text-ink-2 tnum leading-tight">{monthLabel(e.month)}</div>
                <div className="px-4 py-2">
                  <div className="text-sm text-ink leading-snug">{e.employer}</div>
                  <div className="text-2xs text-ink-3">
                    {typeLabel[e.type]}
                    {sort !== "amount" && type === "all" && employer === "all" && !q ? <span className="hidden sm:inline"> · {t("passbook.runningTotal")} {formatINR(e.running, lang)}</span> : null}
                  </div>
                </div>
                <div className={`pr-4 py-2 t-num text-[0.9375rem] tnum ${e.type === "pension" ? "text-ink-2" : "text-ink"}`}>{formatINR(e.amount, lang)}</div>
              </div>
            ))}
          </Sheet>
          <Pagination page={page} pages={pages} onPage={setPage} labels={{ prev: t("passbook.prev"), next: t("passbook.next"), page: (n) => t("passbook.page", { n }) }} />
        </>
      )}
    </>
  );
}
