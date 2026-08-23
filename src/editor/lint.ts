// Analyzer output → CodeMirror lint diagnostics.

import type { Diagnostic as LintDiagnostic } from "@codemirror/lint";

import type { Analysis, Diagnostic, Severity } from "../analysis/types";
import { locateId, offsetOf } from "./locate";

const LINT_SEVERITY: Record<Severity, LintDiagnostic["severity"]> = {
  error: "error",
  warning: "warning",
  note: "info",
};

export function lintDiagnostics(source: string, analysis: Analysis | null): LintDiagnostic[] {
  if (!analysis) return [];

  const out: LintDiagnostic[] = [];

  if (analysis.parse_error) {
    const { line, column, message } = analysis.parse_error;
    const from = line != null ? offsetOf(source, line, column ?? 1) : 0;
    const lineEnd = source.indexOf("\n", from);
    out.push({
      from,
      to: Math.max(from, lineEnd < 0 ? source.length : lineEnd),
      severity: "error",
      source: "archspec parser",
      message,
    });
    return out;
  }

  for (const diagnostic of analysis.diagnostics) {
    const range = diagnostic.subject ? locateId(source, diagnostic.subject) : null;
    if (!range) continue;
    out.push({
      from: range.from,
      to: range.to,
      severity: LINT_SEVERITY[diagnostic.severity],
      source: `archspec ${diagnostic.phase}`,
      message: describe(diagnostic),
    });
  }

  return out;
}

function describe(diagnostic: Diagnostic): string {
  const lines = [diagnostic.message];
  for (const evidence of diagnostic.evidence) {
    lines.push(`• ${evidence.subject ? `[${evidence.subject}] ` : ""}${evidence.message}`);
  }
  return lines.join("\n");
}
