"use client";

import { useEffect, useState } from "react";
import { useT } from "@/i18n/useT";
import { Icon } from "./Icon";

/** Slow-network reality: say so, keep what is on screen usable. */
export function OfflineBar() {
  const t = useT();
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" aria-live="polite" className="bg-ink text-paper no-print">
      <p className="mx-auto w-full max-w-[34rem] px-4 py-2 text-sm flex items-center gap-2">
        <Icon name="wifiOff" size={16} />
        {t("common.offline")}
      </p>
    </div>
  );
}
