import { Callout, Code, Sub, Terms } from "../parts";
import type { DocSection } from "./types";

export const operations: DocSection = {
  id: "operations",
  title: "Operations",
  lede: "What an operation declares, and the distinction that governs all of it: what the operation may do, against what an invocation actually does.",
  items: [
    { id: "operation-parts", title: "What an operation declares" },
    { id: "flows", title: "Flows and steps" },
    { id: "concurrency", title: "Execution concurrency" },
    { id: "value-refs", title: "Value references" },
  ],
  Body: () => (
    <>
      <Sub id="operation-parts" title="What an operation declares">
        <Terms
          rows={[
            {
              term: "inputs",
              kind: "structure",
              body: <>What starts an invocation. An operation may declare several; a concrete invocation is associated with the one that triggered it.</>,
            },
            {
              term: "effects",
              kind: "structure",
              body: (
                <>
                  <strong>Capabilities, not executions.</strong> A declared effect says the operation may perform
                  it; only a flow step executing it says an invocation does. An effect declared but never
                  executed appears in the visualization as a dashed edge.
                </>
              ),
            },
            {
              term: "transactions",
              kind: "structure",
              body: <><strong>Declarations, not executions.</strong> The same rule: a flow step runs one.</>,
            },
            {
              term: "effect_intents",
              kind: "structure",
              body: <>Named handles for an effect to be executed later, from an artifact established in a transaction.</>,
            },
            {
              term: "invocation_results",
              kind: "structure",
              body: <>Logical artifacts a transaction may establish, shaped by a schema.</>,
            },
            {
              term: "responses",
              kind: "structure",
              body: <>What a request input answers with. A response belongs to one request input.</>,
            },
            {
              term: "requirements",
              kind: "requirement",
              body: <>The obligations the checker is asked to prove.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="flows" title="Flows and steps">
        <Terms
          rows={[
            {
              term: "flows",
              kind: "structure",
              body: (
                <>
                  <strong>Alternative complete paths.</strong> An invocation takes exactly one — which is why the
                  visualization shows them as tabs rather than side by side, and why a proof must hold for every
                  admitted flow rather than for some chosen one.
                </>
              ),
            },
            {
              term: "step: transaction",
              kind: "structure",
              body: <>Runs a declared transaction. Its artifacts enter the invocation's artifact context on commit.</>,
            },
            {
              term: "step: execute_effect",
              kind: "structure",
              body: <>Executes an effect the operation declares directly.</>,
            },
            {
              term: "step: execute_effect_intent",
              kind: "structure",
              body: <>Executes the effect named by an intent artifact established earlier. The route by which a transition's side effects reach the outside world.</>,
            },
            {
              term: "step: response",
              kind: "structure",
              body: <>Resolves the response for the triggering request input. Terminal.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="concurrency" title="Execution concurrency">
        <Callout variant="note">
          This is an implementation fact, not a requirement. It is the fact a serialization proof most often
          rests on — but declaring it does not make it true of the deployment.
        </Callout>
        <Terms
          rows={[
            {
              term: "bounded(n)",
              kind: "guarantee",
              body: (
                <>
                  At most <Code>n</Code> invocations of the deployed operation are simultaneously active, across
                  the operation as a whole. Distinct from subscription lane concurrency. A bound greater than one
                  proves no same-key serialization.
                </>
              ),
            },
            {
              term: "unbounded",
              kind: "guarantee",
              body: <>No finite global cap is declared. Not a claim that unboundedly many run — a statement that the checker may not rely on a cap.</>,
            },
            {
              term: "unspecified",
              kind: "guarantee",
              body: <>No global concurrency fact is available at all.</>,
            },
          ]}
        />
      </Sub>

      <Sub id="value-refs" title="Value references">
        <Terms
          rows={[
            {
              term: "ValueRef",
              kind: "structure",
              body: (
                <>
                  A <Code>ValueSource</Code> plus a field path relative to it. The mechanism linking keys,
                  predicates, and provenance across the whole model.
                </>
              ),
            },
            {
              term: "source: input",
              kind: "structure",
              body: <>A field of the current invocation's input payload.</>,
            },
            {
              term: "source: effect",
              kind: "structure",
              body: <>A field of a declared publication or request payload. External effects have no inspectable payload schema and so supply no field references.</>,
            },
            {
              term: "source: invocation_result",
              kind: "structure",
              body: <>A field of a result available to this invocation.</>,
            },
            {
              term: "source: state_machine_subject",
              kind: "structure",
              body: <>A field of the object a machine governs. Unrestricted in scope: machines are global, and any operation may address the objects they govern.</>,
            },
            {
              term: "source: transaction_read",
              kind: "structure",
              body: <>The result of an earlier read in the same transaction execution, and meaningful only there.</>,
            },
          ]}
        />
        <Callout variant="caution">
          Scope is a coherence rule, not a stability claim. A reference may only name a source the evaluating
          invocations can observe — another operation's input is never "the current invocation's payload". That
          a reference is <em>observable</em> says nothing about whether its value is the same on a retry, which
          is the separate question of replay stability.
        </Callout>
      </Sub>
    </>
  ),
};
