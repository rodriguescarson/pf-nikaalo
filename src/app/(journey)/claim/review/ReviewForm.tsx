"use client";

import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import type { Intent } from "@/lib/rules/types";
import { useT } from "@/i18n/useT";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/Sheet";
import { SimulatedTag } from "@/components/SimulatedTag";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";

/** Undertaking + Aadhaar OTP, then the claim is filed against the simulated intake. */
export function ReviewForm({ uan, intent, form121 }: { uan: string; intent: Intent; form121: boolean }) {
  const t = useT();
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const [otp, setOtp] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  async function file() {
    setError(null);
    if (!/^\d{6}$/.test(otp)) return setError(t("login.otpInvalid"));
    setBusy(true);
    try {
      const r = await fetch("/api/mock/epfo/claims", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan, intent, form121 }) });
      const j = (await r.json()) as { claim?: { id: string }; error?: string };
      if (r.status === 422) {
        router.push("/check");
        return;
      }
      if (!r.ok || !j.claim) throw new Error(j.error ?? "file");
      router.push(`/status/${j.claim.id}`);
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Sheet className="p-4 mt-5">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 h-5 w-5 accent-[var(--color-cloth)]" />
          <span className="text-[0.9375rem] text-ink leading-snug">{t("review.undertaking")}</span>
        </label>
        <div className="mt-4 border-t border-rule pt-4">
          <label htmlFor={id} className="t-label text-ink block">
            {t("review.aadhaarOtp")}
          </label>
          <input
            id={id}
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
            className="mt-2 w-40 tap rounded-[var(--radius-sheet)] border border-rule bg-sheet px-3 py-3 t-num text-xl tracking-[0.2em] text-ink"
            placeholder="••••••"
            aria-describedby={`${id}-help${error ? ` ${id}-err` : ""}`}
            aria-invalid={error ? true : undefined}
          />
          <div className="mt-1.5 flex items-center gap-3 text-sm text-ink-2">
            <span id={`${id}-help`}>{t("review.aadhaarOtpHelp")}</span>
            <SimulatedTag label={t("review.otpFrom")} />
          </div>
        </div>
        {error ? (
          <p id={`${id}-err`} role="alert" className="mt-3 text-sm text-pencil flex items-center gap-1.5">
            <Icon name="x" size={16} /> {error}
          </p>
        ) : null}
      </Sheet>
      <ActionBar>
        <PrimaryButton disabled={!agree || otp.length !== 6 || busy} onClick={() => void file()}>
          {busy ? t("review.filing") : t("review.file")}
          <Icon name="arrowRight" size={20} />
        </PrimaryButton>
      </ActionBar>
    </>
  );
}
