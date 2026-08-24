import { Callout, Code, P, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const artifacts: DocSection = {
  id: "artifacts",
  title: "Results, responses, and intents",
  lede: "The framework-level artifacts a transaction can establish. They participate atomically in a commit without being application data — and none of them is durable merely by existing.",
  items: [
    { id: "results", title: "Invocation results" },
    { id: "responses", title: "Responses" },
    { id: "intents", title: "Effect intents" },
    { id: "visibility", title: "Artifact visibility" },
  ],
  Body: () => (
    <>
      <Sub id="results" title="Invocation results">
        <Terms
          rows={[
            {
              term: "InvocationResult",
              kind: "structure",
              body: <>A logical transaction artifact shaped by a declared schema.</>,
            },
            {
              term: "establish_invocation_result",
              kind: "structure",
              body: (
                <>
                  Establishes the result the surrounding transaction produces, declaring its value provenance as
                  a derivation.
                </>
              ),
            },
          ]}
        />
        <Callout variant="caution">
          Establishing a result is <strong>semantically separate from transaction idempotency</strong>. It does
          not prevent the enclosing transaction from executing or committing again, and a result is not
          inherently a durable database record. Its availability after a retry comes from one of exactly two
          places: deterministic reconstruction by a naturally replayable transaction, or durable retention by a
          keyed commit.
        </Callout>
      </Sub>

      <Sub id="responses" title="Responses">
        <Terms
          rows={[
            {
              term: "Response",
              kind: "structure",
              body: <>Belongs to one request input and declares the response schema.</>,
            },
            {
              term: "source: invocation_result",
              kind: "structure",
              body: <>The response is taken from a result available to the invocation.</>,
            },
            {
              term: "source: unspecified",
              kind: "structure",
              body: <>No stable replay source is given, so no replay-consistency proof can rest on the response declaration alone.</>,
            },
          ]}
        />
        <P>
          A response sourced from a result may be treated as replay-consistent only when the checker can show
          the same logical result is reconstructed or recovered on retry — which is the response-replay
          obligation below, not something the declaration supplies.
        </P>
      </Sub>

      <Sub id="intents" title="Effect intents">
        <P>
          An intent is a named handle for an effect to be executed later, established as an artifact inside a
          transaction and executed by a subsequent <Code>execute_effect_intent</Code> step. It is how an effect
          becomes recoverable across a crash: the decision to perform it commits atomically with the state that
          justified it.
        </P>
        <Callout variant="caution">
          Recovery is not exactly-once. Recovering the same intent establishes that the effect was{" "}
          <em>decided</em>, never whether it already <em>happened</em> — a crash can hide a prior success, so
          even a recovered intent may be executed again. Duplicate safety at that boundary is the idempotency
          requirement's obligation.
        </Callout>
      </Sub>

      <Sub id="visibility" title="Artifact visibility">
        <P>
          Artifacts a transaction establishes enter the invocation's artifact context on commit, and later steps
          of the flow may consume them. Consumption does not remove an artifact from the context. References
          made <em>within</em> the establishing transaction are exempt from replay analysis by atomicity: they
          and the artifact commit together or not at all.
        </P>
      </Sub>
    </>
  ),
};
