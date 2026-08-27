"use client";

import { Tabs } from "@/components/Tabs";
import { Sheet } from "@/components/Sheet";
import { Icon } from "@/components/Icon";

type MockRow = { name: string; sim: string; real: string };
type Source = { text: string; url: string };

export function HowTabs({
  real,
  mock,
  scale,
  sources,
  labels,
}: {
  real: string[];
  mock: MockRow[];
  scale: string[];
  sources: Source[];
  labels: Record<"real" | "simulated" | "scale" | "sources" | "simulatedWord" | "codexTitle" | "codexBody" | "repo" | "limitsTitle" | "limits" | "poweredBy", string>;
}) {
  return (
    <>
      <Tabs
        tabs={[
          { id: "real", label: labels.real, count: real.length, icon: <Icon name="check" size={14} /> },
          { id: "simulated", label: labels.simulated, count: mock.length, icon: <Icon name="info" size={14} /> },
          { id: "scale", label: labels.scale, count: scale.length, icon: <Icon name="building" size={14} /> },
          { id: "sources", label: labels.sources, count: sources.length, icon: <Icon name="file" size={14} /> },
        ]}
      >
        {(tab) =>
          tab === "real" ? (
            <Sheet ledger>
              <ul>
                {real.map((line, i) => (
                  <li key={i} className="ledger-row">
                    <div className="flex items-start justify-center pt-3.5">
                      <span className="mark mark-tick">
                        <Icon name="check" size={16} strokeWidth={2.5} />
                      </span>
                    </div>
                    <p className="px-4 py-3.5 text-[0.9375rem] text-ink leading-relaxed">{line}</p>
                    <div />
                  </li>
                ))}
              </ul>
            </Sheet>
          ) : tab === "simulated" ? (
            <Sheet ledger>
              <ul>
                {mock.map((m, i) => (
                  <li key={i} className="ledger-row">
                    <div className="flex items-start justify-center pt-3.5">
                      <span className="mark mark-note">
                        <Icon name="info" size={16} />
                      </span>
                    </div>
                    <div className="px-4 py-3.5">
                      <div className="t-label text-[0.9375rem] text-ink">{m.name}</div>
                      <dl className="mt-1.5 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
                        <dt className="text-ink-3">{labels.simulatedWord}</dt>
                        <dd className="text-ink-2">{m.sim}</dd>
                        <dt className="text-ink-3">Real</dt>
                        <dd className="text-ink">{m.real}</dd>
                      </dl>
                    </div>
                    <div />
                  </li>
                ))}
              </ul>
            </Sheet>
          ) : tab === "scale" ? (
            <Sheet ledger>
              <ol>
                {scale.map((line, i) => (
                  <li key={i} className="ledger-row">
                    <div className="flex items-start justify-center pt-4 t-num text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</div>
                    <p className="px-4 py-3.5 text-[0.9375rem] text-ink-2 leading-relaxed">{line}</p>
                    <div />
                  </li>
                ))}
              </ol>
            </Sheet>
          ) : (
            <Sheet ledger>
              <ol>
                {sources.map((s, i) => (
                  <li key={i} className="ledger-row">
                    <div className="flex items-start justify-center pt-4 t-num text-sm text-ink-3">{String(i + 1).padStart(2, "0")}</div>
                    <p className="px-4 py-3.5 text-sm leading-relaxed">
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-ink underline decoration-rule hover:decoration-ink">
                        {s.text}
                      </a>
                    </p>
                    <div />
                  </li>
                ))}
              </ol>
            </Sheet>
          )
        }
      </Tabs>

      <h2 className="t-label text-ink mt-10 mb-2">{labels.codexTitle}</h2>
      <Sheet className="p-5">
        <p className="text-[0.9375rem] text-ink-2 leading-relaxed">{labels.codexBody}</p>
        <a href="https://github.com/rodriguescarson/pf-nikaalo" className="mt-3 inline-flex items-center gap-1.5 t-label text-green underline" target="_blank" rel="noreferrer">
          {labels.repo} <Icon name="arrowRight" size={16} />
        </a>
      </Sheet>
      <h2 className="t-label text-ink mt-8 mb-2">{labels.limitsTitle}</h2>
      <p className="text-sm text-ink-2 leading-relaxed">{labels.limits}</p>
      <p className="mt-8 text-2xs text-ink-3">{labels.poweredBy}</p>
    </>
  );
}
