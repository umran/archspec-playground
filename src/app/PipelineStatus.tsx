import { Badge } from "@cloudflare/kumo/components/badge";
import { Tooltip } from "@cloudflare/kumo/components/tooltip";
import {
  CheckCircleIcon,
  CircleDashedIcon,
  QuestionIcon,
  WarningCircleIcon,
  XCircleIcon,
} from "@phosphor-icons/react";

import type { AnalysisState } from "../analysis/useAnalysis";

type StageState = "pass" | "fail" | "skipped" | "pending";

interface Stage {
  name: string;
  state: StageState;
  detail: string;
}

/** The three passes the conseqa CLIs run, and how the model fared. */
function pipelineStages(state: AnalysisState, verify: boolean): Stage[] {
  const { analysis } = state;

  if (!analysis) {
    return [
      { name: "parse", state: "pending", detail: "waiting for the model checker to load" },
      { name: "validate", state: "pending", detail: "" },
      { name: "verify", state: "pending", detail: "" },
    ];
  }

  const parsed = analysis.parse_error === null;
  const errors = analysis.diagnostics.filter((d) => d.severity === "error").length;

  return [
    {
      name: "parse",
      state: parsed ? "pass" : "fail",
      detail: parsed
        ? "the YAML deserializes into a model"
        : `line ${analysis.parse_error?.line ?? "?"}: ${analysis.parse_error?.message ?? "parse error"}`,
    },
    {
      name: "validate",
      state: !parsed ? "skipped" : analysis.valid ? "pass" : "fail",
      detail: !parsed
        ? "not attempted: the model does not parse"
        : analysis.valid
          ? "ids are unique and every reference resolves"
          : `${errors} structural ${errors === 1 ? "error" : "errors"}`,
    },
    {
      name: "verify",
      state: analysis.verified ? "pass" : "skipped",
      detail: analysis.verified
        ? "the model checker ran over the declared requirements"
        : !verify
          ? "turned off"
          : "not attempted: verification is meaningful only over a valid model",
    },
  ];
}

const ICONS: Record<StageState, typeof CheckCircleIcon> = {
  pass: CheckCircleIcon,
  fail: XCircleIcon,
  skipped: CircleDashedIcon,
  pending: CircleDashedIcon,
};

const COLORS: Record<StageState, string> = {
  pass: "text-kumo-success",
  fail: "text-kumo-danger",
  skipped: "text-kumo-inactive",
  pending: "text-kumo-inactive",
};

/**
 * Pass/fail marks for parse → validate → verify, plus the tally.
 *
 * Rendered as a fragment, not a row of its own: the items take part in
 * the status strip's own wrapping, so a narrow strip fills each line
 * instead of stacking one nested row per group.
 */
export function PipelineStatus({ state, verify }: { state: AnalysisState; verify: boolean }) {
  const stages = pipelineStages(state, verify);
  const tally = state.analysis?.tally ?? null;

  return (
    <>
      {stages.map((stage) => {
        const Icon = ICONS[stage.state];
        return (
          <Tooltip
            key={stage.name}
            content={stage.detail || `${stage.name} has not run yet`}
            render={
              <span className="flex cursor-default items-center gap-1 text-xs">
                <Icon size={14} weight="fill" className={COLORS[stage.state]} />
                <span className={stage.state === "pending" ? "text-kumo-inactive" : "text-kumo-subtle"}>
                  {stage.name}
                </span>
              </span>
            }
          />
        );
      })}

      {tally?.total === 0 && (
        <Tooltip
          content="Obligations arise from declared requirements; this model declares none."
          render={<Badge variant="neutral">no obligations</Badge>}
        />
      )}

      {tally && tally.total > 0 && (
        <span className="flex items-center gap-1">
          {tally.proven > 0 && (
            <Tooltip
              content="Obligations the checker established from the model's declared facts"
              render={
                <Badge variant="success" icon={<CheckCircleIcon weight="fill" />}>
                  {tally.proven} proven
                </Badge>
              }
            />
          )}
          {tally.unknown > 0 && (
            <Tooltip
              content="Epistemic: the checker could not establish these, typically because a required fact is unspecified or no V1 verifier attempts that family. Never evidence of a violation."
              render={
                <Badge variant="warning" icon={<QuestionIcon weight="bold" />}>
                  {tally.unknown} unknown
                </Badge>
              }
            />
          )}
          {tally.disproven > 0 && (
            <Tooltip
              content="The checker found a counterexample"
              render={
                <Badge variant="error" icon={<WarningCircleIcon weight="fill" />}>
                  {tally.disproven} disproven
                </Badge>
              }
            />
          )}
        </span>
      )}
    </>
  );
}
