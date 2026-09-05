import { Badge } from "@cloudflare/kumo/components/badge";
import { Empty } from "@cloudflare/kumo/components/empty";
import { Tabs } from "@cloudflare/kumo/components/tabs";
import {
  CheckCircleIcon,
  CrosshairSimpleIcon,
  InfoIcon,
  WarningIcon,
  XCircleIcon,
} from "@phosphor-icons/react";
import { useMemo, useState } from "react";

import type { Analysis, Diagnostic, Severity } from "../analysis/types";
import type { CatalogEntry } from "../catalog";

type Tab = "diagnostics" | "about";

const SEVERITY_ICON: Record<Severity, typeof XCircleIcon> = {
  error: XCircleIcon,
  warning: WarningIcon,
  note: InfoIcon,
};

const SEVERITY_COLOR: Record<Severity, string> = {
  error: "text-kumo-danger",
  warning: "text-kumo-warning",
  note: "text-kumo-info",
};

interface Props {
  analysis: Analysis | null;
  entry: CatalogEntry;
  /** Scrolls the editor to a model id; returns false when it is not found. */
  onLocateId: (id: string) => boolean;
  /** Scrolls the editor to a 1-based line and column. */
  onLocateLine: (line: number, column: number) => void;
}

/**
 * What the analyzer said about the current source: the parse error, the
 * validator's structural errors, or the checker's notes and warnings —
 * each one clickable, landing on the entity it names.
 */
export function DiagnosticsPanel({ analysis, entry, onLocateId, onLocateLine }: Props) {
  const [tab, setTab] = useState<Tab>("diagnostics");

  const counts = useMemo(() => {
    const initial = { error: 0, warning: 0, note: 0 };
    if (!analysis) return initial;
    if (analysis.parse_error) return { ...initial, error: 1 };
    for (const diagnostic of analysis.diagnostics) initial[diagnostic.severity]++;
    return initial;
  }, [analysis]);

  const total = counts.error + counts.warning + counts.note;

  return (
    <div className="flex h-full min-h-0 flex-col bg-kumo-base">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-kumo-hairline px-3 py-1.5">
        <Tabs
          size="sm"
          variant="underline"
          value={tab}
          onValueChange={(value) => setTab(value as Tab)}
          tabs={[
            { value: "diagnostics", label: total ? `Diagnostics (${total})` : "Diagnostics" },
            { value: "about", label: "About this model" },
          ]}
        />
        {tab === "diagnostics" && total > 0 && (
          <div className="flex shrink-0 items-center gap-1">
            {counts.error > 0 && <Badge variant="error">{counts.error}</Badge>}
            {counts.warning > 0 && <Badge variant="warning">{counts.warning}</Badge>}
            {counts.note > 0 && <Badge variant="info">{counts.note}</Badge>}
          </div>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {tab === "about" ? (
          <AboutModel entry={entry} />
        ) : (
          <DiagnosticsList analysis={analysis} onLocateId={onLocateId} onLocateLine={onLocateLine} />
        )}
      </div>
    </div>
  );
}

function DiagnosticsList({
  analysis,
  onLocateId,
  onLocateLine,
}: Pick<Props, "analysis" | "onLocateId" | "onLocateLine">) {
  if (!analysis) {
    return <p className="p-4 text-sm text-kumo-subtle">Waiting for the first analysis…</p>;
  }

  if (analysis.parse_error) {
    const { line, column, message } = analysis.parse_error;
    return (
      <button
        type="button"
        className="flex w-full cursor-pointer items-start gap-2 px-3 py-2.5 text-left hover:bg-kumo-tint"
        onClick={() => line != null && onLocateLine(line, column ?? 1)}
      >
        <XCircleIcon size={15} weight="fill" className="mt-0.5 shrink-0 text-kumo-danger" />
        <span className="min-w-0">
          <span className="flex flex-wrap items-baseline gap-x-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-kumo-danger">parse</span>
            {line != null && (
              <span className="font-mono text-xs text-kumo-subtle">
                line {line}
                {column != null ? `, column ${column}` : ""}
              </span>
            )}
          </span>
          <span className="mt-0.5 block whitespace-pre-wrap break-words text-sm text-kumo-default">{message}</span>
        </span>
      </button>
    );
  }

  if (analysis.diagnostics.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-4">
        <Empty
          size="sm"
          icon={<CheckCircleIcon size={32} weight="fill" className="text-kumo-success" />}
          title={analysis.verified ? "No diagnostics" : "Parses and validates"}
          description={
            analysis.verified
              ? "The model validates and the checker raised nothing beyond its verdicts."
              : "Turn verification on to run the model checker over the declared requirements."
          }
        />
      </div>
    );
  }

  return (
    <ul className="divide-y divide-kumo-hairline">
      {analysis.diagnostics.map((diagnostic, index) => (
        <DiagnosticRow key={`${diagnostic.code}:${diagnostic.subject}:${index}`} diagnostic={diagnostic} onLocateId={onLocateId} />
      ))}
    </ul>
  );
}

function DiagnosticRow({ diagnostic, onLocateId }: { diagnostic: Diagnostic; onLocateId: (id: string) => boolean }) {
  const Icon = SEVERITY_ICON[diagnostic.severity];
  const locatable = diagnostic.subject !== null;

  return (
    <li>
      <div className="flex items-start gap-2 px-3 py-2.5">
        <Icon size={15} weight="fill" className={`mt-0.5 shrink-0 ${SEVERITY_COLOR[diagnostic.severity]}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className={`text-xs font-semibold uppercase tracking-wider ${SEVERITY_COLOR[diagnostic.severity]}`}>
              {diagnostic.phase}
            </span>
            <span className="font-mono text-[11px] text-kumo-inactive">{diagnostic.code}</span>
            {diagnostic.subject && (
              <button
                type="button"
                disabled={!locatable}
                className="group flex items-center gap-1 font-mono text-xs text-kumo-link hover:underline"
                onClick={() => onLocateId(diagnostic.subject!)}
                title={`Find ${diagnostic.subject} in the source`}
              >
                <CrosshairSimpleIcon size={11} className="opacity-0 transition-opacity group-hover:opacity-100" />
                {diagnostic.subject}
              </button>
            )}
          </div>
          <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-kumo-default">{diagnostic.message}</p>
          {diagnostic.evidence.length > 0 && (
            <ul className="mt-1.5 space-y-1 border-l border-kumo-line pl-2.5">
              {diagnostic.evidence.map((evidence, index) => (
                <li key={index} className="text-xs text-kumo-subtle">
                  {evidence.subject && (
                    <button
                      type="button"
                      className="mr-1 font-mono text-kumo-link hover:underline"
                      onClick={() => onLocateId(evidence.subject!)}
                    >
                      [{evidence.subject}]
                    </button>
                  )}
                  <span className="whitespace-pre-wrap break-words">{evidence.message}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </li>
  );
}

function AboutModel({ entry }: { entry: CatalogEntry }) {
  return (
    <div className="space-y-3 p-4">
      <div>
        <h3 className="text-sm font-semibold text-kumo-strong">{entry.title}</h3>
        <p className="mt-0.5 text-sm text-kumo-subtle">{entry.blurb}</p>
      </div>
      <ul className="space-y-1.5">
        {entry.notes.map((note, index) => (
          <li key={index} className="flex gap-2 text-sm text-kumo-default">
            <span className="mt-[7px] size-1 shrink-0 rounded-full bg-kumo-fill" />
            <span>{note}</span>
          </li>
        ))}
      </ul>
      <p className="font-mono text-xs text-kumo-inactive">conseqa/{entry.path}</p>
    </div>
  );
}
