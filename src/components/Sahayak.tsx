"use client";

import { useEffect, useRef, useState } from "react";
import type { Intent, Lang } from "@/lib/rules/types";
import { useList, useT } from "@/i18n/useT";
import { Icon } from "./Icon";

type Msg = { role: "you" | "sahayak"; text: string; provider?: "scripted" | "openai" };

type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function getRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: new () => SpeechRecognitionLike; webkitSpeechRecognition?: new () => SpeechRecognitionLike };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/**
 * Sahayak — a bottom sheet that answers from the rules engine. Browser speech in and out (hi-IN / en-IN),
 * no keys needed; labelled honestly as scripted unless an OpenAI provider is configured server-side.
 */
export function Sahayak({ uan, intent, lang }: { uan: string; intent?: Intent; lang: Lang }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceOk, setVoiceOk] = useState<boolean | null>(null);
  const [provider, setProvider] = useState<"scripted" | "openai">("scripted");
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const locale = lang === "hi" ? "hi-IN" : "en-IN";
  const suggestionsList = useList("assistant.suggestions");

  useEffect(() => {
    setVoiceOk(Boolean(getRecognition()) && "speechSynthesis" in window);
  }, []);
  useEffect(() => {
    if (open && msgs.length === 0) setMsgs([{ role: "sahayak", text: t("assistant.answers.greeting"), provider: "scripted" }]);
  }, [open, msgs.length, t]);
  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs]);

  async function ask(q: string) {
    const query = q.trim();
    if (!query || busy) return;
    setInput("");
    setMsgs((m) => [...m, { role: "you", text: query }]);
    setBusy(true);
    try {
      const r = await fetch("/api/mock/assistant", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ uan, intent, query }) });
      const j = (await r.json()) as { text: string; provider: "scripted" | "openai" };
      setMsgs((m) => [...m, { role: "sahayak", text: j.text, provider: j.provider }]);
      setProvider(j.provider);
    } catch {
      setMsgs((m) => [...m, { role: "sahayak", text: t("common.error"), provider: "scripted" }]);
    } finally {
      setBusy(false);
    }
  }

  function listen() {
    const Rec = getRecognition();
    if (!Rec) return;
    if (listening) {
      recRef.current?.stop();
      return;
    }
    const rec = new Rec();
    rec.lang = locale;
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0]?.[0]?.transcript ?? "";
      setListening(false);
      if (text) void ask(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recRef.current = rec;
    setListening(true);
    rec.start();
  }

  function speak(text: string) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = locale;
    const v = window.speechSynthesis.getVoices().find((x) => x.lang.toLowerCase().startsWith(locale.toLowerCase().slice(0, 2)));
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="no-print fixed right-4 bottom-24 z-40 tap inline-flex items-center gap-2 rounded-full bg-ink text-paper pl-3 pr-4 py-2.5 shadow-sheet hover:bg-black"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <Icon name="chat" size={18} />
        <span className="t-label">{t("assistant.open")}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal="true" aria-labelledby="sahayak-title">
          <button type="button" className="absolute inset-0 bg-ink/40" aria-label={t("common.close")} onClick={() => setOpen(false)} />
          <div className="relative w-full sm:max-w-[30rem] bg-sheet rounded-t-[var(--radius-cloth)] sm:rounded-[var(--radius-cloth)] shadow-cloth max-h-[85dvh] flex flex-col">
            <div className="cloth rounded-t-[var(--radius-cloth)] px-4 py-3 flex items-center gap-3">
              <div className="flex-1">
                <h2 id="sahayak-title" className="t-head text-lg leading-tight">
                  {t("assistant.title")}
                </h2>
                <p className="text-xs text-white/80">{t("assistant.sub")}</p>
              </div>
              <button type="button" className="tap px-2 rounded hover:bg-white/10" onClick={() => setOpen(false)} aria-label={t("common.close")}>
                <Icon name="x" size={20} />
              </button>
            </div>
            <div className="px-4 py-1.5 border-b border-rule text-2xs text-ink-3 flex items-center gap-1.5">
              <Icon name="info" size={11} />
              {provider === "openai" ? t("assistant.llm") : t("assistant.scripted")}
            </div>
            <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[12rem]">
              {msgs.map((m, i) => (
                <div key={i} className={`flex ${m.role === "you" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-[var(--radius-cloth)] px-3.5 py-2.5 text-[0.9375rem] leading-relaxed ${m.role === "you" ? "bg-cloth-tint text-ink" : "bg-paper-2 text-ink"}`}>
                    {m.text}
                    {m.role === "sahayak" && voiceOk ? (
                      <button type="button" className="ml-2 inline-flex align-middle text-ink-3 hover:text-ink" aria-label={t("assistant.speak")} onClick={() => speak(m.text)}>
                        <Icon name="speaker" size={16} />
                      </button>
                    ) : null}
                  </div>
                </div>
              ))}
              {busy ? (
                <div className="flex justify-start">
                  <div className="skeleton h-9 w-40" />
                </div>
              ) : null}
            </div>
            {msgs.length <= 1 ? (
              <div className="px-4 pb-2">
                <div className="t-label text-2xs text-ink-3 mb-1.5">{t("assistant.suggested")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestionsList.map((s) => (
                    <button key={s} type="button" onClick={() => void ask(s)} className="rounded-full border border-rule px-3 py-1.5 text-sm text-ink-2 hover:bg-paper-2">
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
            <form
              className="border-t border-rule p-3 flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                void ask(input);
              }}
            >
              <button
                type="button"
                onClick={listen}
                disabled={voiceOk === false}
                className={`tap rounded-full px-3 flex items-center justify-center ${listening ? "bg-cloth text-white" : "text-ink-2 hover:bg-paper-2"} disabled:opacity-40`}
                aria-label={listening ? t("assistant.stop") : t("assistant.listen")}
                aria-pressed={listening}
                title={voiceOk === false ? t("assistant.voiceUnsupported") : undefined}
              >
                <Icon name="mic" size={20} />
              </button>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? t("assistant.listening") : t("assistant.placeholder")}
                aria-label={t("assistant.placeholder")}
                className="flex-1 tap rounded-[var(--radius-sheet)] border border-rule px-3 text-[0.9375rem] text-ink placeholder:text-ink-3"
              />
              <button type="submit" disabled={busy || !input.trim()} className="tap rounded-[var(--radius-cloth)] bg-cloth text-white px-4 t-label disabled:opacity-50">
                {t("assistant.send")}
              </button>
            </form>
            {voiceOk === false ? <p className="px-4 pb-3 text-2xs text-ink-3">{t("assistant.voiceUnsupported")}</p> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
