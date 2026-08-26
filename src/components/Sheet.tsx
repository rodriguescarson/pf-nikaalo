import type { ReactNode } from "react";

/** A ruled page of the ledger. */
export function Sheet({ children, className = "", ledger = false }: { children: ReactNode; className?: string; ledger?: boolean }) {
  return <div className={`sheet ${ledger ? "ledger" : ""} ${className}`}>{children}</div>;
}

/** Page frame: the column width the whole app lives in. */
export function Page({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[34rem] px-4 pt-6 pb-32 flex-1 ${className}`}>{children}</div>;
}

export function PageTitle({ title, sub, step }: { title: string; sub?: string; step?: string }) {
  return (
    <div className="mb-5">
      {step ? <div className="t-label text-ink-3 mb-1">{step}</div> : null}
      <h1 className="t-head text-[1.75rem] text-ink">{title}</h1>
      {sub ? <p className="mt-1.5 text-ink-2 text-[0.9375rem]">{sub}</p> : null}
    </div>
  );
}
