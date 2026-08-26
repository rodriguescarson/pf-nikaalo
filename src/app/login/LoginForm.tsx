"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { useT } from "@/i18n/useT";
import { Icon } from "@/components/Icon";
import { Sheet } from "@/components/Sheet";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";
import { SimulatedTag } from "@/components/SimulatedTag";

type Demo = { uan: string; name: string; note: string };

/** UAN + OTP. Two fields, one at a time, big digits, no surprises. */
export function LoginForm({ demos }: { demos: Demo[] }) {
  const t = useT();
  const router = useRouter();
  const [uan, setUan] = useState("");
  const [phase, setPhase] = useState<"uan" | "otp">("uan");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [last2, setLast2] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const uanId = useId();
  const digits = uan.replace(/\D/g, "").slice(0, 12);
  const grouped = digits.replace(/(\d{4})(?=\d)/g, "$1 ");

  useEffect(() => {
    if (phase === "otp") otpRefs.current[0]?.focus();
  }, [phase]);

  async function sendOtp() {
    setError(null);
    if (digits.length !== 12) return setError(t("login.uanInvalid"));
    setBusy(true);
    try {
      const r = await fetch("/api/mock/epfo/otp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan: digits }) });
      const j = await r.json();
      if (r.status === 404) return setError(t("login.uanUnknown"));
      if (!r.ok) return setError(t("login.uanInvalid"));
      setLast2(j.sentToLast2 ?? "");
      setPhase("otp");
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setError(null);
    const code = otp.join("");
    if (code.length !== 6) return setError(t("login.otpInvalid"));
    setBusy(true);
    try {
      const r = await fetch("/api/mock/epfo/otp", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan: digits, otp: code }) });
      if (!r.ok) return setError(t("login.otpInvalid"));
      router.push("/start");
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setBusy(false);
    }
  }

  function onOtpChange(i: number, v: string) {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // paste
      const next = Array(6).fill("");
      clean.slice(0, 6).split("").forEach((c, k) => (next[k] = c));
      setOtp(next);
      otpRefs.current[Math.min(clean.length, 5)]?.focus();
      return;
    }
    const next = [...otp];
    next[i] = clean;
    setOtp(next);
    if (clean && i < 5) otpRefs.current[i + 1]?.focus();
  }

  return (
    <>
      <Sheet className="p-5">
        {phase === "uan" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void sendOtp();
            }}
          >
            <label htmlFor={uanId} className="t-label text-ink block">
              {t("login.uanLabel")}
            </label>
            <input
              id={uanId}
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9 ]*"
              value={grouped}
              onChange={(e) => setUan(e.target.value)}
              aria-describedby={`${uanId}-help ${error ? `${uanId}-err` : ""}`}
              aria-invalid={error ? true : undefined}
              className="mt-2 w-full tap rounded-[var(--radius-sheet)] border border-rule bg-sheet px-3 py-3 t-num text-[1.375rem] tracking-[0.08em] text-ink placeholder:text-ink-3 placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
              placeholder="0000 0000 0000"
            />
            <p id={`${uanId}-help`} className="mt-1.5 text-sm text-ink-2">
              {t("login.uanHelp")}
            </p>
            {error ? (
              <p id={`${uanId}-err`} role="alert" className="mt-2 text-sm mark-x flex items-center gap-1.5">
                <Icon name="x" size={16} /> {error}
              </p>
            ) : null}
            <div className="mt-3 flex items-center justify-between">
              <SimulatedTag label={t("login.otpFrom")} />
            </div>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              void verify();
            }}
          >
            <p className="text-sm text-ink-2 flex items-center gap-1.5">
              <Icon name="phone" size={16} /> {t("login.otpSentTo", { last2 })}
            </p>
            <fieldset className="mt-3">
              <legend className="t-label text-ink">{t("login.otpLabel")}</legend>
              <div className="mt-2 flex gap-2" role="group">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    inputMode="numeric"
                    autoComplete={i === 0 ? "one-time-code" : "off"}
                    maxLength={6}
                    value={d}
                    aria-label={`${t("login.otpLabel")} ${i + 1}`}
                    onChange={(e) => onOtpChange(i, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
                    }}
                    className="tap w-full h-14 text-center rounded-[var(--radius-sheet)] border border-rule bg-sheet t-num text-2xl text-ink"
                  />
                ))}
              </div>
              <p className="mt-1.5 text-sm text-ink-2">{t("login.otpHelp")}</p>
            </fieldset>
            {error ? (
              <p role="alert" className="mt-2 text-sm mark-x flex items-center gap-1.5">
                <Icon name="x" size={16} /> {error}
              </p>
            ) : null}
            <button type="button" className="mt-3 text-sm underline text-ink-2" onClick={() => setPhase("uan")}>
              {t("common.back")}
            </button>
          </form>
        )}
      </Sheet>

      <section className="mt-8" aria-labelledby="demo-h">
        <h2 id="demo-h" className="t-label text-ink">
          {t("login.demoTitle")}
        </h2>
        <p className="mt-1 text-sm text-ink-2">{t("login.demoSub")}</p>
        <ul className="sheet ledger mt-3">
          {demos.map((d, i) => (
            <li key={d.uan} className="ledger-row">
              <div className="flex items-start justify-center pt-3.5 text-ink-3">
                <span className="t-num text-sm">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <button
                type="button"
                className="text-left px-4 py-3 tap w-full hover:bg-paper-2 rounded-r-[var(--radius-sheet)]"
                onClick={() => {
                  setUan(d.uan);
                  setPhase("uan");
                  setError(null);
                  document.getElementById(uanId)?.focus();
                }}
              >
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="t-label text-[0.9375rem] text-ink">{d.name}</span>
                  <span className="t-num text-sm text-ink-3 tnum">{d.uan.replace(/(\d{4})(?=\d)/g, "$1 ")}</span>
                </div>
                <div className="text-sm text-ink-2 mt-0.5">{d.note}</div>
              </button>
              <CopyButton value={d.uan} />
            </li>
          ))}
        </ul>
      </section>

      <ActionBar>
        {phase === "uan" ? (
          <PrimaryButton onClick={() => void sendOtp()} disabled={busy}>
            {busy ? t("login.sending") : t("login.sendOtp")}
            <Icon name="arrowRight" size={20} />
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={() => void verify()} disabled={busy}>
            {busy ? t("login.verifying") : t("login.verify")}
            <Icon name="arrowRight" size={20} />
          </PrimaryButton>
        )}
      </ActionBar>
    </>
  );
}

function CopyButton({ value }: { value: string }) {
  const t = useT();
  const [ok, setOk] = useState(false);
  return (
    <button
      type="button"
      className="tap px-3 text-ink-3 hover:text-ink flex items-center justify-center"
      aria-label={`${t("common.copy")} ${value}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setOk(true);
          setTimeout(() => setOk(false), 1200);
        } catch {
          /* clipboard unavailable: nothing to do */
        }
      }}
    >
      {ok ? <Icon name="check" size={18} className="text-tick" title={t("common.copied")} /> : <Icon name="copy" size={18} />}
    </button>
  );
}
