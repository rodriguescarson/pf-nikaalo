import type { ReactNode } from "react";

/** The cloth spine at the bottom: the one primary action, always reachable with a thumb. */
export function ActionBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 no-print" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="cloth shadow-cloth">
        <div className="mx-auto w-full max-w-[34rem] px-4 py-3 flex flex-col gap-2">
          {note ? <div className="text-sm text-white/85 leading-snug">{note}</div> : null}
          <div className="flex items-center gap-3">{children}</div>
        </div>
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
      className={`tap flex-1 inline-flex items-center justify-center gap-2 rounded-[var(--radius-cloth)] bg-paper text-cloth-deep px-4 py-3 t-label text-base hover:bg-white disabled:opacity-50 disabled:hover:bg-paper transition-colors ${className}`}
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
      className={`tap inline-flex items-center justify-center gap-2 rounded-[var(--radius-cloth)] border border-white/40 text-white px-4 py-3 t-label text-base hover:bg-white/10 disabled:opacity-50 transition-colors ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
