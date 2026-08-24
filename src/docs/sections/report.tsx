import { Callout, Terms, VerdictBadge } from "../parts";
import type { DocSection } from "./types";

export const report: DocSection = {
  id: "report",
  title: "Reading the report",
  lede: "What the checker hands back, and how to act on it.",
  items: [],
  Body: () => (
    <>
      <Terms
        rows={[
          {
            term: "obligation",
            body: <>One per declared requirement, anchored to the operation, flow, transaction, object, machine, or topic it constrains.</>,
          },
          {
            term: "status",
            body: (
              <>
                <VerdictBadge verdict="proven" /> <VerdictBadge verdict="unknown" />{" "}
                <VerdictBadge verdict="disproven" /> — see <a className="text-kumo-link hover:underline" href="#verdicts">Reading a verdict</a>.
              </>
            ),
          },
          {
            term: "assumptions",
            body: (
              <>
                The declared facts the proof relies on. This is the list to re-read when the implementation
                changes: a proof is only as good as the declarations it used.
              </>
            ),
          },
          {
            term: "evidence",
            body: <>The obstacles the checker hit. On an unknown verdict this names the missing fact — usually the fastest route to making it provable.</>,
          },
          {
            term: "counterexample",
            body: <>For a disproof, the trace that violates the requirement.</>,
          },
          {
            term: "notes",
            body: <>Model-wide warnings belonging to no single obligation — such as a subscription admitting duplicate deliveries while its operation declares no idempotency requirement keyed from it.</>,
          },
        ]}
      />
      <Callout variant="note">
        In the playground, turn <strong>Verify</strong> on and open <strong>Obligations</strong> in the
        visualization. Filter to unknown, expand a card to see its assumptions and evidence, and use{" "}
        <em>focus subject</em> to jump to the entity it constrains.
      </Callout>
    </>
  ),
};
