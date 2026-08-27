"use client";

import type { PassbookEntry } from "@/lib/passbook";
import { useT } from "@/i18n/useT";
import { Tabs } from "@/components/Tabs";
import { Icon } from "@/components/Icon";
import { PassbookList } from "./PassbookList";
import { EmployersTable, PassbookInsights, type InsightsData } from "./PassbookInsights";

export function PassbookTabs({ entries, employers, balance, insights }: { entries: PassbookEntry[]; employers: { id: string; name: string }[]; balance: number; insights: InsightsData }) {
  const t = useT();
  return (
    <Tabs
      defaultTab="insights"
      tabs={[
        { id: "insights", label: t("insights.tabs.insights"), icon: <Icon name="shield" size={14} /> },
        { id: "entries", label: t("insights.tabs.entries"), count: entries.length, icon: <Icon name="file" size={14} /> },
        { id: "employers", label: t("insights.tabs.employers"), count: employers.length, icon: <Icon name="building" size={14} /> },
      ]}
    >
      {(tab) =>
        tab === "insights" ? <PassbookInsights d={insights} /> : tab === "entries" ? <PassbookList entries={entries} employers={employers} balance={balance} /> : <EmployersTable employers={insights.employers} />
      }
    </Tabs>
  );
}
