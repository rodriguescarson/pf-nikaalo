"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { CheckResult, Intent, Preflight, SimulatedAction } from "@/lib/rules/types";
import { useT, useLang } from "@/i18n/useT";
import { Icon } from "@/components/Icon";
import { ActionBar, PrimaryButton } from "@/components/ActionBar";
import { SimulatedTag } from "@/components/SimulatedTag";
import { Sahayak } from "@/components/Sahayak";

type ToolKey = "epfo" | "uidai" | "npci" | "employer" | "history";
const TOOLS: { key: ToolKey; url: string; body?: object; method?: string; provider: string }[] = [
  { key: "epfo", url: "/api/mock/epfo/member/{uan}", method: "GET", provider: "EPFO member record" },
  { key: "uidai", url: "/api/mock/uidai/ekyc", provider: "UIDAI e-KYC" },
  { key: "npci", url: "/api/mock/npci/bank-verify", provider: "NPCI account validation" },
  { key: "employer", url: "/api/mock/epfo/preflight", provider: "Employer filings (ECR)" },
  { key: "history", url: "/api/mock/epfo/preflight", provider: "EPFO claim history" },
];

type ToolState = "idle" | "running" | "done";

/**
 * Sahayak runs the thirteen checks as visible tool calls, then writes the results line by line into the
 * ledger. A failing line is circled in red pencil; a fix strikes it and rewrites it.
 */
export function AgentRun({ uan, intent, memberName, latestEmployer }: { uan: string; intent: Intent; memberName: string; latestEmployer: string }) {
  const t = useT();
  const lang = useLang();
  const router = useRouter();
  const [tools, setTools] = useState<Record<ToolKey, ToolState>>({ epfo: "idle", uidai: "idle", npci: "idle", employer: "idle", history: "idle" });
  const [preflight, setPreflight] = useState<Preflight | null>(null);
  const [revealed, setRevealed] = useState(0);
  const [fixing, setFixing] = useState<string | null>(null);
  const [struck, setStruck] = useState<Record<string, CheckResult>>({});
  const [requested, setRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ran = useRef(false);

  const runPreflight = useCallback(async () => {
    const r = await fetch("/api/mock/epfo/preflight", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan, intent }) });
    if (!r.ok) throw new Error("preflight");
    const j = (await r.json()) as { preflight: Preflight };
    return j.preflight;
  }, [uan, intent]);

  // First run: tool calls in sequence, then the preflight, then reveal lines one by one.
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    (async () => {
      try {
        for (const tool of TOOLS) {
          setTools((s) => ({ ...s, [tool.key]: "running" }));
          const url = tool.url.replace("{uan}", uan);
          await fetch(url, tool.method === "GET" ? undefined : { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan, intent }) });
          setTools((s) => ({ ...s, [tool.key]: "done" }));
        }
        const p = await runPreflight();
        setPreflight(p);
        for (let i = 1; i <= p.checks.length; i++) {
          await new Promise((res) => setTimeout(res, 140));
          setRevealed(i);
        }
      } catch {
        setError(t("common.error"));
      }
    })();
  }, [uan, intent, runPreflight, t]);

  async function applyFix(check: CheckResult, action: SimulatedAction) {
    setFixing(check.id);
    setError(null);
    try {
      const r = await fetch("/api/mock/epfo/fix", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan, action }) });
      if (!r.ok) throw new Error("fix");
      setStruck((s) => ({ ...s, [check.id]: check }));
      const p = await runPreflight();
      setPreflight(p);
      router.refresh();
    } catch {
      setError(t("common.error"));
    } finally {
      setFixing(null);
    }
  }

  async function askEmployer() {
    setFixing("employer");
    try {
      await fetch("/api/mock/employer/doe", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan }) });
      setRequested(true);
    } finally {
      setFixing(null);
    }
  }

  const blocking = preflight?.checks.filter((c) => c.status === "fail" && c.blocking) ?? [];
  const warns = preflight?.warnings.length ?? 0;
  const allRevealed = preflight ? revealed >= preflight.checks.length : false;
  const resultTitle = !preflight
    ? null
    : preflight.canSubmit
      ? warns
        ? t("check.resultTitle.warned", { n: warns })
        : t("check.resultTitle.clear")
      : t(blocking.length === 1 ? "check.resultTitle.blocked" : "check.resultTitle.blockedPlural", { n: blocking.length });

  return (
    <>
      {/* Tool calls */}
      <div className="sheet p-4 mb-4" aria-live="polite">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {!preflight ? <span className="absolute inline-flex h-full w-full rounded-full bg-cloth opacity-60 animate-ping" /> : null}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${preflight ? "bg-tick" : "bg-cloth"}`} />
          </span>
          <span className="t-label text-ink">{t("check.agentIntro")}</span>
        </div>
        <ol className="mt-3 space-y-1.5">
          {TOOLS.map((tool) => (
            <li key={tool.key} className="flex items-center gap-2 text-sm">
              <span className="w-4 h-4 flex items-center justify-center">
                {tools[tool.key] === "done" ? (
                  <Icon name="check" size={14} className="text-tick" />
                ) : tools[tool.key] === "running" ? (
                  <span className="h-2 w-2 rounded-full bg-cloth animate-pulse" />
                ) : (
                  <span className="h-1.5 w-1.5 rounded-full bg-rule" />
                )}
              </span>
              <span className={tools[tool.key] === "idle" ? "text-ink-3" : "text-ink-2"}>{t(`check.tool.${tool.key}`)}</span>
              <span className="ml-auto shrink-0">
                <span className="hidden sm:inline"><SimulatedTag provider={tool.provider} /></span>
                <span className="sm:hidden"><SimulatedTag /></span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {/* Result heading */}
      <div className="mb-3" aria-live="polite" aria-atomic="true">
        {preflight && allRevealed ? (
          <div className="write-in">
            <h2 className={`t-head text-xl ${preflight.canSubmit ? "text-ink" : "mark-x"}`}>{resultTitle}</h2>
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-2">
              <span>{t("check.risk.label")}:</span>
              <RiskMeter level={preflight.rejectionRisk} label={t(`check.risk.${preflight.rejectionRisk}`)} />
            </div>
          </div>
        ) : null}
      </div>

      {/* The ledger of checks */}
      <ol className="sheet ledger" aria-label={t("check.title")} aria-busy={!allRevealed}>
        {(preflight?.checks ?? Array.from({ length: 13 }, () => null)).map((c, i) => {
          if (!c || i >= revealed) {
            return (
              <li key={i} className="ledger-row">
                <div className="flex items-center justify-center pt-4 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
                <div className="px-4 py-4">
                  <div className="skeleton h-3.5 w-2/3" />
                  <div className="skeleton h-3 w-1/2 mt-2" />
                </div>
                <div />
              </li>
            );
          }
          const old = struck[c.id];
          return (
            <li key={c.id} className="ledger-row write-in" style={{ animationDelay: "0ms" }}>
              <div className="relative flex items-start justify-center pt-4">
                <Mark status={c.status} />
              </div>
              <div className="px-4 py-3.5">
                {old && old.status !== c.status ? (
                  <div className="struck text-sm">{t(old.messageKey)}</div>
                ) : null}
                <div className="t-label text-[0.9375rem] text-ink">{t(`check.${c.id}.label`)}</div>
                <p className={`mt-1 text-sm leading-snug ${c.status === "fail" ? "text-ink" : "text-ink-2"}`}>{t(c.messageKey)}</p>
                {c.status !== "pass" && Object.keys(c.evidence).length ? (
                  <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
                    {Object.entries(c.evidence).map(([k, v]) => (
                      <div key={k} className="contents">
                        <dt className="text-ink-3">{k}</dt>
                        <dd className="t-num font-medium text-ink">{v}</dd>
                      </div>
                    ))}
                  </dl>
                ) : null}
                {c.status !== "pass" && c.fix ? (
                  <div className="mt-3 text-sm">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-2">
                      <span>
                        <span className="text-ink-3">{t("check.whoFixes")}:</span>{" "}
                        <span className="text-ink">{t(`common.${c.fix.actor === "member" ? "you" : c.fix.actor}`)}</span>
                      </span>
                      <span>
                        <span className="text-ink-3">{t("check.eta")}:</span>{" "}
                        <span className="text-ink">
                          {c.fix.etaDays[1] === 0 ? t("common.sameDay") : c.fix.etaDays[0] === c.fix.etaDays[1] ? t("common.days", { n: c.fix.etaDays[0] }) : t("common.dayRange", { min: c.fix.etaDays[0], max: c.fix.etaDays[1] })}
                        </span>
                      </span>
                    </div>
                    <details className="mt-1.5">
                      <summary className="cursor-pointer text-ink-2 underline decoration-dotted">{t("check.howToFix")}</summary>
                      <p className="mt-1.5 text-ink-2 leading-relaxed">{t(c.fix.stepsKey)}</p>
                    </details>
                    <div className="mt-2.5 flex flex-wrap gap-2">
                      {c.fix.selfServe && c.fix.simulatedAction ? (
                        <button
                          type="button"
                          disabled={fixing !== null}
                          onClick={() => void applyFix(c, c.fix!.simulatedAction!)}
                          className="tap inline-flex items-center gap-2 rounded-[var(--radius-cloth)] bg-cloth text-white px-4 py-2.5 t-label hover:bg-cloth-deep disabled:opacity-60"
                        >
                          <Icon name="pen" size={16} />
                          {fixing === c.id ? t("check.fixing") : `${t("check.fixNow")} · ${t(`fix.${c.fix.simulatedAction}.label`)}`}
                        </button>
                      ) : c.fix.actor === "employer" ? (
                        <button
                          type="button"
                          disabled={fixing !== null || requested}
                          onClick={() => void askEmployer()}
                          className="tap inline-flex items-center gap-2 rounded-[var(--radius-cloth)] border border-ink/30 text-ink px-4 py-2.5 t-label hover:bg-paper-2 disabled:opacity-60"
                        >
                          <Icon name="building" size={16} />
                          {requested ? t("check.requested") : `${t("check.requestEmployer")} · ${latestEmployer}`}
                        </button>
                      ) : null}
                      {c.fix.actor === "employer" && requested ? (
                        <a
                          className="tap inline-flex items-center gap-2 px-2 text-sm underline text-ink-2"
                          href={`https://wa.me/?text=${encodeURIComponent(`${memberName} (UAN ${uan}) requests ${latestEmployer} to mark the date of exit on the EPFO portal. Simulated request from PF Nikaalo, an independent prototype.`)}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <Icon name="share" size={14} /> {t("check.shareEmployer")}
                        </a>
                      ) : null}
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="pr-4 pt-4 text-ink-3 t-num text-sm">{String(i + 1).padStart(2, "0")}</div>
            </li>
          );
        })}
      </ol>

      {error ? (
        <p role="alert" className="mt-3 text-sm mark-x flex items-center gap-1.5">
          <Icon name="x" size={16} /> {error}
        </p>
      ) : null}

      <Sahayak uan={uan} intent={intent} lang={lang} />

      <ActionBar note={preflight && allRevealed && !preflight.canSubmit ? t("check.cannotContinue") : undefined}>
        <PrimaryButton disabled={!preflight || !allRevealed || !preflight.canSubmit} onClick={() => router.push("/claim")}>
          {t("check.continue")}
          <Icon name="arrowRight" size={20} />
        </PrimaryButton>
      </ActionBar>
    </>
  );
}

/** State as a mark: green-pen tick, red-pencil circled cross, ochre pencil note. */
function Mark({ status }: { status: CheckResult["status"] }) {
  if (status === "pass")
    return (
      <span className="mark-tick">
        <Icon name="check" size={20} strokeWidth={2.5} />
      </span>
    );
  if (status === "warn")
    return (
      <span className="mark-note">
        <Icon name="alert" size={20} />
      </span>
    );
  return (
    <span className="mark-x relative inline-flex h-7 w-7 items-center justify-center">
      <svg className="absolute inset-0" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <path className="circle-in" d="M14 2.5c6.4-.6 11.6 4.6 11.4 11.2C25.2 20.6 20 25.6 13.6 25.4 7.4 25.2 2.4 20 2.6 13.6 2.8 8 7.2 3.4 12.6 2.8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
      <Icon name="x" size={16} strokeWidth={2.5} />
    </span>
  );
}

function RiskMeter({ level, label }: { level: "low" | "medium" | "high"; label: string }) {
  const n = level === "low" ? 1 : level === "medium" ? 2 : 3;
  const color = level === "low" ? "bg-tick" : level === "medium" ? "bg-ochre" : "bg-pencil";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="inline-flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((i) => (
          <span key={i} className={`h-2 w-3 rounded-sm ${i <= n ? color : "bg-rule"}`} />
        ))}
      </span>
      <span className="t-label text-ink">{label}</span>
    </span>
  );
}
