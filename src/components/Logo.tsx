/** Wordmark: a lime "check-in-a-leaf" mark plus the name in the display face. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="28" viewBox="0 0 28 28" aria-hidden="true" focusable="false">
        <path d="M4 14C4 8.5 8.5 4 14 4h10v10c0 5.5-4.5 10-10 10H4V14z" fill="#b6f036" />
        <path d="M9.5 14.5l3.2 3.2 6.3-6.6" fill="none" stroke="#0e1512" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className={`t-head text-[1.25rem] leading-none ${light ? "text-white" : "text-ink"}`}>
        PF <span className="accent">Nikaalo</span>
      </span>
    </span>
  );
}
