import type { ReactNode } from "react";

/** Floating glass action bar: one lime primary action, always under the thumb. */
export function ActionBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 no-print px-3 pb-3" style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}>
      <div className="mx-auto w-full max-w-[34rem] glass rounded-[var(--radius-cloth)] px-3 py-3 flex flex-col gap-2">
        {note ? <div className="text-sm text-ink-2 leading-snug px-1">{note}</div> : null}
        <div className="flex items-center gap-3">{children}</div>
      </div>
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`btn-lime tap flex-1 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 t-label text-[0.9375rem] disabled:opacity-50 disabled:shadow-none disabled:hover:translate-y-0 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...rest
}: { children: ReactNode; className?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={`tap inline-flex items-center justify-center gap-2 rounded-full border border-ink/15 bg-white text-ink px-4 py-3 t-label text-[0.9375rem] hover:bg-canvas disabled:opacity-50 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
