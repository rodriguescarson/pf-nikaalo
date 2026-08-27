# Build the chart primitives (pure SVG, no libraries) for the Insights tabs
PATHS: src/components/charts

Read `AGENTS.md`, `DESIGN.md` (tokens; chart colours are `--color-chart-1..4`, `--color-chart-muted`, sequential
`--color-seq-1..5`, surfaces `--color-sheet`/`--color-canvas-2`, ink `--color-ink/-2/-3`, rule `--color-rule`),
`src/components/Icon.tsx`, `src/i18n/index.ts` (`formatINR`). Create ONLY files under `src/components/charts/`
(all `"use client"`, TypeScript, no new dependencies). Follow these mark rules exactly:
bars ≤ 24 px thick with 4 px rounded data-ends and square baselines; lines 2 px round-joined; markers r ≥ 4 with a
2 px surface ring; area fill = series colour at 10 % opacity; gridlines 1 px solid `rule`, recessive; a 2 px
surface gap between adjacent/stacked marks; text always in ink tokens (never the series colour); direct labels
selectively (max/last/end), never on every point; ≥ 2 series → legend present; every chart has `role="img"` +
`aria-label` and a visually-hidden data table fallback; respect `prefers-reduced-motion`; hover layer by default.

## Files and APIs (props are the contract — the pages already code against them)

### `Legend.tsx`
`export function Legend({ items }: { items: { key: string; label: string; color: string }[] })` — inline chips: 10 px
rounded swatch + label in `text-ink-2` caption size, wraps.

### `ChartCard.tsx`
`export function ChartCard({ title, sub, children, table, labels }: { title: string; sub?: string; children: ReactNode; table?: ReactNode; labels: { tableView: string; chartView: string } })`
— a `.sheet p-4 sm:p-5` card with title (`t-label text-ink`), sub (`text-sm text-ink-2`), a small pill button top-right
that toggles between the chart (`children`) and `table` (when provided), state local.

### `StatTile.tsx`
`export function StatTile({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "lime" | "dark" | "plain" })`
— label (caption, ink-3), value (`t-num text-[1.5rem] sm:text-[1.75rem]`), optional sub; tone `lime` = `bg-lime text-ink`,
`dark` = `.cloth` with the value in `text-lime`, plain = `.sheet`. Rounded `var(--radius-sheet)`, padding 1rem.

### `AreaChart.tsx`
`export function AreaChart({ data, formatY, formatX, color, height, ariaLabel, markers }: { data: { x: string; y: number }[]; formatY: (n: number) => string; formatX: (x: string) => string; color?: string; height?: number; ariaLabel: string; markers?: { x: string; label: string }[] })`
— responsive SVG (viewBox, width 100 %), 4 horizontal gridlines with left-aligned tick labels (caption, ink-3),
x ticks at ≤ 6 evenly spaced points, one line + area wash, end-dot with the final value direct-labelled, optional
vertical marker lines with a tiny caption label (e.g. interest months). Hover/touch: nearest-point crosshair (1 px
ink-3) + tooltip (glass-like `.sheet` box, caption label, figure value) positioned inside the chart bounds; keyboard:
the SVG is focusable and ←/→ move the crosshair. Default colour `var(--color-chart-1)`, height 220.

### `BarChart.tsx`
`export function BarChart({ groups, series, stacked, formatValue, ariaLabel, height }: { groups: { label: string; values: Record<string, number> }[]; series: { key: string; label: string; color: string }[]; stacked?: boolean; formatValue: (n: number) => string; ariaLabel: string; height?: number })`
— vertical bars per group (grouped or stacked); bars ≤ 24 px, 2 px gaps, rounded top data-ends; group labels
under the axis (truncate with an ellipsis via `<title>`); direct value label above the tallest bar per group only;
legend rendered by the caller (export nothing else). Per-bar hover tooltip (series label + value). Height default 200.

### `ShareBar.tsx`
`export function ShareBar({ parts, formatValue, formatShare }: { parts: { key: string; label: string; value: number; color: string }[]; formatValue: (n: number) => string; formatShare: (share: number) => string })`
— a single horizontal stacked bar (height 28 px, rounded ends, 2 px gaps), each segment with a hover tooltip; below it
a legend list with label, value and share % in ink tokens. Segments under 4 % get no inline label.

### `Heatmap.tsx`
`export function Heatmap({ rows, cols, cells, formatValue, ariaLabel, ramp }: { rows: string[]; cols: string[]; cells: Record<string, number | null>; formatValue: (n: number) => string; ariaLabel: string; ramp?: string[] })`
— a grid of rows × cols (row label left in caption ink-2, col labels on top), `cells["row|col"]` value; null → empty
cell drawn as a 1 px `rule` outline; values bucketed into 5 quantile steps over `ramp` (default `--color-seq-1..5`),
cells 14–18 px with 2 px gaps and 3 px radius; hover tooltip with row, col, value; a small ramp legend "less → more".

### `index.ts`
Re-export everything.

Run `pnpm typecheck`. No i18n keys are needed inside the primitives (callers pass strings). Final message ≤ 10 lines.
