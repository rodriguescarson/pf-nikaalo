"use client";

import type { ReactNode } from "react";
import { Tabs } from "@/components/Tabs";
import { Icon } from "@/components/Icon";
import { useT } from "@/i18n/useT";

/** Timeline / Messages / Receipt: the same claim, three ways to read it. */
export function StatusTabs({ timeline, messages, receipt, messageCount }: { timeline: ReactNode; messages: ReactNode; receipt: ReactNode; messageCount: number }) {
  const t = useT();
  return (
    <Tabs
      tabs={[
        { id: "timeline", label: t("insights.tabs.timeline"), icon: <Icon name="clock" size={14} /> },
        { id: "messages", label: t("insights.tabs.messages"), count: messageCount, icon: <Icon name="chat" size={14} /> },
        { id: "receipt", label: t("insights.tabs.receipt"), icon: <Icon name="printer" size={14} /> },
      ]}
    >
      {(tab) => (tab === "timeline" ? timeline : tab === "messages" ? messages : receipt)}
    </Tabs>
  );
}
