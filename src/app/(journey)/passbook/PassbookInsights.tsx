"use client";

import { useLang, useT } from "@/i18n/useT";
import { formatINR } from "@/i18n";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/Sheet";
import { AreaChart, BarChart, ChartCard, Heatmap, Legend, ShareBar, StatTile } from "@/components/charts";
import type { EmployerSummary, MonthPoint, Split, Streaks } from "@/lib/insights";

export type InsightsData = {
  balance: number;
  pension: number;
  series: MonthPoint[];
  streaks: Streaks;
  employers: EmployerSummary[];
  split: Split[];
  interestByYear: { year: string; amount: number }[];
  projection: { years: number; amount: number }[];
  interestMonths: string[];
};

const SERIES_COLOR: Record<string, string> = {
  employee: "var(--color-chart-1)",
  employer: "var(--color-chart-2)",
  interest: "var(--color-chart-3)",
  pension: "var(--color-chart-4)",
};

export function PassbookInsights({ d }: { d: InsightsData }) {
  const t = useT();
  const lang = useLang();
  const inr = (n: number) => formatINR(n, lang);
  const monthLabel = (m: string) => new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "2-digit" }).format(new Date(`${m}-01T00:00:00Z`));
  const monthShort = (i: number) => new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { month: "short" }).format(new Date(Date.UTC(2024, i, 1)));
  const legendLabel: Record<string, string> = {
    employee: t("insights.legendEmployee"),
    employer: t("insights.legendEmployer"),
    interest: t("insights.legendInterest"),
    pension: t("insights.legendPension"),
  };
  const tableLabels = { tableView: t("insights.tableView"), chartView: t("insights.chartView") };

  // Heatmap: years × months of (employee + employer) contribution
  const years = [...new Set(d.series.map((p) => p.month.slice(0, 4)))].sort();
  const cols = Array.from({ length: 12 }, (_, i) => monthShort(i));
  const cells: Record<string, number | null> = {};
  for (const y of years) for (let i = 0; i < 12; i++) cells[`${y}|${cols[i]}`] = null;
  for (const p of d.series) {
    const y = p.month.slice(0, 4);
    const mi = Number(p.month.slice(5, 7)) - 1;
    cells[`${y}|${cols[mi]}`] = p.employee + p.employer;
  }

  const employerSeries = [
    { key: "employee", label: legendLabel.employee, color: SERIES_COLOR.employee },
    { key: "employer", label: legendLabel.employer, color: SERIES_COLOR.employer },
  ];
  const employerGroups = d.employers.map((e) => ({ label: e.employer, values: { employee: e.employee, employer: e.employerShare } }));

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <StatTile label={t("insights.balance")} value={inr(d.balance)} sub={t("insights.balanceSub")} tone="dark" />
        <StatTile label={t("insights.pension")} value={inr(d.pension)} tone="plain" />
        <StatTile label={t("insights.months")} value={String(d.streaks.totalMonths)} tone="plain" />
        <StatTile label={t("insights.employers")} value={String(d.employers.length)} tone="plain" />
      </div>

      {/* Streak */}
      <Sheet className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="t-label text-ink">{t("insights.streakTitle")}</h3>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-lime px-3 py-1 t-label text-ink">
            <Icon name="shield" size={14} /> {t("insights.streakMonths", { n: d.streaks.current })}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div>
            <div className="text-2xs text-ink-3">{t("insights.streakCurrent")}</div>
            <div className="t-num text-[1.75rem] leading-none text-ink mt-1">{d.streaks.current}</div>
          </div>
          <div>
            <div className="text-2xs text-ink-3">{t("insights.streakLongest")}</div>
            <div className="t-num text-[1.75rem] leading-none text-ink mt-1">{d.streaks.longest}</div>
            {d.streaks.longestFrom ? <div className="text-2xs text-ink-3 mt-1 tnum">{t("insights.streakRange", { from: monthLabel(d.streaks.longestFrom), to: monthLabel(d.streaks.longestTo) })}</div> : null}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <div className="text-2xs text-ink-3">{t("insights.gaps")}</div>
            <div className={`t-label text-base mt-1 ${d.streaks.gaps.length ? "text-ochre" : "text-green"}`}>
              {d.streaks.gaps.length ? t("insights.gapsSome", { n: d.streaks.gaps.length }) : t("insights.gapsNone")}
            </div>
            {d.streaks.gaps.length ? (
              <ul className="mt-1.5 flex flex-wrap gap-1">
                {d.streaks.gaps.slice(0, 8).map((g) => (
                  <li key={g} className="rounded-full bg-ochre-fill text-ochre px-2 py-0.5 text-2xs tnum">
                    {monthLabel(g)}
                  </li>
                ))}
                {d.streaks.gaps.length > 8 ? <li className="text-2xs text-ink-3">+{d.streaks.gaps.length - 8}</li> : null}
              </ul>
            ) : null}
          </div>
        </div>
        <p className="mt-4 flex items-start gap-2 text-sm text-ink-2 leading-relaxed">
          <Icon name="info" size={16} className="mt-0.5 shrink-0 text-ink-3" />
          <span>
            <span className="t-label text-ink">{t("insights.tip")}: </span>
            {d.streaks.gaps.length ? t("insights.gapsWhy") + " " + t("insights.tipGap") : t("insights.tipStreak", { n: d.streaks.current })}
          </span>
        </p>
      </Sheet>

      {/* Balance growth */}
      <ChartCard
        title={t("insights.growthTitle")}
        sub={t("insights.growthSub")}
        labels={tableLabels}
        table={
          <table className="w-full text-sm">
            <thead className="text-2xs text-ink-3 t-label">
              <tr>
                <th className="text-left py-1">{t("passbook.colMonth")}</th>
                <th className="text-right py-1">{legendLabel.employee}</th>
                <th className="text-right py-1">{legendLabel.employer}</th>
                <th className="text-right py-1">{legendLabel.interest}</th>
                <th className="text-right py-1">{t("insights.balance")}</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {d.series.map((p) => (
                <tr key={p.month} className="border-t border-rule">
                  <td className="py-1 text-ink-2">{monthLabel(p.month)}</td>
                  <td className="py-1 text-right">{inr(p.employee)}</td>
                  <td className="py-1 text-right">{inr(p.employer)}</td>
                  <td className="py-1 text-right">{inr(p.interest)}</td>
                  <td className="py-1 text-right text-ink">{inr(p.balance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <AreaChart
          data={d.series.map((p) => ({ x: p.month, y: p.balance }))}
          formatY={(n) => inr(n)}
          formatX={monthLabel}
          ariaLabel={t("insights.growthTitle")}
          markers={d.interestMonths.map((m) => ({ x: m, label: legendLabel.interest }))}
        />
      </ChartCard>

      {/* By employer */}
      <ChartCard
        title={t("insights.byEmployerTitle")}
        sub={t("insights.byEmployerSub")}
        labels={tableLabels}
        table={
          <table className="w-full text-sm">
            <thead className="text-2xs text-ink-3 t-label">
              <tr>
                <th className="text-left py-1">{t("insights.colEmployer")}</th>
                <th className="text-right py-1">{legendLabel.employee}</th>
                <th className="text-right py-1">{legendLabel.employer}</th>
              </tr>
            </thead>
            <tbody className="tnum">
              {d.employers.map((e) => (
                <tr key={e.establishmentId} className="border-t border-rule">
                  <td className="py-1 text-ink-2">{e.employer}</td>
                  <td className="py-1 text-right">{inr(e.employee)}</td>
                  <td className="py-1 text-right">{inr(e.employerShare)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      >
        <BarChart groups={employerGroups} series={employerSeries} formatValue={(n) => inr(n)} ariaLabel={t("insights.byEmployerTitle")} />
        <div className="mt-2">
          <Legend items={employerSeries} />
        </div>
      </ChartCard>

      {/* Split */}
      <ChartCard title={t("insights.splitTitle")} sub={t("insights.splitSub")} labels={tableLabels}>
        <ShareBar parts={d.split.map((s) => ({ key: s.type, label: legendLabel[s.type], value: s.amount, color: SERIES_COLOR[s.type] }))} formatValue={(n) => inr(n)} formatShare={(s) => `${Math.round(s * 100)}%`} />
      </ChartCard>

      {/* Heatmap */}
      <ChartCard title={t("insights.heatmapTitle")} sub={t("insights.heatmapSub")} labels={tableLabels}>
        <Heatmap rows={years} cols={cols} cells={cells} formatValue={(n) => inr(n)} ariaLabel={t("insights.heatmapTitle")} />
      </ChartCard>

      {/* Interest + projection */}
      <div className="grid gap-4 sm:grid-cols-2">
        <ChartCard title={t("insights.interestTitle")} sub={t("insights.interestSub")} labels={tableLabels}>
          <BarChart groups={d.interestByYear.map((y) => ({ label: y.year, values: { interest: y.amount } }))} series={[{ key: "interest", label: legendLabel.interest, color: SERIES_COLOR.interest }]} formatValue={(n) => inr(n)} ariaLabel={t("insights.interestTitle")} height={170} viewWidth={340} />
        </ChartCard>
        <Sheet className="p-4 sm:p-5">
          <h3 className="t-label text-ink">{t("insights.projectionTitle")}</h3>
          <p className="text-sm text-ink-2 mt-0.5">{t("insights.projectionSub")}</p>
          <ol className="mt-4 space-y-2">
            <li className="flex items-baseline justify-between">
              <span className="text-sm text-ink-2">{t("insights.projectionNow")}</span>
              <span className="t-num text-ink tnum">{inr(d.balance)}</span>
            </li>
            {d.projection.map((p) => (
              <li key={p.years} className="flex items-baseline justify-between">
                <span className="text-sm text-ink-2">{t("insights.projectionIn", { n: p.years })}</span>
                <span className="t-num text-green tnum">{inr(p.amount)}</span>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-2xs text-ink-3">{t("insights.tipInterest")}</p>
        </Sheet>
      </div>
    </div>
  );
}

export function EmployersTable({ employers }: { employers: EmployerSummary[] }) {
  const t = useT();
  const lang = useLang();
  const inr = (n: number) => formatINR(n, lang);
  const monthLabel = (m: string) => new Intl.DateTimeFormat(lang === "hi" ? "hi-IN" : "en-IN", { month: "short", year: "numeric" }).format(new Date(`${m}-01T00:00:00Z`));
  return (
    <Sheet className="overflow-x-auto">
      <table className="w-full text-sm min-w-[36rem]">
        <thead>
          <tr className="text-2xs text-ink-3 t-label uppercase tracking-wide bg-canvas-2/70">
            <th className="text-left px-4 py-2">{t("insights.colEmployer")}</th>
            <th className="text-left px-3 py-2">{t("insights.colPeriod")}</th>
            <th className="text-right px-3 py-2">{t("insights.colMonths")}</th>
            <th className="text-right px-3 py-2">{t("insights.colEmployee")}</th>
            <th className="text-right px-3 py-2">{t("insights.colEmployerShare")}</th>
            <th className="text-right px-3 py-2">{t("insights.colPension")}</th>
            <th className="text-left px-4 py-2">{t("insights.colExit")}</th>
          </tr>
        </thead>
        <tbody className="tnum">
          {employers.map((e) => (
            <tr key={e.establishmentId} className="border-t border-rule hover:bg-canvas-2/50">
              <td className="px-4 py-3 text-ink">
                <div className="t-label text-[0.9375rem]">{e.employer}</div>
                <div className="text-2xs text-ink-3">{e.establishmentId}</div>
              </td>
              <td className="px-3 py-3 text-ink-2 whitespace-nowrap">
                {monthLabel(e.from)} – {monthLabel(e.to)}
              </td>
              <td className="px-3 py-3 text-right text-ink">{e.months}</td>
              <td className="px-3 py-3 text-right text-ink">{inr(e.employee)}</td>
              <td className="px-3 py-3 text-right text-ink">{inr(e.employerShare)}</td>
              <td className="px-3 py-3 text-right text-ink-2">{inr(e.pension)}</td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-2xs t-label ${e.hasExit ? "bg-tick-fill text-tick" : "bg-ochre-fill text-ochre"}`}>
                  <Icon name={e.hasExit ? "check" : "alert"} size={12} />
                  {e.hasExit ? t("insights.exitMarked") : t("insights.exitMissing")}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Sheet>
  );
}
